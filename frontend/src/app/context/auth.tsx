// @ts-nocheck
"use client"

import { ReactNode, createContext, useCallback, useContext, useState } from "react";
import { Loader2Icon } from "lucide-react";

import { IUser } from "~/types";
import { useCookies } from "react-cookie";
import { Session } from "next-auth";

type AuthContextData = {
  session: Session;
  user: IUser;
  handleSetSession: (data: Session) => void;
}

type AuthProviderProps = {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [_, setCookie] = useCookies(["droksd-user"]);

  const [user, setUser] = useState(null as unknown as IUser)
  const [session, setSession] = useState(null as unknown as Session)

  const handleSetSession = useCallback((session: Session) => {
    setSession(session);
    setUser(session.user)
    
    setCookie("droksd-user", session.user.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 3 // 3 days
    })
  }, [setCookie])

  return (
    <AuthContext.Provider value={{ user, session, handleSetSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthContext provider");
  }

  return context;
}