export interface UserData {
  id: number;
  name: string;
  remoteDisplayStream: MediaStream | null;
  remoteMicStream: MediaStream | null;
  isMe: boolean;
}
