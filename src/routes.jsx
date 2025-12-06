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
import Profile from './pages/Member/Profile'
import MemberMessages from './pages/Member/Messages'

import TrainerDashboard from './pages/Trainer/Dashboard'
import ManageCourses from './pages/Trainer/ManageCourses'
import CreateCourse from './pages/Trainer/CreateCourse'
import EditCourse from './pages/Trainer/EditCourse'
import Enrollments from './pages/Trainer/Enrollments'
import TrainerMessages from './pages/Trainer/Messages'

import AdminDashboard from './pages/Admin/Dashboard'
import UsersList from './pages/Admin/UsersList'
import CoursesList from './pages/Admin/CoursesList'
import TrainerApproval from './pages/Admin/TrainerApproval'

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

const AppLayout = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <Navbar />
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Outlet />
    </main>
  </div>
)

const ProtectedLayout = ({ allowedRoles, sidebarLinks, sidebarTitle }) => {
  const role = useAuthStore((state) => state.role)

  const isAllowed = role && allowedRoles.includes(role)
  if (!role || !isAllowed) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {sidebarLinks?.length ? <Sidebar title={sidebarTitle} links={sidebarLinks} /> : null}
      <div className="flex-1 space-y-6">
        <Outlet />
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        path: 'member',
        element: <ProtectedLayout allowedRoles={['member']} />,
        children: [
          { index: true, element: <MemberHome /> },
          { path: 'courses', element: <Courses /> },
          { path: 'courses/:courseId', element: <CourseDetail /> },
          { path: 'my-courses', element: <MyCourses /> },
          { path: 'profile', element: <Profile /> },
          { path: 'messages', element: <MemberMessages /> },
        ],
      },
      {
        path: 'trainer',
        element: (
          <ProtectedLayout allowedRoles={['trainer']} sidebarLinks={trainerSidebarLinks} sidebarTitle="Trainer tools" />
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
        path: 'admin',
        element: (
          <ProtectedLayout allowedRoles={['admin']} sidebarLinks={adminSidebarLinks} sidebarTitle="Admin" />
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'users', element: <UsersList /> },
          { path: 'courses', element: <CoursesList /> },
          { path: 'trainer-approvals', element: <TrainerApproval /> },
        ],
      },
      { path: '*', element: <Navigate to="/login" replace /> },
    ],
  },
])

export default router
