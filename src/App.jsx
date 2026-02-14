import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import router from './routes'
import { useAuthStore } from './store/useAuthStore'
import * as authService from './services/authService'
import { queryKeys } from './lib/queryKeys'

const App = () => {
  const theme = useAuthStore((state) => state.theme)
  const setHydrationLoading = useAuthStore((state) => state.setHydrationLoading)
  const setHydratedAuth = useAuthStore((state) => state.setHydratedAuth)
  const authReady = useAuthStore((state) => state.authReady)
  const authLoading = useAuthStore((state) => state.authLoading)

  const authQuery = useQuery({
    queryKey: queryKeys.authMe,
    queryFn: ({ signal }) => authService.getMe({ signal }),
    retry: 0,
    staleTime: 30 * 1000,
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    if (authQuery.isPending) {
      if (!authLoading || authReady) {
        setHydrationLoading()
      }
      return
    }

    if (authQuery.isError) {
      setHydratedAuth(null)
      return
    }

    setHydratedAuth(authQuery.data || null)
  }, [
    authLoading,
    authQuery.data,
    authQuery.isError,
    authQuery.isPending,
    authReady,
    setHydratedAuth,
    setHydrationLoading,
  ])

  return <RouterProvider router={router} />
}

export default App
