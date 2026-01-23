import { AppRouter } from './routes'
import { ThemeProvider, ToastProvider } from '@shared/lib'

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
