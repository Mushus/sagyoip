import React, { useCallback, useState, useEffect } from 'react';
import { Box, Toolbar, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ScreenShare, StopScreenShare, Settings, Mic, MicOff } from '@material-ui/icons';
import { useBroadcastContext } from '~/reducer/Broadcast';
import { useLocalStorage } from '~/reducer/localStorage';
import { ResolutionOptions } from '~/consts';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
  },
}));

const ToolBar = () => {
  const [{ displayStream, userStream }, dispatch] = useBroadcastContext();
  const [{ frameRate, resolution }] = useLocalStorage();
  const [disabledDisplayMedia, setDisabledDisplayMedia] = useState(false);
  const [loadingDisplayMedia, setLoadingDisplayMedia] = useState(false);
  const [disabledUserMedia, setDisableUserMedia] = useState(false);
  const [loadingUserMedia, setLoadingUserMedia] = useState(false);

  const isOpenSettings = useCallback(() => dispatch({ type: 'openSettings' }), []);

  const toggleDisplayMedia = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) return;

    if (!displayStream) {
      setLoadingDisplayMedia(true);
      try {
        const resolutionInfo = ResolutionOptions[resolution];
        const videoConstraint: MediaTrackConstraints = {
          frameRate,
        };
        if (resolutionInfo) {
          videoConstraint.width = resolutionInfo.width;
          videoConstraint.height = resolutionInfo.height;
        }
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: videoConstraint,
          audio: true,
        });
        console.log(stream.getTracks());
        dispatch({ type: 'updateDisplayStream', payload: stream });
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDisplayMedia(false);
      }
    } else {
      displayStream.getTracks().forEach(track => track.stop());
      dispatch({ type: 'updateDisplayStream', payload: null });
    }
  }, [displayStream]);

  const toggleUserMedia = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

    if (!userStream) {
      setLoadingUserMedia(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log(stream);
        dispatch({ type: 'updateUserStream', payload: stream });
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingUserMedia(false);
      }
    } else {
      userStream.getTracks().forEach(track => track.stop());
      dispatch({ type: 'updateUserStream', payload: null });
    }
  }, [userStream]);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setDisabledDisplayMedia(true);
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setDisableUserMedia(true);
    }
  }, []);

  const classes = useStyles();
  return (
    <Toolbar>
      <Box display="flex" justifyContent="center" width="100%">
        <Button
          className={classes.button}
          variant={displayStream ? 'contained' : 'outlined'}
          color="primary"
          disabled={disabledDisplayMedia || loadingDisplayMedia}
          onClick={toggleDisplayMedia}
        >
          {displayStream ? <ScreenShare /> : <StopScreenShare />}
        </Button>
        <Button
          className={classes.button}
          variant={userStream ? 'contained' : 'outlined'}
          color="primary"
          disabled={disabledUserMedia || loadingUserMedia}
          onClick={toggleUserMedia}
        >
          {userStream ? <Mic /> : <MicOff />}
        </Button>
        <Button variant="contained" color="default" onClick={isOpenSettings} className={classes.button}>
          <Settings />
        </Button>
      </Box>
    </Toolbar>
  );
};

export default ToolBar;
