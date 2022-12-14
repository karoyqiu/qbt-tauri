import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { invoke } from '@tauri-apps/api/tauri';
import React from 'react';
import store from 'store';
import BusyIndicator from './BusyIndicator';
import LoginDialog, { LoginData } from './LoginDialog';
import MainPanel from './MainPanel';

function App() {
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () => createTheme({
      palette: {
        mode: prefersDarkMode ? 'dark' : 'light',
      },
    }),
    [prefersDarkMode],
  );

  const login = async (loginData?: LoginData) => {
    let ok = false;

    if (loginData) {
      try {
        await invoke('qbt_login', loginData);
        ok = true;
      } catch (e) {
        console.error(e);
      }
    }

    if (ok) {
      setLoggedIn(true);
      setLoginOpen(false);
    } else {
      setLoggedIn(false);
      setLoginOpen(true);
    }
  };

  const autoLogin = () => login(store.get('loginData') as LoginData);

  React.useEffect(() => {
    autoLogin().catch(() => { });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {loggedIn ? <MainPanel /> : <BusyIndicator />}
      <LoginDialog
        open={loginOpen && !loggedIn}
        onLogin={login}
      />
    </ThemeProvider>
  );
}

export default App;
