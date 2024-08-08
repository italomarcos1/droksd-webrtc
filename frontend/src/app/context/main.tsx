"use client"

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth";
import { useCookies } from "react-cookie";

export type ConnectionStatus = "connected" | "disconnected" | "loading"

type MainContextData = {
  source: EventSource;
  connected: ConnectionStatus;
  setConnected: (data: ConnectionStatus) => void;
}

type MainProviderProps = {
  children: ReactNode;
}

const MainContext = createContext<MainContextData>({} as MainContextData)

export function MainProvider({ children }: MainProviderProps) {
  const [connected, setConnected] = useState<ConnectionStatus>("loading")
  const [source, setSource] = useState<EventSource>(null as unknown as EventSource)
  
  const { session, user } = useAuth()

  const [_, setCookie] = useCookies(["droksd-user"]);

  useEffect(() => {
    const source = new EventSource(process.env.NEXT_PUBLIC_EVENTS_URL!, { withCredentials: true })

    setSource(source)

    source.addEventListener("message", (e) => {      
      if (e.data.includes("connected"))
        setConnected("connected")
    });
  }, [])

  return (
    <MainContext.Provider value={{ source, connected, setConnected }}>
      {children}
    </MainContext.Provider>
  )
}

export function useMain() {
  const context = useContext(MainContext)

  if (!context) {
    throw new Error("useMain must be used within MainContext provider");
  }

  return context;
}