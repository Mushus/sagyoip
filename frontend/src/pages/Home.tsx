import React, { useCallback, useState, useEffect } from 'react';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { useLocalStorage } from '~/reducer/localStorage';
import { makeStyles } from '@material-ui/styles';
import randomId from 'random-id';
import { useHistory } from 'react-router-dom';
import ChooseName from '~/components/room/ChooseName';
import { FormattedMessage } from 'react-intl';

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
      <h1><FormattedMessage id="app.title" /></h1>
      <Box>
        <h2><FormattedMessage id="app.your_name_is" values={{ name: name }} /></h2>
        <ChooseName />
      </Box>
      <Box>
        <h2><FormattedMessage id="app.make_room.title" /></h2>
        <Grid container direction="row" spacing={1} className={classes.textForm}>
          <Grid item>
            <TextField type="text" margin="normal" value={roomId} />
          </Grid>
          <Grid item>
            <Button onClick={joinRoom} variant="contained" size="large" color="primary">
            <FormattedMessage id="app.make_room.join_button" />
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
