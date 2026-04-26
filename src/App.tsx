import { Provider } from 'react-redux'
import AppRouter from './app/router/AppRouter'
import { store } from './app/store'

export default function App() {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  )
}
