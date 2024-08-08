"use client"

import { ButtonHTMLAttributes, ReactNode } from "react";
import { signIn } from "next-auth/react"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  provider: "google" | "github";
  className?: string;
}

export function SignInButton({ children, provider, className = "", ...rest }: Props) {
  return (
    <button
      className={`bg-white/5 border border-white/5 backdrop-blur-sm w-full px-5 py-3 rounded-md flex items-center gap-2 duration-200 hover:bg-white/10 ${className}`}
      onClick={() => signIn(provider)}
      {...rest}
    >
      {children}
    </button>
  )
}