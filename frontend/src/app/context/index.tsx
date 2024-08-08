"use client"

import { ReactNode } from "react";

import { AuthProvider } from "./auth";
import { MainProvider } from "./main";
import { UserProvider } from "./users";

type Props = {
  children: ReactNode;
}

export function AppProvider({ children }: Props) {
  return (
    <AuthProvider>
      <MainProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </MainProvider>
    </AuthProvider>
  )
}