import DownloadIcon from '@mui/icons-material/Download';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { invoke } from '@tauri-apps/api/tauri';
import React from 'react';
import { useTranslation } from 'react-i18next';

type AddTorrentDialogProps = {
  open: boolean;
  onClose: () => void;
};

function AddTorrentDialog(props: AddTorrentDialogProps) {
  const { open, onClose } = props;
  const [text, setText] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const { t } = useTranslation();

  const download = async () => {
    setBusy(true);

    try {
      await invoke('qbt_add', { urls: text });
    } catch (error) {
      console.error(error);
    }

    onClose();
    setBusy(false);
  };

  React.useEffect(() => {
    if (open) {
      setText('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('Add Torrent')}</DialogTitle>
      <DialogContent>
        <TextField
          multiline
          autoFocus
          fullWidth
          label={t('URLs')}
          placeholder={t<string>('Input one URL per line')}
          rows={7}
          sx={{ mt: 1 }}
          value={text}
          onChange={(event) => setText(event.target.value)}
          InputProps={{
            style: {
              fontFamily: "'Roboto Mono', 'Consolas', 'Courier New', Courier, monospace",
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('Cancel')}</Button>
        <LoadingButton
          variant="contained"
          disabled={text.length === 0}
          loading={busy}
          loadingPosition="start"
          startIcon={<DownloadIcon />}
          onClick={download}
        >
          {t('Download')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default AddTorrentDialog;
