import {
  Column, IntegratedSelection, SelectionState, SortingState,
} from '@devexpress/dx-react-grid';
import {
  Grid, TableHeaderRow, TableSelection, VirtualTable,
} from '@devexpress/dx-react-grid-material-ui';
import Box from '@mui/material/Box';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DateTypeProvider from './DateTypeProvider';
import FileSizeTypeProvider from './FileSizeTypeProvider';
import HashLinkTypeProvider from './HashLinkTypeProvider';
import ProgressTypeProvider from './ProgressTypeProvider';
import { TorrentInfo } from './qBittorrentTypes';
import TorrentDialog from './TorrentDialog';

function Root(props: Grid.RootProps) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Grid.Root {...props} style={{ height: '100%' }} />;
}

const columnExtensions: VirtualTable.ColumnExtension[] = [
  {
    columnName: 'name',
    wordWrapEnabled: true,
  },
  {
    columnName: 'size',
    width: 100,
    align: 'right',
  },
  {
    columnName: 'progress',
    width: 100,
    align: 'right',
  },
  {
    columnName: 'dlspeed',
    width: 120,
    align: 'right',
  },
  {
    columnName: 'upspeed',
    width: 120,
    align: 'right',
  },
  {
    columnName: 'added_on',
    width: 100,
    align: 'right',
    wordWrapEnabled: true,
  },
  {
    columnName: 'completion_on',
    width: 100,
    align: 'right',
    wordWrapEnabled: true,
  },
];

type TorrentTableProps = {
  torrents: TorrentInfo[];
  selection: string[],
  setSelection: (value: string[]) => void;
};

function TorrentTable(props: TorrentTableProps) {
  const { torrents, selection, setSelection } = props;
  const [open, setOpen] = React.useState(false);
  const [hash, setHash] = React.useState('');
  const { t } = useTranslation();

  const columns = React.useMemo<Column[]>(() => [
    { name: 'name', title: t<string>('Name') },
    { name: 'progress', title: t<string>('Progress') },
    { name: 'size', title: t<string>('Size') },
    { name: 'dlspeed', title: t<string>('Download Speed') },
    { name: 'upspeed', title: t<string>('Upload Speed') },
    { name: 'added_on', title: t<string>('Creation Time') },
    { name: 'completion_on', title: t<string>('Completion Time') },
  ], []);

  return (
    <Box flex={1} overflow="auto">
      {/* @ts-ignore: no chlidren? */}
      <Grid
        rows={torrents}
        columns={columns}
        getRowId={(value: TorrentInfo) => value.hash}
        rootComponent={Root}
      >
        <SelectionState
          selection={selection}
          onSelectionChange={(value) => setSelection(value as string[])}
        />
        <SortingState
          defaultSorting={[{ columnName: 'completion_on', direction: 'asc' }]}
          columnSortingEnabled={false}
        />
        <HashLinkTypeProvider
          for={['name']}
          onClick={(h) => {
            setHash(h);
            setOpen(true);
          }}
        />
        <ProgressTypeProvider for={['progress']} />
        <FileSizeTypeProvider for={['size']} />
        <FileSizeTypeProvider for={['dlspeed', 'upspeed']} forSpeed />
        <DateTypeProvider for={['added_on', 'completion_on']} />
        <IntegratedSelection />
        <VirtualTable
          height="auto"
          columnExtensions={columnExtensions}
        />
        <TableHeaderRow showSortingControls />
        <TableSelection showSelectAll />
      </Grid>
      <TorrentDialog key={hash} open={open} hash={hash} onClose={() => setOpen(false)} />
    </Box>
  );
}

export default TorrentTable;
