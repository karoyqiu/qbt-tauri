import { Box, CircularProgress } from '@mui/material';
import React from 'react';

function BusyIndicator() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  );
}

export default BusyIndicator;
