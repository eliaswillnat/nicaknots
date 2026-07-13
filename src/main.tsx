import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './fonts/fonts.css';

const AdminAccessGate = lazy(() => import('./AdminAccessGate.tsx').then((module) => ({ default: module.AdminAccessGate })))
const AdminPage = lazy(() => import('./AdminPage.tsx').then((module) => ({ default: module.AdminPage })))

const path = window.location.pathname.replace(/\/+$/, '') || '/'
const isAdmin = path === '/admin'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <AdminAccessGate>
          {(handleSignOut) => <AdminPage onSignOut={handleSignOut} />}
        </AdminAccessGate>
      </Suspense>
    ) : <App />}
  </StrictMode>,
)
