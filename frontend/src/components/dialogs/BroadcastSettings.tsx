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
import { FpsOptions, ResolutionOptions } from '~/consts';
import { useBroadcastContext } from '~/reducer/Broadcast';
import { useLocalStorage } from '~/localStorage';

interface Props {}

const useStyle = makeStyles(() => ({
  formControl: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

export default ({  }: Props) => {
  const [{ isOpenSetting }, dispatch] = useBroadcastContext();
  const [
    { frameRates: defaultFramerates, resolution: defaultResolution },
    { updateFrameRates: saveFrameRates, updateResolution: saveResolution },
  ] = useLocalStorage();
  const [frameRates, setFrameRates] = useState(defaultFramerates);
  const [resolutions, setResolutions] = useState(defaultResolution);

  const onOK = useCallback(() => {
    saveFrameRates(frameRates);
    saveResolution(resolutions);
    dispatch({ type: 'closeSettings' });
  }, [frameRates, resolutions]);

  const onClose = useCallback(() => {
    dispatch({ type: 'closeSettings' });
  }, []);

  const updateFrameRates = useCallback((e: ChangeEvent<{ value: number }>) => {
    const value = e.target.value;
    const frameRate = FpsOptions.find(fps => fps === value) || defaultFramerates;
    setFrameRates(frameRate);
  }, []);

  const updateResolutions = useCallback((e: ChangeEvent<{ value: string }>) => {
    const value = e.target.value;
    const resolution = Object.keys(ResolutionOptions).find(key => key === value) || defaultResolution;
    setResolutions(resolution);
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
              <Select value={frameRates} onChange={updateFrameRates} id="framerate">
                {FpsOptions.map(fps => (
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
              <Select value={resolutions} onChange={updateResolutions} id="resolution">
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
