/* eslint-disable max-len */
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import React from 'react';
import { useTranslation } from 'react-i18next';
import SaveIcon from '@mui/icons-material/Save';
import settings from './settings';

type SettingsDialogProps = {
  open: boolean;
  onClose: () => void;
};

function SettingsDialog(props: SettingsDialogProps) {
  const { open, onClose } = props;
  const [listRefreshInterval, setListRefreshInterval] = React.useState(settings.listRefreshInterval);
  const [smallFileThreshold, setSmallFileThreshold] = React.useState(settings.smallFileThreshold / 1024 / 1024);
  const [seedingThreshold, setSeedingThreshold] = React.useState(settings.seedingThreshold / 60);
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    if (open) {
      setListRefreshInterval(settings.listRefreshInterval);
      setSmallFileThreshold(settings.smallFileThreshold / 1024 / 1024);
      setSeedingThreshold(settings.seedingThreshold / 60);
    }
  }, [open]);

  const getUnit = React.useCallback((unit: string) => {
    const formatter = new Intl.NumberFormat(i18n.language, {
      style: 'unit',
      unit,
      unitDisplay: 'short',
    });

    const parts = formatter.formatToParts();
    const u = parts.find((p) => p.type === 'unit');
    return u ? u.value : unit;
  }, [i18n.language]);

  const save = () => {
    settings.listRefreshInterval = listRefreshInterval;
    settings.smallFileThreshold = smallFileThreshold * 1024 * 1024;
    settings.seedingThreshold = seedingThreshold * 60;
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('Settings')}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            inputMode="decimal"
            inputProps={{
              style: {
                textAlign: 'right',
              },
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">{getUnit('millisecond')}</InputAdornment>,
            }}
            label={t('List Refresh Interval')}
            helperText={t('The torrent list will refresh every this value.')}
            value={listRefreshInterval}
            onChange={(e) => setListRefreshInterval(parseInt(e.target.value, 10))}
          />
          <TextField
            fullWidth
            inputMode="decimal"
            inputProps={{
              style: {
                textAlign: 'right',
              },
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">{getUnit('megabyte')}</InputAdornment>,
            }}
            label={t('Small File Threshold')}
            helperText={t('The files smaller than this value will not be downloaded.')}
            value={smallFileThreshold}
            onChange={(e) => setSmallFileThreshold(parseInt(e.target.value, 10))}
          />
          <TextField
            fullWidth
            inputMode="decimal"
            inputProps={{
              style: {
                textAlign: 'right',
              },
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">{getUnit('minute')}</InputAdornment>,
            }}
            label={t('Maximum Seeding Time')}
            helperText={t('The seeding will be stopped after this value.')}
            value={seedingThreshold}
            onChange={(e) => setSeedingThreshold(parseInt(e.target.value, 10))}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('Cancel')}</Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={save}
        >
          {t('Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SettingsDialog;
