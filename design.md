# 🚀 RYZ Shortlink - React + Vite Setup Guide

Panduan lengkap untuk setup React dengan Vite, Tailwind CSS, dan Supabase.

---

## 🎯 Why React + Vite?

✅ **Faster Development**: Hot module replacement (HMR) super cepat
✅ **Smaller Bundle**: Vite menggunakan ES modules natively
✅ **Better DX**: Lightning-fast startup time
✅ **Production Optimized**: Automatic code splitting & tree shaking
✅ **No Bloat**: Tidak ada Next.js overhead, pure React

---

## 📋 Prerequisites

- Node.js 18+
- npm/pnpm/yarn
- Supabase account
- Text editor (VS Code)

---

## ⚡ Step 1: Create React Project with Vite

### Option A: Using Vite CLI (Recommended)

```bash
# Create new project
npm create vite@latest ryz-shortlink -- --template react

# Navigate to folder
cd ryz-shortlink

# Install dependencies
npm install
```

### Option B: If Project Already Started

Jika sudah ada project Next.js:

```bash
# Delete next.js related files
rm -rf .next next.config.ts

# Delete Next.js dependencies dari package.json
# Lalu update dengan React setup di Step 2
```

---

## 📦 Step 2: Install Dependencies

Copy dan update `package.json` dengan dependencies berikut:

```bash
npm install
```

File `package.json` akan berisi:

```json
{
  "name": "ryz-shortlink",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "@supabase/supabase-js": "^2.38.0",
    "@tanstack/react-query": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.263.1",
    "react-hook-form": "^7.45.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "sweetalert2": "^11.7.0",
    "zustand": "^4.4.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "date-fns": "^2.30.0",
    "recharts": "^2.10.0",
    "qrcode.react": "^1.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0",
    "typescript": "^5.1.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.24",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.48.0",
    "eslint-plugin-react": "^7.32.0"
  }
}
```

---

## 🎨 Step 3: Configure Vite

Buat file `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
})
```

---

## 🎯 Step 4: Configure Tailwind CSS

### 4a. Install Tailwind

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4b. Update `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        accent: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        error: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

### 4c. Create `src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component classes */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-primary {
    @apply btn bg-primary-600 text-white hover:bg-primary-700;
  }

  .btn-secondary {
    @apply btn bg-slate-200 text-slate-900 hover:bg-slate-300;
  }

  .btn-outline {
    @apply btn border-2 border-primary-600 text-primary-600 hover:bg-primary-50;
  }

  .card {
    @apply rounded-lg bg-white p-6 shadow-sm border border-slate-200;
  }

  .input {
    @apply rounded-lg border border-slate-300 bg-white px-4 py-2 text-base placeholder-slate-400 transition-colors duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100;
  }

  .label {
    @apply block text-sm font-medium text-slate-700;
  }

  .badge {
    @apply inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold;
  }

  .badge-primary {
    @apply badge bg-primary-100 text-primary-900;
  }
}
```

---

## 📁 Step 5: Create Folder Structure

```bash
mkdir -p src/{pages,components,lib,hooks,services,store,utils,types,styles,config}
```

Struktur akhir:

```
src/
├── pages/                    # Page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── DashboardPage.jsx
│   ├── LinksPage.jsx
│   ├── AnalyticsPage.jsx
│   └── NotFoundPage.jsx
│
├── components/               # Reusable components
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Badge.jsx
│   │   ├── Loader.jsx
│   │   └── Toast.jsx
│   │
│   ├── forms/
│   │   ├── LoginForm.jsx
│   │   ├── SignupForm.jsx
│   │   └── CreateLinkForm.jsx
│   │
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   └── DashboardLayout.jsx
│   │
│   └── dashboard/
│       ├── LinkCard.jsx
│       ├── AnalyticsChart.jsx
│       └── StatsCard.jsx
│
├── lib/
│   ├── supabase.js          # Supabase client
│   ├── api.js               # API client
│   └── constants.js
│
├── hooks/
│   ├── useAuth.js
│   ├── useLinks.js
│   ├── useAnalytics.js
│   └── useFetch.js
│
├── services/
│   ├── authService.js
│   ├── linkService.js
│   ├── analyticsService.js
│   └── teamService.js
│
├── store/
│   ├── authStore.js
│   ├── uiStore.js
│   └── settingsStore.js
│
├── utils/
│   ├── utils.js
│   ├── validators.js
│   ├── formatters.js
│   └── api-helpers.js
│
├── types/
│   └── index.js
│
├── styles/
│   ├── index.css             # Tailwind + custom
│   └── animations.css
│
├── config/
│   ├── routes.js
│   └── constants.js
│
├── App.jsx                   # Root component
├── main.jsx                  # Entry point
└── index.html
```

---

## 🔧 Step 6: Setup React Router

### 6a. Create `src/config/routes.js`

```javascript
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import LinksPage from '@/pages/LinksPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const routes = [
  // Public routes
  {
    path: '/',
    element: HomePage,
    public: true,
  },
  {
    path: '/login',
    element: LoginPage,
    public: true,
  },
  {
    path: '/signup',
    element: SignupPage,
    public: true,
  },

  // Protected routes
  {
    path: '/dashboard',
    element: DashboardPage,
    protected: true,
  },
  {
    path: '/links',
    element: LinksPage,
    protected: true,
  },
  {
    path: '/analytics',
    element: AnalyticsPage,
    protected: true,
  },

  // Catch-all
  {
    path: '*',
    element: NotFoundPage,
  },
]
```

### 6b. Create `src/App.jsx`

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { routes } from '@/config/routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
  )
}

export default App
```

