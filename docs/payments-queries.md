# Payments — SQL Query Reference

Queries used by the admin payments dashboard, located in
`server/src/modules/payments/repository.js`.

---

## Table of Contents

1. [Insert Payment](#1-insert-payment)
2. [List Payments (Admin)](#2-list-payments-admin)
   - [Parameters](#parameters)
   - [How optional filters work](#how-optional-filters-work)
   - [Pagination via window function](#pagination-via-window-function)
3. [Payment Summary](#3-payment-summary)

---

## 1. Insert Payment

Creates a single payment row inside a caller-supplied transaction client.
Used by the mock-pay checkout flow.

```sql
INSERT INTO payments (member_id, course_id, amount, currency, status, card_last_four)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *
```

| # | Parameter      | Type      |
|---|----------------|-----------|
| 1 | `memberId`     | `uuid`    |
| 2 | `courseId`     | `uuid`    |
| 3 | `amount`       | `numeric` |
| 4 | `currency`     | `text`    |
| 5 | `status`       | `text`    |
| 6 | `cardLastFour` | `text?`   |

---

## 2. List Payments (Admin)

Fetches a paginated, filterable list of payment records with member, trainer,
and course details joined in a single round-trip. The total row count is
returned alongside the data using a window function, so no second `COUNT`
query is needed.

```sql
SELECT
  p.id,
  p.member_id,
  m.full_name        AS member_name,
  c.course_id,
  c.name             AS course_name,
  c.trainer_id,
  t.full_name        AS trainer_name,
  p.amount,
  p.currency,
  p.status,
  p.card_last_four,
  p.created_at,
  COUNT(*) OVER()    AS total_count
FROM payments p
JOIN users   m ON p.member_id  = m.user_id
JOIN courses c ON p.course_id  = c.course_id
JOIN users   t ON c.trainer_id = t.user_id
WHERE
  ($1::text        IS NULL OR
    m.full_name ILIKE '%' || $1 || '%' OR
    t.full_name ILIKE '%' || $1 || '%' OR
    c.name      ILIKE '%' || $1 || '%' OR
    p.id::text  ILIKE '%' || $1 || '%')
  AND ($2::text        IS NULL OR p.status     = $2)
  AND ($3::uuid        IS NULL OR p.member_id  = $3::uuid)
  AND ($4::uuid        IS NULL OR c.trainer_id = $4::uuid)
  AND ($5::uuid        IS NULL OR p.course_id  = $5::uuid)
  AND ($6::timestamptz IS NULL OR p.created_at >= $6::timestamptz)
  AND ($7::timestamptz IS NULL OR p.created_at <= $7::timestamptz)
ORDER BY p.created_at DESC
LIMIT $8 OFFSET $9
```

### Parameters

| # | Parameter    | Type          | Description                                        |
|---|--------------|---------------|----------------------------------------------------|
| 1 | `search`     | `text?`       | Free-text search across member name, trainer name, course name, and payment ID |
| 2 | `status`     | `text?`       | Exact status match (`success`, `pending`, `failed`, `refunded`) |
| 3 | `memberId`   | `uuid?`       | Filter to a specific member                        |
| 4 | `trainerId`  | `uuid?`       | Filter to a specific trainer                       |
| 5 | `courseId`   | `uuid?`       | Filter to a specific course                        |
| 6 | `dateFrom`   | `timestamptz?`| Inclusive lower bound on `created_at`              |
| 7 | `dateTo`     | `timestamptz?`| Inclusive upper bound on `created_at`              |
| 8 | `limit`      | `int`         | Page size (clamped 1–100, default 20)              |
| 9 | `offset`     | `int`         | Row offset — calculated as `(page - 1) * limit`   |

### How optional filters work

Every nullable parameter uses a short-circuit pattern:

```sql
$n::type IS NULL OR <actual_condition>
```

When the value passed is `NULL`, PostgreSQL evaluates the left side as `TRUE`
and skips the condition entirely, making the filter a no-op. This keeps the
query a single static string while supporting any combination of active
filters.

### Pagination via window function

```sql
COUNT(*) OVER() AS total_count
```

`COUNT(*) OVER()` is a **window function** with no `PARTITION BY` clause,
so it counts all rows that satisfy the `WHERE` clause — not just the current
page. This means:

- The caller receives `total_count` on every row (all values are identical).
- The service layer reads `rows[0].total_count` to compute `totalPages`.
- No second query is needed, saving a round-trip.

---

## 3. Payment Summary

Returns aggregate statistics across **all** payments (not page-scoped).
Used to populate the summary cards at the top of the dashboard.

```sql
SELECT
  COUNT(*)::INT                                      AS total_count,
  COALESCE(SUM(amount), 0)::NUMERIC                  AS total_revenue,
  COUNT(*) FILTER (WHERE status = 'success')::INT    AS paid_count,
  COUNT(*) FILTER (WHERE status = 'pending')::INT    AS pending_count,
  COUNT(*) FILTER (WHERE status = 'failed')::INT     AS failed_count,
  COUNT(*) FILTER (WHERE status = 'refunded')::INT   AS refunded_count
FROM payments
```

### Returned columns

| Column          | Type      | Description                            |
|-----------------|-----------|----------------------------------------|
| `total_count`   | `int`     | Total number of payment records        |
| `total_revenue` | `numeric` | Sum of all amounts; `0` if table empty |
| `paid_count`    | `int`     | Payments with `status = 'success'`     |
| `pending_count` | `int`     | Payments with `status = 'pending'`     |
| `failed_count`  | `int`     | Payments with `status = 'failed'`      |
| `refunded_count`| `int`     | Payments with `status = 'refunded'`    |

`COALESCE(SUM(amount), 0)` guards against `NULL` when the table is empty,
since `SUM` over zero rows returns `NULL` in PostgreSQL.

`COUNT(*) FILTER (WHERE ...)` is a standard SQL aggregate filter — more
efficient than separate subqueries or `CASE WHEN` expressions.

---

## Join diagram

```
payments (p)
  ├── JOIN users   (m)  ON p.member_id  = m.user_id   → member info
  ├── JOIN courses (c)  ON p.course_id  = c.course_id  → course info
  └── via courses  (c)
        └── JOIN users (t) ON c.trainer_id = t.user_id → trainer info
```

The `payments` table has no direct `trainer_id` column; trainer information
is resolved through the `courses` table.
