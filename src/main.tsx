import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App'
import { EventNotificationProvider } from './context/EventNotificationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EventNotificationProvider>
      <App />
    </EventNotificationProvider>
  </StrictMode>,
)