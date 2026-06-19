import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { routes } from '@/config/routes'

import { useState, useEffect } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
})

function App() {
  const [isBanned, setIsBanned] = useState(false)

  useEffect(() => {
    // 1. Generate or retrieve Device ID
    let deviceId = localStorage.getItem('ryz_device_id')
    if (!deviceId) {
      deviceId = 'DEV-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      localStorage.setItem('ryz_device_id', deviceId)
    }
    console.log("Your Device ID is:", deviceId) // Biar user bisa cek device id-nya

    // 2. Check with our new backend security system
    const checkSecurity = async () => {
      try {
        const apiUrl = import.meta.env.DEV ? 'http://localhost:5000' : 'https://api.ryz.my.id'
        
        // Cek apakah hacker mencoba akses URL berbahaya di frontend
        const currentPath = window.location.pathname.toLowerCase();
        const maliciousPatterns = ['.env', 'wp-admin', 'wp-login', 'phpmyadmin', 'config.php', '.git'];
        const isMalicious = maliciousPatterns.some(pattern => currentPath.includes(pattern));

        if (isMalicious) {
          // Lapor ke Backend untuk Auto-Ban IP dan Device ini selamanya!
          await fetch(`${apiUrl}/api/report-malicious`, {
            method: 'POST',
            headers: { 'x-device-id': deviceId }
          });
          setIsBanned(true);
          return;
        }

        // Kalau aman, cek status ban biasa
        const res = await fetch(`${apiUrl}/api/check-security`, {
          headers: {
            'x-device-id': deviceId
          }
        })
        if (res.status === 403) {
          setIsBanned(true)
        }
      } catch (e) {
        console.error('Security check failed to connect, continuing anyway', e)
      }
    }
    checkSecurity()
  }, [])

  if (isBanned) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#ff4444', fontSize: '3rem' }}>Access Denied</h1>
          <p>Your IP or Device has been banned from accessing this site.</p>
        </div>
      </div>
    )
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.element />}
              />
            ))}
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
