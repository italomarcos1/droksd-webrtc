export type IUser = {
  id: string;
  name: string;
  email: string;
  image: string;
  roomId?: string;
  cameraOn?: boolean;
}

export type IRoom = {
  id: string;
  name: string;
}

export type CustomPeer = {
  id: string;
  roomId: string;
  stream: MediaStream;
  type: "cam" | "screen";
}

export type IMessage = {
  id: string;
  content: string;
  type: "message" | "image";
  user: IUser;
  userId: string;
  createdAt: string;
}

export type IUserData = Record<string, IUser>

export type ITranscription = {
  id: string;
  userId: string;
  content: string;
}