/* eslint-disable react-refresh/only-export-components */
import { useState, useCallback } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { useAuthStore } from './store/useAuthStore'

import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'

import MemberHome from './pages/Member/Home'
import Courses from './pages/Member/Courses'
import CourseDetail from './pages/Member/CourseDetail'
import MyCourses from './pages/Member/MyCourses'
import MemberMessages from './pages/Member/Messages'

import TrainerDashboard from './pages/Trainer/Dashboard'
import ManageCourses from './pages/Trainer/ManageCourses'
import CreateCourse from './pages/Trainer/CreateCourse'
import EditCourse from './pages/Trainer/EditCourse'
import Enrollments from './pages/Trainer/Enrollments'
import TrainerMessages from './pages/Trainer/Messages'
import TrainerProposal from './pages/Trainer/Proposal'

import AdminDashboard from './pages/Admin/Dashboard'
import UsersList from './pages/Admin/UsersList'
import CoursesList from './pages/Admin/CoursesList'
import TrainerApproval from './pages/Admin/TrainerApproval'

/* ── sidebar link configs ── */
const memberSidebarLinks = [
  { label: 'Home', to: '/member', end: true },
  { label: 'Browse Courses', to: '/member/courses' },
  { label: 'My Courses', to: '/member/course' },
  { label: 'Messages', to: '/member/messages' },
]

const trainerSidebarLinks = [
  { label: 'Dashboard', to: '/trainer', end: true },
  { label: 'Courses', to: '/trainer/courses' },
  { label: 'Create Course', to: '/trainer/courses/create' },
  { label: 'Enrollments', to: '/trainer/enrollments' },
  { label: 'Messages', to: '/trainer/messages' },
]

const adminSidebarLinks = [
  { label: 'Dashboard', to: '/admin', end: true },
  { label: 'Users', to: '/admin/users' },
  { label: 'Courses', to: '/admin/courses' },
  { label: 'Trainer Approvals', to: '/admin/trainer-approvals' },
]

/* ── app shell — no sidebar (auth pages, guest) ── */
const AppLayout = () => (
  <div className="min-h-screen text-slate-900 dark:text-slate-100">
    <Navbar />
    <main className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 md:px-6 md:pt-8">
      <Outlet />
    </main>
  </div>
)

const HomeRedirect = () => {
  const role = useAuthStore((state) => state.role)
  const authReady = useAuthStore((state) => state.authReady)

  if (!authReady) {
    return (
      <div className="status-muted">
        Loading session...
      </div>
    )
  }

  if (role) {
    return <Navigate to={`/${role}`} replace />
  }

  return <Navigate to="/login" replace />
}

/* ── protected shell with integrated sidebar ── */
const ProtectedLayout = ({ allowedRoles, sidebarLinks, sidebarTitle }) => {
  const role = useAuthStore((state) => state.role)
  const authReady = useAuthStore((state) => state.authReady)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  /* close mobile menu on route change */
  const closeMobile = useCallback(() => setMobileMenuOpen(false), [])
  const toggleMobile = useCallback(() => setMobileMenuOpen((v) => !v), [])

  if (!authReady) {
    return (
      <div className="min-h-screen text-slate-900 dark:text-slate-100">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 md:px-6 md:pt-8">
          <div className="status-muted">Loading session...</div>
        </main>
      </div>
    )
  }

  const isAllowed = role && allowedRoles.includes(role)
  if (!role || !isAllowed) {
    return <Navigate to="/login" replace />
  }

  const hasSidebar = Array.isArray(sidebarLinks) && sidebarLinks.length > 0

  if (hasSidebar) {
    return (
      <div className="min-h-screen text-slate-900 dark:text-slate-100">
        {/* top bar spans full width */}
        <Navbar
          onMobileMenuToggle={toggleMobile}
          mobileMenuOpen={mobileMenuOpen}
        />

        {/* sidebar + content grid */}
        <div className="lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
          <Sidebar
            title={sidebarTitle}
            links={sidebarLinks}
            mobileOpen={mobileMenuOpen}
            onMobileClose={closeMobile}
          />

          <main className="min-h-[calc(100vh-3.5rem)] min-w-0 px-4 pb-10 pt-5 md:px-6 lg:px-10 lg:pt-7 xl:px-12">
            <div className="mx-auto w-full max-w-5xl space-y-6 md:space-y-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    )
  }

  /* no sidebar — plain centered content */
  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 md:px-6 md:pt-8">
        <div className="space-y-6 md:space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  {
    path: '/member',
    element: (
      <ProtectedLayout
        allowedRoles={['member']}
        sidebarLinks={memberSidebarLinks}
        sidebarTitle="Member"
      />
    ),
    children: [
      { index: true, element: <MemberHome /> },
      { path: 'course', element: <MyCourses /> },
      { path: 'courses', element: <Courses /> },
      { path: 'courses/:courseId', element: <CourseDetail /> },
      { path: 'my-courses', element: <Navigate to="/member/course" replace /> },
      { path: 'messages', element: <MemberMessages /> },
    ],
  },
  {
    path: '/trainer/proposal',
    element: <ProtectedLayout allowedRoles={['member', 'trainer']} />,
    children: [{ index: true, element: <TrainerProposal /> }],
  },
  {
    path: '/trainer',
    element: (
      <ProtectedLayout
        allowedRoles={['trainer']}
        sidebarLinks={trainerSidebarLinks}
        sidebarTitle="Trainer Tools"
      />
    ),
    children: [
      { index: true, element: <TrainerDashboard /> },
      { path: 'courses', element: <ManageCourses /> },
      { path: 'courses/create', element: <CreateCourse /> },
      { path: 'courses/:courseId/edit', element: <EditCourse /> },
      { path: 'enrollments', element: <Enrollments /> },
      { path: 'messages', element: <TrainerMessages /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedLayout
        allowedRoles={['admin']}
        sidebarLinks={adminSidebarLinks}
        sidebarTitle="Admin"
      />
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <UsersList /> },
      { path: 'courses', element: <CoursesList /> },
      { path: 'trainer-approvals', element: <TrainerApproval /> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])

export default router
