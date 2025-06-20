import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const Provider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  return context
}
