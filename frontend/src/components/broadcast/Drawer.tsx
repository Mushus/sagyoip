import React, { ReactNode, useCallback } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Share from '@material-ui/icons/Share';
import FileCopy from '@material-ui/icons/FileCopy';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import Tooltip from '@material-ui/core/Tooltip';
import useMedia from 'react-use/lib/useMedia';
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard';
import { UserData } from '~/interfaces';
import Mic from '~/components/broadcast/Mic';
import { useBroadcastContext } from '~/reducer/Broadcast';
import { Intl } from '~/languages';

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
      <Box flexGrow={1}>
        <List>
          {users.map(({ id, name, isMe, remoteMicStream }) => (
            <ListItem key={id}>
              {name} {isMe && '*'} <Mic src={remoteMicStream} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box p={1}>
        <ShareFunction />
      </Box>
    </DrawerWrapper>
  );
};

const ShareFunction = () => {
  if (!!navigator.share) {
    return <ShareButton />;
  } else {
    return <CopyToShareButton />;
  }
};

const ShareButton = () => {
  const share = useCallback(() => {
    if (!navigator.share) return;
    navigator.share({
      title: Intl.formatMessage({ id: 'app.title' }),
      text: Intl.formatMessage({ id: 'app.description' }),
      url: location.href,
    });
  }, []);

  return (
    <LightButton fullWidth startIcon={<Share />} onClick={share}>
      <FormattedMessage id="app.broadcast.share_button" />
    </LightButton>
  );
};

const useClipBoardStyle = makeStyles(theme => ({
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    paddingLeft: theme.spacing(1),
  },
  divier: {
    margin: theme.spacing(1),
    height: 20,
  },
  button: {
    padding: theme.spacing(1),
  }
}));

const CopyToShareButton = () => {
  const [, copyToClipboard] = useCopyToClipboard();

  const url = location.href;
  const copy = useCallback(() => {
    copyToClipboard(url);
  }, [url, copyToClipboard]);

  const classes = useClipBoardStyle();
  return (
    <Tooltip title={Intl.formatMessage({ id: 'app.broadcast.copy_to_share_button' })}>
      <Box p={1} display="flex" bgcolor="grey.700" alignItems="center">
        <Share fontSize="small" />
        <InputBase value={url} className={classes.input} />
        <Divider orientation="vertical" className={classes.divier} />
        <IconButton onClick={copy} className={classes.button}>
          <FileCopy fontSize="small" />
        </IconButton>
      </Box>
    </Tooltip>
  );
};

const DrawerWrapper = ({ children }: CustomDrawerWrapper) => {
  const isMobile = useDrawerMedia();
  const [{ isOpenDrawer }, dispatch] = useBroadcastContext();

  const closeDrawer = useCallback(() => {
    dispatch({ type: 'closeDrawer' });
  }, []);

  return isMobile ? (
    <Drawer variant="temporary" anchor="left" open={isOpenDrawer} onClose={closeDrawer}>
      <Box width={DrawerWidth} display="flex" flexDirection="column" height="100%">
        <Box>
          <IconButton onClick={closeDrawer}>
            <ChevronRight />
          </IconButton>
        </Box>
        <Divider />
        {children}
      </Box>
    </Drawer>
  ) : (
    <Drawer variant="persistent" anchor="right" open>
      <Box width={DrawerWidth} display="flex" flexDirection="column" height="100%">
        {' '}
        {children}{' '}
      </Box>
    </Drawer>
  );
};

const LightButton = withStyles(theme => ({
  root: {
    backgroundColor: theme.palette.grey[700],
  },
}))(Button);

export const useDrawerMedia = () => useMedia('(max-width: 640px)');

export default CustomDrawer;
