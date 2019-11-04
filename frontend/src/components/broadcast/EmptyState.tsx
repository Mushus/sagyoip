import React from 'react';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';

const EmptyState = () => {
  return (
    <Box display="flex" flexWrap="wrap" justifyContent="center" alignContent="center" height="100%" padding={5}>
      <Paper>
        <Box padding={3}>
          <Box marginBottom={2}>
            <Typography variant="h5">
              <FormattedMessage id="app.broadcast.empty_state.title" />
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1">
              <FormattedMessage id="app.broadcast.empty_state.description" />
            </Typography>
            <ol>
              <li>
                <Typography variant="body1">
                  <FormattedMessage id="app.broadcast.empty_state.step_1" />
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <FormattedMessage id="app.broadcast.empty_state.step_2" />
                </Typography>
              </li>
            </ol>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmptyState;
