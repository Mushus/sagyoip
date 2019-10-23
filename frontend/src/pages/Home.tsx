import React, { useCallback, useState, ChangeEvent, useEffect } from 'react';
import { Container, Box, Button, TextField, Grid } from '@material-ui/core';
import { useLocalStorage } from '~/localStorage';
import { makeStyles } from '@material-ui/styles';
import randomId from 'random-id';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(() => ({
  textForm: {
    alignItems: 'center',
  },
}));

export default () => {
  const [{ name }, dispatch] = useLocalStorage();

  const history = useHistory();

  const [input, setInput] = useState(name);
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    setRoomId(randomId());
  }, []);

  const editInput = useCallback((e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value), []);
  const handleUpdate = useCallback(() => dispatch.updateName(input), [input]);
  const joinRoom = useCallback(() => history.push(`/r/${roomId}`), [roomId]);

  const classes = useStyles();

  return (
    <Container maxWidth="sm">
      <h1>Home</h1>
      <Box>
        <h2>your name: {name}</h2>
        <Grid container direction="row" spacing={1} className={classes.textForm}>
          <Grid item>
            <TextField type="text" margin="normal" value={input} onChange={editInput} />
          </Grid>
          <Grid item>
            <Button onClick={handleUpdate} variant="contained" size="large" color="primary">
              Update
            </Button>
          </Grid>
        </Grid>
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
