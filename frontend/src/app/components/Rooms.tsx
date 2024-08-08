import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "~/context/users";

import { UserInfo } from "./UserInfo";
import { useAuth } from "~/context/auth";
import { CopyPlusIcon, LogOutIcon, PhoneCallIcon, PhoneOffIcon } from "lucide-react";
import { api } from "~/lib/axios";
import { IRoom } from "~/types";
import { useMain } from "~/context/main";

type Props = {
  handleJoinRoom: (roomId: string, roomName: string) => void;
  handleLeaveRoom: () => void;
}

export function Rooms({ handleJoinRoom, handleLeaveRoom }: Props) {
  const { users, handleSetUsers, handleRemoveUser } = useUser()
  const { user } = useAuth()
  const { source } = useMain()
  
  const [rooms, setRooms] = useState<IRoom[]>([])

  const userIsOnRoom = useMemo(() => {
    const currentUser = users.find(u => u.id === user.id)

    return currentUser?.roomId;
  }, [user, users])

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/rooms")

      setRooms(data)
    })()
  }, [])

  useEffect(() => {
    if (!source) return;
    source.addEventListener("user-connected", (event) => {
      const data = JSON.parse(event.data);
      handleSetUsers(data)
    });

    source.addEventListener("user-disconnected", (event) => {
      const data = JSON.parse(event.data);
      handleRemoveUser(data.userId)
      // setUsers
    });
  }, [source]);

  return (
    <div className="flex flex-col w-full h-[90%] rounded-lg bg-gradient-to-b from-white/5 to-black border-2 border-white/5">
      <div className="w-full h-full flex flex-col p-3">
        <h3 className="mb-2">Salas</h3>
        {rooms.map((r, i) => 
          <div
            key={r.id} className="flex flex-col mb-2 animate-stagger-slide-in"
            style={{ animationDuration: `${(i+1) * 0.375}s` }}
          >
            <div
              className={`bg-[#1F1F1F] py-2 px-2 flex items-center justify-between duration-200 hover:bg-white/15 disabled:!cursor-not-allowed ${users.some(u => u.roomId === r.id) ? "rounded-t-md rounded-b-none border-b border-b-white/5 " : "rounded-md"}`}
            >
              <p className="text-left text-[0.9375rem] line-clamp-1 tracking-tighter">{r.name}</p>
              {!!userIsOnRoom && userIsOnRoom === r.id ?
                <button
                  onClick={handleLeaveRoom}
                  title="Sair da chamada"
                  className="duration-100 hover:scale-110"
                >
                  <LogOutIcon size={16} className="text-white/50" />
                </button> : 
                <button
                  disabled={!!userIsOnRoom && userIsOnRoom === r.id}
                  onClick={() => handleJoinRoom(r.id, r.name)}
                  title="Entrar na chamada"
                  className="duration-100 hover:scale-110"
                >
                  <CopyPlusIcon size={16} className="text-white/50" />
                </button>
              }
            </div>
            {users.some(u => u.roomId === r.id) &&
              users.filter(user => user.roomId === r.id).map(usr => 
                <div key={usr.id} className="user-in-room">
                  <img
                    src={usr.image ?? ""}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover border border-white/25"
                  />
                  <p className="line-clamp-1 text-[0.875rem] font-light">{usr.name}</p>
                </div>
              )
            }
          </div>
        )}
      </div>
      <UserInfo />
    </div>
  )
}