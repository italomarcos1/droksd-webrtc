"use client"

import { ReactNode, createContext, useCallback, useContext, useState } from "react";
import { IUser } from "~/types";

type UserContextData = {
  users: IUser[];
  setUsers: (data: IUser[]) => void;
  handleSetUsers: (data: IUser[]) => void;
  handleUpdateUserData: (userId: string, data: Partial<IUser>) => void;
  handleRemoveUser: (userId: string) => void;
}

type UserProviderProps = {
  children: ReactNode;
}

const UserContext = createContext<UserContextData>({} as UserContextData)

export function UserProvider({ children }: UserProviderProps) {
  const [users, setUsers] = useState<IUser[]>([])

  const handleSetUsers = useCallback((updatedUsers: IUser[]) => {
    const currentNewUsers = updatedUsers.filter(e => !users.some(u => u.id === e.id))
    
    const combinedUsers = [...users, ...currentNewUsers];

    setUsers(combinedUsers)
  }, [users])

  const handleUpdateUserData = useCallback((userId: string, data: Partial<IUser>) => {
    setUsers(prev => prev.map(u => u.id === userId ? ({...u, ...data}) : u))
  }, [])

  const handleRemoveUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId))
  }, [])

  return (
    <UserContext.Provider
      value={{
        users,
        setUsers,
        handleSetUsers,
        handleUpdateUserData,
        handleRemoveUser
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error("useUser must be used within UserContext provider");
  }

  return context;
}