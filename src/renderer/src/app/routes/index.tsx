import { createHashRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@app/layouts/RootLayout'
import { HomePage } from '@pages/home'
import { SongListPage } from '@pages/song-list'
import { SongCreatePage } from '@pages/song-create'
import { SongDetailPage } from '@pages/song-detail'
import { WorshipPage } from '@pages/worship'
import { PresentationPage } from '@pages/presentation'
import { SettingsPage } from '@pages/settings'

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
        path: 'songs',
        element: <SongListPage />
      },
      {
        path: 'songs/create',
        element: <SongCreatePage />
      },
      {
        path: 'songs/:id',
        element: <SongDetailPage />
      },
      {
        path: 'worship',
        element: <WorshipPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
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
