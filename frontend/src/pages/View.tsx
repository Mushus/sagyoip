import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import { Drawer, Box, List, ListItem, AppBar, Toolbar, Button } from '@material-ui/core';
import { ScreenShare, StopScreenShare, Settings, Mic, MicOff } from '@material-ui/icons';
import H from 'history';
import { match } from 'react-router-dom';
import Room from '~/connector/Room';
import AutoSpliter from '~/components/AutoSpliter';
import BroadcastSettings from '~/components/dialogs/BroadcastSettings';
import { useAsyncFnToggle, useDialog } from '~/hooks';
import { useToggle } from 'react-use';
import ChooseName from '~/components/room/ChooseName';
import { useLocalStorage } from '~/localStorage';

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
  const [{ name }, { updateName }] = useLocalStorage();

  return (
    <AppWrapper>
      <Box bgcolor="#000" width="100%" height="100%">
        {!name ? <ChooseName onUpdateUserName={updateName} /> : <ConnectView roomId={roomId} userName={name} />}
      </Box>
    </AppWrapper>
  );
};

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  controller: {
    top: 'auto',
    bottom: 0,
    left: 0,
    right: `${drawerWidth}px`,
    width: 'auto',
    backgroundColor: 'transparent',
  },
  button: {
    margin: theme.spacing(1),
  },
}));

const ConnectView = (props: { roomId: string; userName: string }) => {
  const { roomId, userName } = props;

  const [myStream, isLoadingDisplay, handleToggleDisplay] = useToggleStream();

  const [users] = useRoom(roomId, userName, myStream);
  const streamingUser = users.filter(({ stream, isMe }) => (isMe ? myStream : stream));

  const [isOpenSettings, settingsProp] = useDialog();
  const [isMicOn, toggleMute] = useToggle(false);

  const classes = useStyles();

  return (
    <>
      <Drawer anchor="right" open={true} variant="permanent">
        <Box width={drawerWidth}>
          <List>
            {users.map(({ id, name, isMe }) => (
              <ListItem key={id}>
                {name} {isMe && '*'}
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box bgcolor="#000" mr={`${drawerWidth}px`} height="100%">
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
        <AppBar position="fixed" className={classes.controller}>
          <Toolbar>
            <Box display="flex" justifyContent="center" width="100%">
              <Button className={classes.button} variant="outlined" color="default" onClick={toggleMute}>
                {isMicOn ? <Mic /> : <MicOff />}
              </Button>
              <Button
                className={classes.button}
                variant="contained"
                color="primary"
                disabled={isLoadingDisplay}
                onClick={handleToggleDisplay}
              >
                {myStream ? <ScreenShare /> : <StopScreenShare />}
              </Button>
              <Button variant="outlined" color="default" onClick={isOpenSettings} className={classes.button}>
                <Settings />
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
      <BroadcastSettings {...settingsProp} />
    </>
  );
};

const useToggleStream = (): [MediaStream | null, boolean, () => Promise<void>] => {
  const [myStream, setStream] = useState<MediaStream | null>(null);

  const [isLoadingDisplay, , handleToggleDisplay] = useAsyncFnToggle(
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
