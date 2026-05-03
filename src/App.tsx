import { Provider } from 'react-redux'
import { ThemeProvider } from './app/providers/ThemeProvider'
import AppRouter from './app/router/AppRouter'
import { store } from './app/store'

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </Provider>
  )
}
