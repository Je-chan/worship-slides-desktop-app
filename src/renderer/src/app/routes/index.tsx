import { createHashRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@app/layouts/RootLayout'
import { HomePage } from '@pages/home'
import { SongCreatePage } from '@pages/song-create'
import { PresentationPage } from '@pages/presentation'

const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'songs/create',
        element: <SongCreatePage />
      }
    ]
  },
  {
    path: '/presentation',
    element: <PresentationPage />
  }
])

export function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />
}
