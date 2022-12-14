import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

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
