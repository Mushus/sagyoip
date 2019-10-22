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
import { DefaultFps, DefaultResolutions, FpsOptions, ResolutionOptions } from '~/consts';

interface Props {
  open: boolean;
  onClose: () => void;
}

const useStyle = makeStyles(() => ({
  formControl: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

export default ({ open, onClose }: Props) => {
  const [frameRates, setFrameRates] = useState(DefaultFps);
  const [resolutions, setResolutions] = useState(DefaultResolutions);

  const onOK = useCallback(() => {
    onClose();
  }, [onClose]);

  const updateFrameRates = useCallback((e: ChangeEvent<{ value: number }>) => {
    const value = e.target.value;
    const frameRate = FpsOptions.find(fps => fps === value) || DefaultFps;
    setFrameRates(frameRate);
  }, []);
  const updateResolutions = useCallback((e: ChangeEvent<{ value: string }>) => {
    const value = e.target.value;
    const resolution = Object.keys(ResolutionOptions).find(key => key === value) || DefaultResolutions;
    setResolutions(resolution);
  }, []);

  const classes = useStyle();

  return (
    <Dialog open={open} onClose={onClose}>
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
