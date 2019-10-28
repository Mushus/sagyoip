import React, { useCallback, useState, useEffect } from 'react';
import { Container, Box, Button, TextField, Grid } from '@material-ui/core';
import { useLocalStorage } from '~/reducer/localStorage';
import { makeStyles } from '@material-ui/styles';
import randomId from 'random-id';
import { useHistory } from 'react-router-dom';
import ChooseName from '~/components/room/ChooseName';

const useStyles = makeStyles(() => ({
  textForm: {
    alignItems: 'center',
  },
}));

export default () => {
  const [{ name }] = useLocalStorage();

  const history = useHistory();

  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    setRoomId(randomId());
  }, []);

  const joinRoom = useCallback(() => history.push(`/r/${roomId}`), [roomId]);

  const classes = useStyles();

  return (
    <Container maxWidth="sm">
      <h1>Home</h1>
      <Box>
        <h2>your name: {name}</h2>
        <ChooseName />
      </Box>
      <Box>
        <h2>join room</h2>
        <Grid container direction="row" spacing={1} className={classes.textForm}>
          <Grid item>
            <TextField type="text" margin="normal" value={roomId} />
          </Grid>
          <Grid item>
            <Button onClick={joinRoom} variant="contained" size="large" color="primary">
              Join
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
