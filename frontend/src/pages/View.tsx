import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import H from 'history';
import { match } from 'react-router-dom';
import Room from '~/connector/Room';
import AutoSpliter from '~/components/AutoSpliter';
import BroadcastSettings from '~/components/dialogs/BroadcastSettings';
import ToolBar from '~/components/broadcast/ToolBar';
import ChooseName from '~/components/room/ChooseName';
import { useLocalStorage } from '~/reducer/localStorage';
import { useBroadcastContext, BroadcastProvider } from '~/reducer/Broadcast';
import CustomDrawer from '~/components/broadcast/Drawer';
import { UserData } from '~/interfaces';
import Main from '~/components/broadcast/Main';
import EmptyState from '~/components/broadcast/EmptyState';

interface Props {
  match: match<{ id: string }>;
  location: H.Location<H.LocationState>;
}

export default ({ match }: Props) => {
  const roomId = match.params.id;
  const [{ name }] = useLocalStorage();

  return (
    <BroadcastProvider>
      <AppWrapper>{!name ? <ChooseNameView /> : <ConnectView roomId={roomId} userName={name} />}</AppWrapper>
    </BroadcastProvider>
  );
};

const ChooseNameView = () => (
  <Box padding={1}>
    <h2>Enter your name:</h2>
    <ChooseName />
  </Box>
);

const useStyles = makeStyles(theme => ({
  controller: {
    position: 'absolute',
    top: 'auto',
    bottom: 0,
    left: 0,
    right: 0,
    width: 'auto',
    backgroundColor: 'transparent',
  },
  button: {
    margin: theme.spacing(1),
  },
}));

const ConnectView = (props: { roomId: string; userName: string }) => {
  const { roomId, userName } = props;
  const [users] = useRoom(roomId, userName);
  const [{ displayStream }] = useBroadcastContext();
  const streamingUser = users.filter(({ remoteDisplayStream, isMe }) => (isMe ? displayStream : remoteDisplayStream));

  const noOneStartBroadCasting = streamingUser.length === 0;

  const classes = useStyles();
  return (
    <Box bgcolor="#000" width="100%" height="100%">
      <CustomDrawer users={users} />
      <Main>
        {noOneStartBroadCasting ? (
          <EmptyState />
        ) : (
          <AutoSpliter splitNum={streamingUser.length}>
            {streamingUser.map(({ id, name, isMe, remoteDisplayStream }) => (
              <UserVideoField key={id}>
                <VideoUserName>
                  {name} {isMe && '*'}
                </VideoUserName>
                <Preview src={isMe ? displayStream : remoteDisplayStream} isLocal={isMe} />
              </UserVideoField>
            ))}
          </AutoSpliter>
        )}
        <AppBar position="fixed" className={classes.controller}>
          <ToolBar />
        </AppBar>
      </Main>
      <BroadcastSettings />
    </Box>
  );
};

const useRoom = (roomId: string, userName: string) => {
  const [{ displayStream, userStream }] = useBroadcastContext();

  const [room, setRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<readonly UserData[]>([]);

  useEffect(() => {
    const room = new Room(roomId, userName);
    room.onUpdateUsers = users => {
      const usersData = users.map(({ id, name, remoteDisplayStream, remoteMicStream, isMe }) => ({
        id,
        name,
        remoteDisplayStream,
        remoteMicStream,
        isMe,
      }));
      setUsers(usersData);
    };

    setRoom(room);

    return () => {
      room.close();
    };
  }, [roomId, userName]);

  useEffect(() => {
    room && room.setDisplayStream(displayStream);
  }, [room, displayStream]);

  useEffect(() => {
    room && room.setMicStream(userStream);
  }, [room, userStream]);

  return [users];
};

const Preview = ({ src, isLocal }: { src: MediaStream | null; isLocal: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    videoRef.current && (videoRef.current.srcObject = src);
  }, [src, videoRef.current]);

  return <VideoPreview playsInline autoPlay ref={videoRef} muted={isLocal} />;
};

const color = {
  bodyText: '#eee',
  darkGray: '#343a40',
  lightBlack: '#050608',
  darken: 'rgba(0,0,0,0.25)',
};

const AppWrapper = styled.div`
  width: 100%;
  height: 100%;
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
