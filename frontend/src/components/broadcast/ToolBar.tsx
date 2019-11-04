import React, { useCallback, useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import ScreenShare from '@material-ui/icons/ScreenShare';
import StopScreenShare from '@material-ui/icons/StopScreenShare';
import Settings from '@material-ui/icons/Settings';
import Mic from '@material-ui/icons/Mic';
import MicOff from '@material-ui/icons/MicOff';
import Videocam from '@material-ui/icons/Videocam';
import VideocamOff from '@material-ui/icons/VideocamOff';
import { useBroadcastContext } from '~/reducer/Broadcast';
import { useLocalStorage } from '~/reducer/localStorage';
import { ResolutionOptions } from '~/consts';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
  },
}));

enum DisplayMediaType {
  None,
  Display,
  Videocam,
}

const ToolBar = () => {
  const [{ displayStream, userStream }, dispatch] = useBroadcastContext();
  const [{ frameRate, resolution }] = useLocalStorage();
  const [displayMediaType, setDisplayMediaType] = useState(DisplayMediaType.None);
  const [disabledDisplayMedia, setDisabledDisplayMedia] = useState(false);
  const [loadingDisplayMedia, setLoadingDisplayMedia] = useState(false);
  const [disabledUserMedia, setDisabledUserMedia] = useState(false);
  const [loadingUserMedia, setLoadingUserMedia] = useState(false);
  const [disabledVideoMedia, setDisabledVideoMedia] = useState(false);
  const [loadingVideoMedia, setLoadingVideoMedia] = useState(false);

  const isOpenSettings = useCallback(() => dispatch({ type: 'openSettings' }), []);

  const toggleDisplayMedia = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) return;

    if (displayMediaType !== DisplayMediaType.Display) {
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

        setDisplayMediaType(DisplayMediaType.Display);

        displayStream && displayStream.getTracks().forEach(track => track.stop());
        dispatch({ type: 'updateDisplayStream', payload: stream });
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDisplayMedia(false);
      }
    } else {
      setDisplayMediaType(DisplayMediaType.None);
      displayStream && displayStream.getTracks().forEach(track => track.stop());
      dispatch({ type: 'updateDisplayStream', payload: null });
    }
  }, [displayStream, displayMediaType]);

  const toggleUserMedia = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

    if (!userStream) {
      setLoadingUserMedia(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
          },
        });
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

  const toggleVideoMedia = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

    if (displayMediaType !== DisplayMediaType.Videocam) {
      setLoadingVideoMedia(true);
      try {
        const resolutionInfo = ResolutionOptions[resolution];
        const videoConstraint: MediaTrackConstraints = {
          frameRate,
        };
        if (resolutionInfo) {
          videoConstraint.width = resolutionInfo.width;
          videoConstraint.height = resolutionInfo.height;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraint,
          audio: false,
        });

        setDisplayMediaType(DisplayMediaType.Videocam);

        displayStream && displayStream.getTracks().forEach(track => track.stop());
        dispatch({ type: 'updateDisplayStream', payload: stream });
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingVideoMedia(false);
      }
    } else {
      setDisplayMediaType(DisplayMediaType.None);
      displayStream && displayStream.getTracks().forEach(track => track.stop());
      dispatch({ type: 'updateDisplayStream', payload: null });
    }
  }, [displayStream, displayMediaType]);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setDisabledDisplayMedia(true);
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setDisabledUserMedia(true);
      setDisabledVideoMedia(true);
    }
  }, []);

  const classes = useStyles();
  return (
    <Toolbar>
      <Box display="flex" justifyContent="center" width="100%">
        <Button
          className={classes.button}
          variant={displayMediaType === DisplayMediaType.Display ? 'contained' : 'outlined'}
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
        <Button
          className={classes.button}
          variant={displayMediaType === DisplayMediaType.Videocam ? 'contained' : 'outlined'}
          color="primary"
          disabled={disabledVideoMedia || loadingVideoMedia}
          onClick={toggleVideoMedia}
        >
          {userStream ? <Videocam /> : <VideocamOff />}
        </Button>
        <Button variant="contained" color="default" onClick={isOpenSettings} className={classes.button}>
          <Settings />
        </Button>
      </Box>
    </Toolbar>
  );
};

export default ToolBar;
