import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './routes'
import { useAuthStore } from './store/useAuthStore'

const App = () => {
  const theme = useAuthStore((state) => state.theme)
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    hydrateAuth()
  }, [hydrateAuth])

  return <RouterProvider router={router} />
}

export default App
