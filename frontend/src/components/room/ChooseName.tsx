import React, { useCallback, useState, ChangeEvent } from 'react';
import { Button, TextField, Grid } from '@material-ui/core';
import { useLocalStorage } from '~/reducer/localStorage';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => ({
  textForm: {
    alignItems: 'center',
  },
}));

export default () => {
  const [{ name }, dispatch] = useLocalStorage();

  const [input, setInput] = useState(name);

  const editInput = useCallback((e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value), []);
  const handleUpdate = useCallback(() => dispatch({ type: 'updateName', payload: input }), [input]);

  const classes = useStyles();

  return (
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
  );
};
