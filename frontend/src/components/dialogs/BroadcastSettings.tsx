import React, { useCallback, useState, ChangeEvent } from 'react';
import {
  List,
  ListItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FrameRateOptions, ResolutionOptions } from '~/consts';
import { useBroadcastContext } from '~/reducer/Broadcast';
import { useLocalStorage } from '~/reducer/localStorage';

interface Props {}

const useStyle = makeStyles(() => ({
  formControl: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

export default ({  }: Props) => {
  const [{ isOpenSetting }, dispatch] = useBroadcastContext();
  const [{ frameRate: defaultFramerate, resolution: defaultResolution }, dispatchLS] = useLocalStorage();
  const [frameRate, setFrameRate] = useState(defaultFramerate);
  const [resolution, setResolution] = useState(defaultResolution);

  const onOK = useCallback(() => {
    dispatchLS({
      type: 'updateSettings',
      payload: {
        frameRate,
        resolution
      }
    })
    dispatch({ type: 'closeSettings' });
  }, [frameRate, resolution]);

  const onClose = useCallback(() => {
    dispatch({ type: 'closeSettings' });
  }, []);

  const updateFrameRate = useCallback((e: ChangeEvent<{ value: number }>) => {
    const value = e.target.value;
    const frameRate = FrameRateOptions.find(fps => fps === value) || defaultFramerate;
    setFrameRate(frameRate);
  }, []);

  const updateResolutions = useCallback((e: ChangeEvent<{ value: string }>) => {
    const value = e.target.value;
    const resolution = Object.keys(ResolutionOptions).find(key => key === value) || defaultResolution;
    setResolution(resolution);
  }, []);

  const classes = useStyle();
  return (
    <Dialog open={isOpenSetting} onClose={onClose}>
      <DialogTitle>Broadcast Settings</DialogTitle>
      <DialogContent>
        <List>
          <ListItem className={classes.formControl}>
            <FormControl>
              <InputLabel htmlFor="framerate">Frame rate</InputLabel>
              <Select value={frameRate} onChange={updateFrameRate} id="framerate">
                {FrameRateOptions.map(fps => (
                  <MenuItem value={fps} key={fps}>
                    {fps} FPS
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
          <ListItem className={classes.formControl}>
            <FormControl>
              <InputLabel htmlFor="resolution">Resolution</InputLabel>
              <Select value={resolution} onChange={updateResolutions} id="resolution">
                {Object.entries(ResolutionOptions).map(([key, { alias }]) => (
                  <MenuItem value={key} key={key}>
                    {key} {alias && `(${alias})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button color="default" variant="outlined" onClick={onClose}>
          Cansel
        </Button>
        <Button color="primary" variant="contained" onClick={onOK}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
