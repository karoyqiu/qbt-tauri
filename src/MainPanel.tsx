import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Button, ButtonGroup, IconButton, InputAdornment, Stack, Tab, TabProps, Tabs, TextField,
} from '@mui/material';
import React from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useTranslation } from 'react-i18next';
import { TorrentContentPriority, TorrentFilter, TorrentInfo } from './qBittorrentTypes';
import settings from './settings';
import AddTorrentDialog from './AddTorrentDialog';
import SettingsDialog from './SettingsDialog';
import TorrentTable from './TorrentTable';

// declare const api: typeof import('./').default;

const doNotDownloadSmallFiles = async (hash: string) => {
  // const contents = await api.getTorrentContent(hash);
  // const smalls = contents.filter((c) => (
  //   c.priority !== TorrentContentPriority.DO_NOT_DOWNLOAD && c.size < settings.smallFileThreshold
  // )).map((c) => c.index);

  // if (smalls.length > 0) {
  //   await api.setFilePriority(hash, smalls, TorrentContentPriority.DO_NOT_DOWNLOAD);
  // }
};

const checkNewDownloads = async (oldOnes: TorrentInfo[], newOnes: TorrentInfo[]) => {
  const metaDls = oldOnes.filter((trnt) => trnt.state === 'metaDL').map((trnt) => trnt.hash);
  const downloads = newOnes.filter((trnt) => trnt.state !== 'metaDL' && metaDls.includes(trnt.hash)).map((trnt) => trnt.hash);
  await Promise.all(downloads.map(doNotDownloadSmallFiles));
};

const checkSeedingDownloads = async (dls: TorrentInfo[]) => {
  // const deadline = Math.ceil(Date.now() / 1000) - settings.seedingThreshold;
  // const seededEnough = dls.filter((d) => d.completion_on > 0 && d.completion_on <= deadline);

  // if (seededEnough.length > 0) {
  //   await api.pause(seededEnough.map((s) => s.hash));
  // }
};

function LowTab(props: TabProps) {
  return (
    <Tab
      iconPosition="start"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      sx={{ minHeight: 56 }}
    />
  );
}

function MainPanel() {
  const [filter, setFilter] = React.useState<TorrentFilter>('downloading');
  const [torrents, setTorrents] = React.useState<TorrentInfo[]>([]);
  const [search, setSearch] = React.useState('');
  const [selection, setSelection] = React.useState<string[]>([]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const { t } = useTranslation();

  const doReload = async () => {
    try {
      const res: TorrentInfo[] = await invoke('qbt_get_torrents_info', { filter });
      const searched = search.length > 0 ? res.filter((r) => r.name.includes(search)) : res;

      setTorrents((old) => {
        if (filter === 'downloading') {
          checkNewDownloads(old, searched).catch(() => { });
        } else if (filter === 'seeding') {
          checkSeedingDownloads(searched).catch(() => { });
        }

        return searched;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const reload = () => { doReload().catch(() => { }); };

  React.useEffect(() => {
    setSelection([]);
    const timer = setInterval(reload, settings.listRefreshInterval);
    reload();
    return () => clearInterval(timer);
  }, [filter, search]);

  return (
    <Stack height="100vh">
      <Stack
        sx={{ borderBottom: 1, borderColor: 'divider' }}
        direction="row"
        justifyContent="space-between"
        spacing={1}
      >
        <ButtonGroup variant="text">
          <Button
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
          >
            {t('Add')}
          </Button>
          <Button
            startIcon={<PauseIcon />}
            disabled={selection.length === 0}
          // onClick={() => api.pause(selection)}
          >
            {t('Pause')}
          </Button>
          <Button
            startIcon={<PlayArrowIcon />}
            disabled={selection.length === 0}
          // onClick={() => api.resume(selection)}
          >
            {t('Resume')}
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            disabled={selection.length === 0}
          // onClick={() => api.delete(selection)}
          >
            {t('Delete')}
          </Button>
          <Button
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
          >
            {t('Settings')}
          </Button>
        </ButtonGroup>
        <TextField
          sx={{ flex: 1 }}
          placeholder={t<string>('Search')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: search.length > 0 && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Tabs
          value={filter}
          onChange={(_e, newValue: TorrentFilter) => setFilter(newValue)}
        >
          <LowTab
            value="all"
            label={t('All')}
          />
          <LowTab
            value="downloading"
            label={t('Downloading')}
            icon={<DownloadIcon />}
          />
          <LowTab
            value="seeding"
            label={t('Seeding')}
            icon={<UploadIcon />}
          />
          <LowTab
            value="completed"
            label={t('Completed')}
            icon={<DownloadDoneIcon />}
          />
        </Tabs>
      </Stack>
      <TorrentTable torrents={torrents} selection={selection} setSelection={setSelection} />
      {/* <AddTorrentDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} /> */}
    </Stack>
  );
}

export default MainPanel;
