"use client"

import { useCallback, useEffect, useState } from "react"
import Peer from "peerjs"
import { CalendarPlusIcon, Loader2Icon, LogOutIcon, Users2Icon } from "lucide-react"

import { Rooms } from "~/components/Rooms"
import { Room } from "~/components/Room"
import { useAuth } from "~/context/auth"
import { useMain } from "~/context/main"
import { useUser } from "~/context/users"
import { api } from "~/lib/axios"
import { signOut } from "next-auth/react"
import { redirect } from "next/navigation"

export default function Home() {
  const { user, session, handleSetSession } = useAuth()
  const { setConnected } = useMain()
  const { users } = useUser()

  const [stream, setStream] = useState<MediaStream>(null as unknown as MediaStream);
  const [peer, setPeer] = useState<Peer | null>(null as unknown as Peer);
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");

  const handleLeaveRoom = useCallback(async () => {
    setPeer(null)
    setRoomId("")
    setRoomName("")
    peer?.destroy()
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null as unknown as MediaStream)

    await api.post("/leave-room", { userId: user.id, roomId })
  }, [peer, stream, user, roomId])

  const handleJoinRoom = useCallback(async (roomId: string, roomName: string) => {
    try {
      const userIsOnRoom = users.find(u => u.id === user.id)

      if (userIsOnRoom && userIsOnRoom.roomId) {
        await handleLeaveRoom()
      }

      const userStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      await api.post("/join-room", {
        roomId,
        userId: user.id,
      });

      setPeer(new Peer(user.id, { // @ts-ignore
        port: process.env.NEXT_PUBLIC_PEER_PORT,
        host: process.env.NEXT_PUBLIC_PEER_HOST,
        path: "/peerjs"
      }))
      
      setStream(userStream)
      setRoomId(roomId)
      setRoomName(roomName)
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  }, [user, users, setStream, setRoomId, handleLeaveRoom])

  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetch(process.env.NEXT_PUBLIC_AUTH_URL!, {
          method: "GET"
        }).then(r => r.json())
  
        if (!data) {
          signOut();
          redirect('/');
        }

        handleSetSession(data)
        setConnected("connected")
      } catch (err) {
        console.log("err", err)
      }
    })()
  }, [])

  return !!session ? (
    <main className="relative grid grid-cols-[15rem_auto_18.75rem] pt-10 w-full min-h-screen items-center light:!bg-[#000] dark:!bg-[#000] px-5">
      <header className="fixed top-0 left-0 w-full max-xl:px-4">
        <div className="w-full max-w-desktop mx-auto flex items-center justify-between py-5">
          <img src="/Logo.svg" alt="" className="h-[1.5rem]" title="Droksd" />
          <button
            title="Sair"
            onClick={() => signOut()}
            className="p-3 border border-white/15 rounded-full duration-200 hover:bg-white/10"
          >
            <LogOutIcon size={16} />
          </button>
        </div>
      </header>
      {user &&
        <Rooms
          handleJoinRoom={handleJoinRoom}
          handleLeaveRoom={handleLeaveRoom}
        />
      }
      {roomId && peer ?
        <Room
          roomName={roomName}
          peer={peer}
          stream={stream}
          roomId={roomId}
          handleLeaveRoom={handleLeaveRoom}
        /> :
        <div className="w-full h-full bg-black flex flex-col items-center justify-center">
          <img src="/Logo.svg" alt="" className="w-20" />
          <h3 className="title-gradient text-4xl mt-4 text-center">Bem-vindo ao Droksd</h3>
          <p className="font-light text-center mt-2 text-base leading-5 tracking-tight">Clique em uma das salas (menu à esquerda)<br/>para entrar em uma chamada</p>
        </div>
      }
      {!roomId &&
        <aside className="w-full h-[90%] rounded-lg bg-gradient-to-b from-white/5 to-black p-3 gap-2 border-2 border-white/5">
          <div className="flex items-center gap-1 mb-2">
            <Users2Icon size={20} />
            <p className="font-medium">
              Usuários online ({users.length})
            </p>
          </div>
          {users.map(u => 
            <p key={u.id} className="font-light tracking-wide text-white/75 text-[0.875rem]">
              {u.email}
            </p>
          )}
        </aside>
      }
    </main>
  ) : 
  <div className="flex flex-col items-center justify-center h-full w-full gap-2">
    <Loader2Icon className="text-white animate-spin" />
    <p>Carregando...</p>
  </div>
}