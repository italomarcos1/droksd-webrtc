import { useEffect, useState } from "react"
import { useAuth } from "~/context/auth"

import { ConnectionStatus, useMain } from "~/context/main"
import { api } from "~/lib/axios"

export function UserInfo() {
  const { connected } = useMain()
  const { user } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("loading")

  useEffect(() => {
    if (connectionStatus !== connected && connectionStatus !== "connected" && !!user) {
      setConnectionStatus(connected)

      api.post("/connected", { user })
    }
  }, [connectionStatus, connected, user])

  return (
    <div className="bg-gradient-to-b from-transparent to-white/5 flex items-center gap-2 p-4 border-t border-t-appleBlack">
      <img
        src={user.image ?? ""}
        alt=""
        className="w-8 h-8 rounded-full object-cover border border-white/25 animate-slide-fade-in-up"
      />
      <div className="flex flex-col animate-slide-fade-in-up">
        <strong className="line-clamp-1">{user.name}</strong>
        <p className="text-[0.75rem] line-clamp-1 leading-none text-white/50">
          {user.email}
        </p>
      </div>
    </div>
  )
}