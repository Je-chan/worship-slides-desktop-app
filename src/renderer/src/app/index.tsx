import { AppRouter } from './routes'
import { ThemeProvider } from '@shared/lib'

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  )
}

export default App
