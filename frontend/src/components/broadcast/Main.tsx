import React, { ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import clsx from 'clsx';
import { useBroadcastContext } from '~/reducer/Broadcast';
import { IconButton, Theme } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import { useDrawerMedia, DrawerWidth } from './Drawer';
import { makeStyles } from '@material-ui/styles';

interface Props {
  children: ReactNode;
}

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    position: 'relative',
    width: '100%',
    height: '100%',
    margin: 0,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  mainShift: {
    width: `calc(100% - ${DrawerWidth}px)`,
    marginRight: DrawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const Main = ({ children }: Props) => {
  const isMobile = useDrawerMedia();
  const [{ isOpenDrawer }, dispatch] = useBroadcastContext();

  const openDrawer = useCallback(() => {
    dispatch({ type: 'openDrawer' });
  }, []);

  const classes = useStyles();
  return (
    <main className={clsx(classes.main, { [classes.mainShift]: !isMobile })}>
      {children}
      <MenuButtonWrapper open={isOpenDrawer} isMobile={isMobile}>
        <IconButton onClick={openDrawer}>
          <Menu />
        </IconButton>
      </MenuButtonWrapper>
    </main>
  );
};

const MenuButtonWrapper = styled.div<{ open: boolean; isMobile: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  display: ${({ open, isMobile }) => (!open && isMobile ? 'block' : 'none')};
`;

export default Main;
