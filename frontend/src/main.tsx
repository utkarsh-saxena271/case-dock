import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { store } from './store/store.ts'
import AuthInitializer from './components/AuthInitializer.tsx'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <AuthInitializer>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthInitializer>
  </Provider>
)