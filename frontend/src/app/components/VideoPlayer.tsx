import { CameraOffIcon } from "lucide-react";
import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { useAuth } from "~/context/auth";
import { useUser } from "~/context/users";

type Props = {
  stream: MediaStream;
  peerId?: string;
  style?: CSSProperties;
}

export function VideoPlayer({ stream, peerId = "", style = {}, ...rest }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const { users } = useUser()

  const {
    userCameraIsOn,
    user
  } = useMemo(() => {
    const currentUser = users.find(u => u.id === peerId)

    return {
      userCameraIsOn: currentUser?.cameraOn,
      user: currentUser
    };
  }, [users, peerId])

  useEffect(() => {
    if (videoRef.current)
      videoRef.current.srcObject = userCameraIsOn ? stream : null;
  }, [userCameraIsOn, stream]);

  return (
    <div
      className="relative flex-1 !rounded-xl"
      style={style}
      {...rest}
    >
      <video
        ref={videoRef}
        className="w-full h-full !rounded-xl border border-white/10"
        autoPlay
        muted={true}
        style={style}
      />
      {!userCameraIsOn && 
        <div className="absolute w-full h-full top-0 left-0 rounded-xl bg-customBlack flex-1 flex flex-col items-center justify-center gap-1 font-medium">
          <img src={user?.image ?? ""} alt="" className="rounded-full h-24 w-24 rounded-full" />
          {user?.name ?? "Usuário"}
          <CameraOffIcon size={16} className="absolute top-3 right-3" />
        </div>
      }
    </div>
  );
}