import React, { ReactNode } from 'react';
import { Drawer, Box, List, ListItem } from '@material-ui/core';
import { useMedia } from 'react-use';
import { UserData } from '~/interfaces';
import Mic from './Mic';

export const DrawerWidth = 240;

interface CustomDrawerProps {
  users: readonly UserData[];
}

interface CustomDrawerWrapper {
  children: ReactNode;
}

const CustomDrawer = ({ users }: CustomDrawerProps) => {
  return (
    <DrawerWrapper>
      <List>
        {users.map(({ id, name, isMe, remoteMicStream }) => (
          <ListItem key={id}>
            {name} {isMe && '*'} <Mic src={remoteMicStream} />
          </ListItem>
        ))}
      </List>
    </DrawerWrapper>
  );
};

const DrawerWrapper = ({ children }: CustomDrawerWrapper) => {
  const isMobile = useMedia('(max-width: 640px)');

  return isMobile ? (
    <Drawer variant="temporary" anchor="left">
      <Box width={DrawerWidth}>{children}</Box>
    </Drawer>
  ) : (
    <Drawer variant="persistent" anchor="right" open>
      <Box width={DrawerWidth}>{children}</Box>
    </Drawer>
  );
};

export default CustomDrawer;
