// @ts-nocheck
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Peer, { DataConnection, MediaConnection } from "peerjs";

import { CustomPeer, IMessage, ITranscription, IUser, IUserData } from "~/types";
import { useMain } from "~/context/main";

import { VideoPlayer } from "./VideoPlayer";
import {
  CameraIcon,
  CameraOffIcon,
  CaptionsIcon,
  CaptionsOffIcon,
  ImageIcon,
  PhoneOffIcon,
  ScreenShareIcon,
  ScreenShareOffIcon,
  SendHorizonalIcon
} from "lucide-react";
import { api } from "~/lib/axios";
import { useAuth } from "~/context/auth";
import { useUser } from "~/context/users";

import { isEmpty } from "~/utils/validation";

type Props = {
  peer: Peer;
  stream: MediaStream;
  roomId: string;
  roomName: string;
  handleLeaveRoom: () => void;
}

export function Room({ peer, stream, roomId, roomName, handleLeaveRoom }: Props) {
  const { source } = useMain()
  const { user } = useAuth()
  const { users, handleUpdateUserData } = useUser()

  const screenRef = useRef<HTMLVideoElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [peers, setPeers] = useState<CustomPeer[]>([])
  const [screenStream, setScreenStream] = useState<MediaStream>(null as unknown as MediaStream)
  const [sharedScreenConnections, setSharedScreenConnections] = useState<MediaConnection[]>([])
  
  const [messages, setMessages] = useState<IMessage[]>([])

  const [isSharingScreen, setIsSharingScreen] = useState("")

  const [dataConnections, setDataConnections] = useState<DataConnection[]>([]);

  const [listening, setListening] = useState(true);
  const [transcript, setTranscript] = useState<ITranscription[]>([]);

  const userCameraIsOn = useMemo(() => {
    const currentUser = users.find(u => u.id === user.id)

    return !!currentUser?.cameraOn;
  }, [user, users])

  const handleCameraStatus = useCallback(async () => {
    await api.post("/camera-status", {
      userId: user.id,
      roomId,
      cameraOn: !userCameraIsOn
    })
  }, [userCameraIsOn, user, roomId])

  //? criar novo peer?
  const handleShareScreen = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })
  
      const calls = peers.map(p => 
        peer.call(p.id, screenStream, {
          metadata: { type: "screen" }
        })
      )
  
      setScreenStream(screenStream)
      setSharedScreenConnections(calls)
  
      if (screenRef.current) {
        screenRef.current.srcObject = screenStream;
        screenRef.current.addEventListener('loadedmetadata', () =>
          screenRef.current?.play()
        );
      }
  
      setIsSharingScreen(peer.id)
    } catch (err) {
      console.log("err", err)
      setScreenStream(null as unknown as MediaStream)
      setSharedScreenConnections([])
      
      if (screenRef.current)
        screenRef.current.srcObject = null;
    }
  }, [peer, peers])
  
  const handleStopSharingScreen = useCallback(() => {
    if (!!sharedScreenConnections.length) {
      sharedScreenConnections.map(c => c.close())
    }

    api.post("/stop-sharing-screen", { roomId })

    screenStream?.getTracks().forEach((track) => track.stop());
    
    if (screenRef.current) {
      screenRef.current.srcObject = null;
    }
    
    setScreenStream(null as unknown as MediaStream)
    setSharedScreenConnections([]);
    setIsSharingScreen("")
  }, [screenStream, sharedScreenConnections, roomId])

  const handleLeaveRoomWhileSharingScreen = useCallback(() => {
    if (screenStream) {
      handleStopSharingScreen()
    }

    handleLeaveRoom()
  }, [handleLeaveRoom, screenStream, handleStopSharingScreen])

  const handleUserLeftRoomWhileSharingScreen = useCallback((userId: string) => {
    if (isSharingScreen !== userId) return;
    
    if (screenRef.current)
      screenRef.current.srcObject = null

    setIsSharingScreen("")
  }, [isSharingScreen])

  const handleSendImage = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const arrayBuffer = reader.result;
      dataConnections.forEach((conn) => {
        conn.send({ type: "image", image: arrayBuffer, name: file.name });
      });
    };
    reader.readAsArrayBuffer(file);
    
    const url = URL.createObjectURL(file)
    setMessages(prev => [...prev, {
      id: file.name,
      content: url,
      type: "image",
      userId: user.id,
      createdAt: new Date().toLocaleTimeString({ hourCycle:"h24" }, { timeStyle: "short" })
    } as IMessage])
  } ,[dataConnections, user]);

  const handleSendTranscript = useCallback((transcript: ITranscription) => {
    dataConnections.forEach((conn) =>
      conn.send({ type: "transcript", transcript: {...transcript, userId: user.id } })
    );
  }, [user, dataConnections])

  const handleSendMessage = useCallback(() => {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current)
    const content = formData.get("message") as string

    if (isEmpty(content)) return;

    api.post("/send-message", {
      userId: user.id,
      roomId,
      content
    })

    formRef.current.reset()
  }, [user, roomId])

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    // @ts-ignore
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        
        handleSendImage(file)
      }
    }
  }, [handleSendImage])

  const usersData = useMemo<IUserData>(() => {
    return users.reduce((acc: IUserData, { id, ...rest }) => {
      acc[id] = { id, ...rest };
      
      return acc as IUserData;
    }, {});
  }, [users]);

  const chatMessages = useMemo<IMessage[]>(() => {
    if (!messages.length) return messages;
    
    const message = messages[messages.length - 1];
    const user = users.find(u => u.id === message.userId)

    if (!user) return messages;
    
    let updatedMessages = [...messages, message]

    const uniqueMap = new Map();

    updatedMessages.forEach(item => {
      if (!uniqueMap.has(item.id))
        uniqueMap.set(item.id, item)
    });
  
    const filteredMessages = Array.from(uniqueMap.values());

    return filteredMessages as IMessage[]
  }, [users, messages])

  const transcriptions = useMemo<ITranscription[]>(() => {
    if (!transcript.length) return transcript;
    
    const lastTranscript = transcript[transcript.length - 1];
    const user = users.find(u => u.id === lastTranscript.userId)

    if (!user) return transcript;
    
    let updatedTranscript = [...transcript, lastTranscript]

    const uniqueMap = new Map();

    updatedTranscript.forEach(item => {
      if (!uniqueMap.has(item.id))
        uniqueMap.set(item.id, item)
    });
  
    const filteredTranscript = Array.from(uniqueMap.values());

    return filteredTranscript as ITranscription[]
  }, [users, transcript])

  useEffect(() => {
    if (!peer || !stream || !source || !roomId) return;

    source.addEventListener(`user-connected-${roomId}`, (event) => {
      const data = JSON.parse(event.data);
      const peerId = data.userId

      const call = peer.call(peerId, stream, {
        metadata: { type: "cam" }
      });

      if (!call) return;
      
      call.on("stream", (peerStream) => {
        const joinedUserData: CustomPeer = {
          id: peerId,
          stream: peerStream,
          type: "cam",
          roomId
        }

        setPeers(prev => !prev.some(p => p.id === peerId) ?
          [...prev, joinedUserData] :
          prev
        )
      });

      const conn = peer.connect(peerId);
      conn.on("data", (data) => {
        if (data.type === "image") {
          const blob = new Blob([data.image as Uint8Array], { type: "image/png" })
          const url = URL.createObjectURL(blob)
          
          setMessages(prev => [...prev, {
            id: data.name,
            content: url,
            type: "image",
            userId: peerId,
            createdAt: new Date().toLocaleTimeString({ hourCycle:"h24" }, { timeStyle: "short" })
          } as IMessage])
        } else {
          setTranscript((prev) => [...prev, data.transcript]);

          setTimeout(() => {
            setTranscript((prev) => prev.filter(t => t.id !== data.transcript.id));
          }, 5000);
        }
      });

      setDataConnections(prev => !prev.some(p => p.peer === peerId) ?
        [...prev, conn] :
        prev
      )
    });

    peer.on("call", (call) => {
      call.answer(stream);
      call.on("stream", (peerStream) => {
        const joinedUserData: CustomPeer = {
          id: call.peer,
          stream: peerStream,
          type: call.metadata.type,
          roomId
        }

        if (call.metadata.type === "cam") {
          setPeers(prev => !prev.some(p => p.id === call.peer) ?
            [...prev, joinedUserData]
            : prev
          )
        } else {
          if (screenRef.current) {

            setIsSharingScreen(call.peer) // TODO: trocar para id do usuário, identificar quem está compartilhando e evitar conflito

            screenRef.current.srcObject = peerStream;
            screenRef.current.addEventListener('loadedmetadata', () =>
              screenRef.current?.play()
            );
          }
        }
      });
    });

    peer.on("connection", (conn) => {
      conn.on("data", (data) => {
        if (data.type === "image") {
          const blob = new Blob([data.image as Uint8Array], { type: "image/png" })
          const url = URL.createObjectURL(blob)
          
          setMessages(prev => [...prev, {
            id: data.name,
            content: url,
            type: "image",
            userId: conn.peer,
            createdAt: new Date().toLocaleTimeString({ hourCycle:"h24" }, { timeStyle: "short" })
          } as IMessage])
        } else {
          setTranscript((prev) => [...prev, data.transcript]);

          setTimeout(() => {
            setTranscript((prev) => prev.filter(t => t.id !== data.transcript.id));
          }, 5000);
        }
      });

      setDataConnections(prev => !prev.some(p => p.peer === conn.peer) ?
        [...prev, conn] :
        prev
      )
    });

    source.addEventListener(`user-disconnected-${roomId}`, (event) => {
      const data = JSON.parse(event.data);

      const peerId = data.userId;
      setPeers(prev => prev.filter(u => u.id !== peerId))
    });

    source.addEventListener("user-disconnected", (event) => {
      const data = JSON.parse(event.data);

      const peerId = data.userId;
      setPeers(prev => prev.filter(u => u.id !== peerId))
    });

    source.addEventListener(`user-camera-${roomId}`, (event) => {
      const data = JSON.parse(event.data);
      handleUpdateUserData(data.userId, data.data)
    });
  }, []);

  useEffect(() => {
    if (!peer || !screenStream || !source || !roomId) return;

    source.addEventListener(`user-connected-${roomId}`, (event) => {
      const data = JSON.parse(event.data);
      const peerId = data.userId

      const call = peer.call(peerId, screenStream, {
        metadata: { type: "screen" }
      });

      if (!call) return;
    });
  }, [screenStream]);

  useEffect(() => {
    if (!peer || !isSharingScreen || !source || !roomId) return;

    source.addEventListener(`user-left-room-while-sharing-screen-${roomId}`, (event) => {
      const data = JSON.parse(event.data);
      const { userId } = data

      handleUserLeftRoomWhileSharingScreen(userId)
    });

    source.addEventListener(`user-stop-share-screen-${roomId}`, () => {
      setIsSharingScreen("")
    });
  }, [isSharingScreen]);

  useEffect(() => {
    if (!peer || !source || !roomId) return;

    source.addEventListener(`new-message-${roomId}`, (event) => {
      const data = JSON.parse(event.data);
      
      setMessages(prev => [...prev, data as IMessage])
    });
  }, [peer, roomId]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Browser does not support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onstart = () => {
      // console.log('Reconhecimento de fala iniciado');
    };

    recognition.onend = () => {
      // console.log('Reconhecimento de fala finalizado');
      if (listening) {
        recognition.start(); // Reinicia o reconhecimento se ainda estiver em modo de escuta
      }
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          const newTranscript = { id: crypto.randomUUID(), content: transcriptPart, userId: user.id };
          setTranscript((prev) => [...prev, newTranscript] as IMessage[]);
          handleSendTranscript(newTranscript as IMessage)

          setTimeout(() => {
            setTranscript((prev) => prev.filter(t => t.id !== newTranscript.id));
          }, 5000);
        } else {
          interimTranscript += transcriptPart;
        } 
      }
      // console.log('Transcrição Interina:', interimTranscript);
    };

    recognition.onerror = (event) => {
      // console.error('Erro no reconhecimento de fala', event.error);
    };

    if (listening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
    };
  }, [listening, handleSendTranscript, user]);

  return (
    <div className="w-full flex h-[90%] items-center">
      <div className="relative w-full flex flex-col items-center justify-between p-8 h-full max-h-screen bg-gradient-to-b from-appleBlack to-white/5 rounded-lg mx-2">
        <div className="text-3xl flex items-center">
          <h1 className="title-gradient animate-slide-fade-in-up">{roomName}</h1>
        </div>
        <video
          ref={screenRef}
          className="!rounded-xl border border-white/10"
          autoPlay
          muted={true}
          style={{ height: isSharingScreen ? "calc(90% - 16rem)" : 0 }}
        />
        <section
          className="flex-1 bg-transparent items-center justify-center flex flex-wrap gap-8"
          style={{
            maxHeight: isSharingScreen ? "10rem" : "none",
            flexWrap: isSharingScreen ? "nowrap" : "wrap",
            overflowX: isSharingScreen ? "auto" : "visible"
          }}
        >
          {stream &&
            <VideoPlayer
              stream={stream}
              peerId={user.id}
              style={{ maxHeight: isSharingScreen ? "10rem" : "none" }}
            />
          }
          {peers.map((peer) => (
            <VideoPlayer
              key={peer.id}
              peerId={peer.id}
              stream={peer.stream}
              style={{ maxHeight: isSharingScreen ? "10rem" : "none" }}
            />
          ))}
        </section>
        <div
          className="grid grid-cols-3 gap-4 h-16"
          style={{ marginTop: isSharingScreen ? 0 : "1rem" }}
        >
          <button
            title={userCameraIsOn ? "Desligar câmera" : "Ligar câmera"}
            className="bg-white/15 border border-white/10 grid place-items-center w-16 h-16 rounded-full animate-slide-fade-in-up duration-100 hover:bg-white/20 hover:border-white/5 hover:scale-105"
            onClick={handleCameraStatus}
          >
            {userCameraIsOn ?
              <CameraOffIcon size={24} /> :
              <CameraIcon size={24} />
            }
          </button>
          <button
            title={
              !!isSharingScreen && isSharingScreen !== user.id ? "Um usuário já está compartilhando a tela" :
              isSharingScreen ? "Parar de compartilhar tela" : "Compartilhar a tela"
            }
            className="bg-white/15 border border-white/10 grid place-items-center w-16 h-16 rounded-full disabled:opacity-60 !disabled:cursor-not-allowed animate-slide-fade-in-up duration-100 hover:bg-white/20 hover:border-white/5 hover:scale-105"
            onClick={() => isSharingScreen ? handleStopSharingScreen() : handleShareScreen()}
            disabled={!!isSharingScreen && isSharingScreen !== user.id}
          >
            {isSharingScreen === user.id ?
              <ScreenShareOffIcon size={24} /> :
              <ScreenShareIcon size={24} />
            }
          </button>
          <button
            title="Sair da chamada"
            className="bg-red-500 border border-red-400 grid place-items-center w-16 h-16 rounded-full animate-slide-fade-in-up duration-100 hover:bg-red-600 hover:border-white/5 hover:scale-105"
            onClick={handleLeaveRoomWhileSharingScreen}
          >
            <PhoneOffIcon size={24} />
          </button>
          <div className="absolute bottom-10 left-10 flex flex-col gap-2 ">
            {transcriptions.map(t => {
              const userData = usersData[t.userId];
              return (
                <div key={t.id} className="flex self-start items-center gap-2 max-w-96">
                  <img
                    src={!!userData ? userData.image ?? "" : ""}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-white/25"
                  />
                  <p className="flex self-start px-3 py-1 rounded-3xl border border-white/15 bg-white/10 text-[0.875rem] backdrop-blur-md caption-animation">
                    {t.content}
                  </p>
                </div>
              )
            })}
            <button
              className="flex items-center gap-2 px-4 duration-200 hover:bg-white/10 rounded-full py-2"
              onClick={() => setListening(p => !p)}
            >
              {listening ? <CaptionsOffIcon size={20} /> : <CaptionsIcon size={20} />}
              <p className="text-[0.9375rem] leading-none font-medium">{listening ? "Desativar" : "Ativar"} legendas</p>
            </button>
          </div>
        </div>
      </div>
      <aside className="absolute flex flex-col top-14 right-5 w-[18.75rem] h-[90%] rounded-lg bg-gradient-to-b from-white/5 to-black py-3 pl-3 pr-1 gap-2 border-2 border-white/5">
        <h3>Mensagens</h3>
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          {chatMessages.map(m => {
            const userData = usersData[m.userId];
    
            return (
              <div key={m.id} className="flex flex-col p-3 gap-1 rounded-md border border-white/10 duration-200 bg-appleBlack/50 hover:bg-white/5">
                <div className="flex items-center gap-2">
                  <img
                    src={!!userData ? userData.image ?? "" : ""}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover border border-white/25"
                  />
                  <p className="line-clamp-1 text-[0.875rem] font-bold line">{!!userData ? userData.name ?? "Usuário" : "Usuário"}</p>
                  <p className="line-clamp-1 text-[0.625rem] text-white/50">{m.createdAt}</p>
                </div>
                {m.type === "image" ?
                  <img src={m.content} className="h-[12.5rem] w-80 rounded-lg mt-2 object-cover" /> :
                  <p className="text-[0.875rem]">{m.content}</p>
                }
              </div>
            )
          })}
        </div>
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex mt-auto items-center border border-white/10 rounded-md animate-slide-fade-in-up"
        >
          <div className="relative inline-block !cursor-pointer">
            <input
              className="absolute inset-0 w-full h-full opacity-0 !cursor-pointer"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0])
                  handleSendImage(e.target.files[0])
              }}
            />
            <button
              type="button"
              className="!cursor-pointer h-12 grid place-items-center px-3 rounded-l-md"
            >
              <ImageIcon size={18} className="!cursor-pointer" />
            </button>
          </div>
          <input
            name="message"
            className="bg-transparent outline-none w-full h-12 rounded-md border-b border-b-white/10 text-[0.9375rem] px-3 text-white placeholder:text-white/50"
            placeholder="Envie uma mensagem"
            onPaste={handlePaste}
            autoComplete="off"
          />
          <button className="h-12 grid place-items-center px-3 rounded-r-md duration-200 hover:bg-white/10">
            <SendHorizonalIcon size={18} />
          </button>
        </form>
      </aside>
    </div>
  )
}