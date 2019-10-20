import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from 'react';
import styled from 'styled-components';
import H from 'history';
import { match } from 'react-router-dom';
import Room from '~/connector/Room';
import AutoSpliter from '~/components/AutoSpliter';
import { useToggle } from '~/hooks';

interface UserData {
  id: number;
  name: string;
  stream: MediaStream | null;
  isMe: boolean;
}

interface Props {
  match: match<{ id: string }>;
  location: H.Location<H.LocationState>;
}

export default ({ match }: Props) => {
  const roomId = match.params.id;
  const [mode, setMode] = useState(0);
  const [userName, setUserName] = useState('');

  const handleUpdateUserName = useCallback((e: ChangeEvent<HTMLInputElement>) => setUserName(e.target.value), []);
  const handleOk = useCallback(() => setMode(1), []);

  return (
    <>
      {mode === 0 && (
        <>
          <input type="text" value={userName} onChange={handleUpdateUserName} />
          <button type="button" onClick={handleOk}>
            ok
          </button>
        </>
      )}
      {mode === 1 && <ConnectView roomId={roomId} userName={userName} />}
    </>
  );
};

const ConnectView = (props: { roomId: string; userName: string }) => {
  const { roomId, userName } = props;

  const [myStream, isLoadingDisplay, handleToggleDisplay] = useToggleStream();

  const [users] = useRoom(roomId, userName, myStream);
  const streamingUser = users.filter(({ stream, isMe }) => (isMe ? myStream : stream));

  return (
    <AppWrapper>
      <VideoField>
        <AutoSpliter splitNum={streamingUser.length}>
          {streamingUser.map(({ id, name, isMe, stream }) => (
            <UserVideoField key={id}>
              <VideoUserName>
                {name} {isMe && '*'}
              </VideoUserName>
              <Preview src={isMe ? myStream : stream} />
            </UserVideoField>
          ))}
        </AutoSpliter>
      </VideoField>
      <UserListWindow>
        <UserList>
          {users.map(({ id, name, isMe }) => (
            <UserListColumn key={id}>
              {name} {isMe && '*'}
            </UserListColumn>
          ))}
        </UserList>
      </UserListWindow>
      <ToolBox>
        <button disabled={isLoadingDisplay} onClick={handleToggleDisplay}>
          {myStream ? '配信停止' : '配信開始'}
        </button>
      </ToolBox>
    </AppWrapper>
  );
};

const useToggleStream = (): [MediaStream | null, boolean, () => Promise<void>] => {
  const [myStream, setStream] = useState<MediaStream | null>(null);

  const [isLoadingDisplay, , handleToggleDisplay] = useToggle(
    () => getDisplayMediaStream().then(setStream),
    () => {
      myStream && myStream.getTracks().forEach(track => track.stop());
      setStream(null);
    },
    [],
  );

  return [myStream, isLoadingDisplay, handleToggleDisplay];
};

const useRoom = (roomId: string, userName: string, stream: MediaStream | null) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<ReadonlyArray<UserData>>([]);

  useEffect(() => {
    const room = new Room(roomId, userName);
    room.onUpdateUsers = users => {
      const usersData = users.map(({ id, name, stream, isMe }) => ({ id, name, stream, isMe }));
      setUsers(usersData);
    };

    setRoom(room);

    return () => {
      room.close();
    };
  }, [roomId, userName]);

  useEffect(() => {
    room && room.setVideoStream(stream);
  }, [room, stream]);

  return [users];
};

const Preview = ({ src }: { src: MediaStream | null }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    videoRef.current && (videoRef.current.srcObject = src);
  }, [src, videoRef.current]);

  return <VideoPreview playsInline autoPlay ref={videoRef} />;
};

const getDisplayMediaStream = () =>
  navigator.mediaDevices.getDisplayMedia({
    video: true,
  });

const color = {
  bodyText: '#eee',
  darkGray: '#343a40',
  lightBlack: '#050608',
  darken: 'rgba(0,0,0,0.25)',
};

const AppWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: ${color.lightBlack};
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: 1fr 30px;
`;

const VideoField = styled.div`
  box-sizing: border-box;
  padding: 10px;
`;

const UserVideoField = styled.div`
  position: relative;
`;

const VideoUserName = styled.div`
  position: absolute;
  z-index: 1;
  width: 100%;
  height: 100%;
  color: ${color.bodyText};
  opacity: 0;
  &:hover {
    opacity: 1;
  }
`;

const VideoPreview = styled.video`
  position: absolute;
  z-index: 0;
  object-fit: contain;
  width: 100%;
  height: 100%;
`;

const UserListWindow = styled.div`
  grid-column: 2 / 2;
  grid-row: 1 / 3;
  background-color: ${color.darkGray};
`;

const UserList = styled.ul``;

const UserListColumn = styled.li`
  color: ${color.bodyText};
  line-height: 2em;
`;

const ToolBox = styled.div`
  display: flex;
  justify-content: center;
`;
