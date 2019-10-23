import React, { useState, useCallback, ChangeEvent } from 'react';
import { TextField, Button } from '@material-ui/core';

interface Props {
  onUpdateUserName: (userName: string) => void;
}

const ChooseName = ({ onUpdateUserName }: Props) => {
  const [userName, setUserName] = useState('');

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  }, []);
  const handleOK = useCallback(() => {
    onUpdateUserName(userName);
  }, [userName]);

  return (
    <>
      <TextField fullWidth variant="outlined" value={userName} onChange={handleChange} />
      <Button onClick={handleOK}>OK</Button>
    </>
  );
};

export default ChooseName;