### 6c. Create `src/main.jsx`

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## 🔐 Step 7: Setup Supabase Client

### 7a. Create `src/lib/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 7b. Create `.env.local`

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=http://localhost:3000
```

**Important**: Prefiks `VITE_` adalah wajib untuk environment variables di Vite!

---

## 🪝 Step 8: Create Custom Hooks

### 8a. Create `src/hooks/useAuth.js`

```javascript
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const signUp = useCallback(async (email, password, fullName) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (authError) throw authError
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    signUp,
    signIn,
    signOut,
    isLoading,
    error,
  }
}
```

### 8b. Create `src/hooks/useSession.js`

```javascript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useSession() {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  return { session, isLoading, error }
}
```

---

## 📄 Step 9: Create Example Pages

### 9a. Create `src/pages/HomePage.jsx`

```javascript
import { Link } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import Button from '@/components/ui/Button'

export default function HomePage() {
  const { session, isLoading } = useSession()

  if (isLoading) return <div>Loading...</div>

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary-400">
              RYZ
            </Link>
            <div className="flex gap-4">
              {session ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 py-32 text-center sm:px-6 lg:px-8">
        <h1 className="mb-6 text-5xl font-bold text-white">
          Shorten URLs with <span className="text-primary-400">Power</span>
        </h1>
        <p className="mb-8 text-xl text-slate-300">
          Create, manage, and analyze short links with enterprise-grade features
        </p>
        <div className="flex justify-center gap-4">
          {session ? (
            <Link to="/dashboard">
              <Button variant="primary" size="lg">
                Go to Dashboard →
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <Button variant="primary" size="lg">
                  Get Started Free →
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
```

### 9b. Create `src/pages/LoginPage.jsx`

```javascript
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [formError, setFormError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      setFormError('Email and password required')
      return
    }

    const result = await signIn(formData.email, formData.password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setFormError(error || 'Login failed')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-400">
            RYZ
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">Welcome Back</h1>
        </div>

        <div className="card bg-slate-800 border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input w-full mt-2"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input w-full mt-2"
                disabled={isLoading}
              />
            </div>

            {(formError || error) && (
              <div className="rounded bg-red-900/20 p-3 text-sm text-red-300 border border-red-500/30">
                {formError || error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading || !formData.email || !formData.password}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-400 hover:text-primary-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
```

---

## ▶️ Step 10: Run Project

```bash
# Start development server
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview
```

Aplikasi akan berjalan di **http://localhost:3000** ✅

---

## 📝 Environment Variables

`VITE_` prefix adalah **wajib** di Vite!

```env
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=http://localhost:3000
```

Akses di React:
```javascript
const url = import.meta.env.VITE_SUPABASE_URL
```

---

## 🎯 Project Structure Comparison

### Next.js (yang lama)
```
- Built-in routing dengan file system
- Server components support
- API routes otomatis
- SSR/SSG out-of-box
```

### React + Vite (yang baru)
```
- React Router untuk routing
- Pure client-side
- Vite API routes dengan `/api` folder (optional)
- SPA with client-side hydration
```

---

## ✅ Checklist

- [ ] Project dibuat dengan `npm create vite@latest`
- [ ] Dependencies sudah diinstall
- [ ] Vite config sudah dibuat
- [ ] Tailwind CSS sudah di-setup
- [ ] Folder structure sudah dibuat
- [ ] React Router sudah dikonfigurasi
- [ ] Supabase client sudah setup
- [ ] Environment variables (.env.local) sudah dibuat
- [ ] Jalankan `npm run dev` dan test di browser
- [ ] Homepage loading dengan baik

---

## 🚀 Next Steps

1. Copy semua file dari output ke folder `src/`
2. Update import paths (dari `@/lib/` ke `@/lib/`)
3. Create remaining pages & components
4. Implement link management features
5. Add analytics dashboard
6. Deploy ke Vercel/Netlify

---

## 📚 Useful Links

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [React Query](https://tanstack.com/query/latest)

---

**Siap dengan React.js? Let's go! 🚀**