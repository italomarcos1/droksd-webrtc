import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { nextAuthOptions } from "~/lib/next-auth"
import { CaptionsIcon, CastIcon, Code2Icon, GithubIcon, GroupIcon, MessageSquareMoreIcon, SatelliteDishIcon, Users2Icon } from "lucide-react"
import { signIn } from "next-auth/react"
import { SignInButton } from "./components/SignInButton"

export default async function App() {
  const session = await getServerSession(nextAuthOptions)
  
  if (session) {
    redirect("/home")
  }

  return (
    <main className="relative flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-b from-[#000] to-customBlack">
      <div className="flex border border-white/10 rounded-md border-b-2 animate-pop-in-up">
        <div className="flex flex-col gap-2 items-center justify-center px-10 py-10 rounded-l-md bg-gradient-to-r from-white/5 via-appleBlack to-transparent">
          <h1 className="title-gradient text-4xl leading-none mb-5">Droksd</h1>
          <SignInButton provider="google">
            <img src="/google.svg" className="w-5 h-5" />
            <p className="font-medium tracking-tight">Login com Google</p>
          </SignInButton>
          <SignInButton provider="github" disabled className="!cursor-not-allowed">
            <GithubIcon size={22} />
            <p className="font-medium tracking-tight">Login com Github</p>
          </SignInButton>
        </div>
        <div className="flex flex-col gap-5 items-center justify-center relative h-[20rem] w-72 object-cover rounded-r-md bg-[url('/abc.jpg')] bg-center bg-cover">
          <span className="flex items-center gap-2 font-light text-[0.875rem]">
            <Users2Icon size={22} strokeWidth={1} /> Chamadas de vídeo
          </span>
          <span className="flex items-center gap-2 font-light text-[0.875rem]">
            <CaptionsIcon size={22} strokeWidth={1} /> Legendas automáticas
          </span>
          <span className="flex items-center gap-2 font-light text-[0.875rem]">
            <CastIcon size={22} strokeWidth={1} /> Compartilhamento de tela
          </span>
          <span className="flex items-center gap-2 font-light text-[0.875rem]">
            <MessageSquareMoreIcon size={22} strokeWidth={1} /> Chat (com imagens)
          </span>
          <span className="flex items-center gap-2 font-light text-[0.875rem]">
            <SatelliteDishIcon size={22} strokeWidth={1} /> WebRTC + Server-sent Events
          </span>
          <span className="flex items-center gap-2 font-light text-[0.875rem]">
            <Code2Icon size={22} strokeWidth={1} /> NextJS + Express + Prisma
          </span>
        </div>
      </div>
      <p
        className="absolute bottom-10 font-light"
      >
        Feito 100% por
        <a
          href="https://www.linkedin.com/in/italomarcos1/"
          rel="noreferrer noopener" 
          target="_blank"
          className="font-medium title-gradient"
        >
          &nbsp;Italo Marcos&nbsp;
        </a>
        (open to work)
      </p>
    </main>
  )
}