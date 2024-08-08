"use client"

import { ReactNode } from "react";
import { signOut } from "next-auth/react";
import { AppProvider } from "~/context";
import { LogOutIcon } from "lucide-react";

type Props = {
  children: ReactNode;
}

export default function HomeLayout({ children }: Props) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  )
}