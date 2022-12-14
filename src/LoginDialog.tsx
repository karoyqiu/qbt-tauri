import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import React from 'react';
import { useTranslation } from 'react-i18next';
import store from 'store';

export type LoginData = {
  url: string;
  username: string;
  password: string;
};

type LoginDialogProps = {
  open: boolean;
  onLogin: (data?: LoginData) => void;
};

function LoginDialog(props: LoginDialogProps) {
  const { open, onLogin } = props;
  const [initValues, setInitValues] = React.useState(store.get('loginData', {}) as LoginData);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const { t } = useTranslation();

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('Login')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText>
            {t('Login to qBittorrent.')}
          </DialogContentText>
          <Stack spacing={2}>
            <TextField
              autoFocus
              fullWidth
              required
              name="url"
              type="url"
              label={t('URL')}
              value={initValues.url ?? ''}
              onChange={(e) => setInitValues({
                ...initValues,
                url: e.target.value,
              })}
            />
            <TextField
              fullWidth
              required
              name="username"
              type="text"
              label={t('Username')}
              value={initValues.username ?? ''}
              onChange={(e) => setInitValues({
                ...initValues,
                username: e.target.value,
              })}
            />
            <TextField
              fullWidth
              required
              name="password"
              type="password"
              label={t('Password')}
              value={initValues.password ?? ''}
              onChange={(e) => setInitValues({
                ...initValues,
                password: e.target.value,
              })}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          color="primary"
          variant="contained"
          loading={isSubmitting}
          onClick={() => {
            setSubmitting(true);
            store.set('loginData', initValues);
            onLogin(initValues);
          }}
        >
          {t('Login')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default LoginDialog;
