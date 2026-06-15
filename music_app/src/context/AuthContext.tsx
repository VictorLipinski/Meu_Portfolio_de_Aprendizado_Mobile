import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { User } from '@/types'

// ─── Storage keys ─────────────────────────────────────────────────────────────
const USERS_KEY = '@noomi:users'
const SESSION_KEY = '@noomi:session'  // stores the userId of the current session

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthContextData {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextData>({} as AuthContextData)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session on app start
  const loadSession = useCallback(async () => {
    try {
      const [sessionRaw, usersRaw] = await Promise.all([
        AsyncStorage.getItem(SESSION_KEY),
        AsyncStorage.getItem(USERS_KEY),
      ])
      if (sessionRaw && usersRaw) {
        const userId: string = JSON.parse(sessionRaw)
        const users: User[] = JSON.parse(usersRaw)
        const found = users.find((u) => u.id === userId) ?? null
        setUser(found)
      }
    } catch {
      // if anything fails, stay logged out
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  // ── Helpers ──────────────────────────────────────────────────────────────────
  async function getUsers(): Promise<User[]> {
    const raw = await AsyncStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  }

  async function saveUsers(users: User[]): Promise<void> {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  async function saveSession(userId: string): Promise<void> {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userId))
  }

  // ── signIn ───────────────────────────────────────────────────────────────────
  async function signIn(email: string, password: string): Promise<void> {
    const trimmedEmail = email.trim().toLowerCase()
    const users = await getUsers()
    const found = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    )
    if (!found) {
      throw new Error('E-mail ou senha incorretos.')
    }
    await saveSession(found.id)
    setUser(found)
  }

  // ── signUp ───────────────────────────────────────────────────────────────────
  async function signUp(name: string, email: string, password: string): Promise<void> {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()
    const users = await getUsers()

    const emailExists = users.some((u) => u.email.toLowerCase() === trimmedEmail)
    if (emailExists) {
      throw new Error('Este e-mail já está cadastrado.')
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: trimmedName,
      email: trimmedEmail,
      password,   // local-only: no hashing needed for this demo
      createdAt: new Date().toISOString(),
    }

    await saveUsers([...users, newUser])
    await saveSession(newUser.id)
    setUser(newUser)
  }

  // ── signOut ──────────────────────────────────────────────────────────────────
  async function signOut(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextData {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
