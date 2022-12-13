import DownloadIcon from '@mui/icons-material/Download';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
} from '@mui/material';
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
      const lines = text.split('\n').filter((line) => line.length > 0);
      await api.add(lines);
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
          placeholder={t('Input one URL per line')}
          rows={5}
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
