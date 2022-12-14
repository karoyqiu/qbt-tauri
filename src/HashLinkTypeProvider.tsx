import { DataTypeProvider, DataTypeProviderProps } from '@devexpress/dx-react-grid';
import DownloadIcon from '@mui/icons-material/Download';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import ErrorIcon from '@mui/icons-material/Error';
import PauseIcon from '@mui/icons-material/Pause';
import UploadIcon from '@mui/icons-material/Upload';
import Stack from '@mui/material/Stack';
import LinkButton from './LinkButton';
import { TorrentInfo, TorrentState } from './qBittorrentTypes';

function StateIcon(props: { state: TorrentState }) {
  const { state } = props;

  switch (state) {
    case 'allocating':
    case 'downloading':
    case 'metaDL':
    case 'queuedDL':
    case 'stalledDL':
    case 'checkingDL':
    case 'forcedDL':
      return <DownloadIcon fontSize="small" />;
    case 'uploading':
    case 'queuedUP':
    case 'stalledUP':
    case 'checkingUP':
    case 'forcedUP':
      return <UploadIcon fontSize="small" />;
    case 'pausedDL':
      return <PauseIcon />;
    case 'pausedUP':
      return <DownloadDoneIcon fontSize="small" />;
    default:
      return <ErrorIcon fontSize="small" />;
  }
}

const makeHashLinkFormatter = (onClick: (hash: string) => void) => (
  function HashLinkFormatter(props: DataTypeProvider.ValueFormatterProps) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { row } = props;
    const trnt = row as TorrentInfo;

    return (
      <LinkButton
        onClick={() => onClick(trnt.hash)}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          <StateIcon state={trnt.state} />
          <span>{trnt.name}</span>
        </Stack>
      </LinkButton>
    );
  }
);

type HashLinkTypeProviderProps = DataTypeProviderProps & {
  onClick: (hash: string) => void;
};

function HashLinkTypeProvider(props: HashLinkTypeProviderProps) {
  const { onClick, ...rest } = props;

  return (
    <DataTypeProvider
      formatterComponent={makeHashLinkFormatter(onClick)}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    />
  );
}

export default HashLinkTypeProvider;
