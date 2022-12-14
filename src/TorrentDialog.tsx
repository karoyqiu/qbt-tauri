import {
  Column, CustomTreeData, IntegratedSelection, SelectionState, TreeDataState,
} from '@devexpress/dx-react-grid';
import {
  Grid, TableHeaderRow, TableTreeColumn, VirtualTable,
} from '@devexpress/dx-react-grid-material-ui';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { invoke } from '@tauri-apps/api/tauri';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CellTooltip from './CellTooltip';
import FileSizeTypeProvider from './FileSizeTypeProvider';
import ProgressTypeProvider from './ProgressTypeProvider';
import { TorrentContent, TorrentContentPriority } from './qBittorrentTypes';
import settings from './settings';

type TorrentContentTree = TorrentContent & {
  id: string;
  parentId: string;
  children?: TorrentContentTree[];
};

const findChild = (parent: TorrentContentTree, childName: string) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const child of (parent.children ?? [])) {
    if (child.name === childName) {
      return child;
    }
  }

  return null;
};

const isSelected = (child: TorrentContentTree) => (
  child.priority !== TorrentContentPriority.DO_NOT_DOWNLOAD
);

const isSomeSelected = (child: TorrentContentTree) => {
  if (child.children) {
    return child.children.some(isSomeSelected);
  }

  return isSelected(child);
};

const makeExpanded = (set: Set<string>, parent: TorrentContentTree) => {
  if (parent.children) {
    if (isSomeSelected(parent)) {
      set.add(parent.id);
    }

    parent.children.forEach((child) => makeExpanded(set, child));
  }
};

const makeSelected = (set: Set<string>, parent: TorrentContentTree) => {
  if (parent.children) {
    parent.children.forEach((child) => makeSelected(set, child));

    if (parent.children.every(isSelected)) {
      set.add(parent.id);
    } else {
      set.delete(parent.id);
    }
  }
};

const calcSize = (parent: TorrentContentTree): number => {
  if (parent.children) {
    // eslint-disable-next-line no-param-reassign
    parent.size = parent.children.reduce((total, child) => total + calcSize(child), 0);
    return parent.size;
  }

  return isSelected(parent) ? parent.size : 0;
};

const makeTree = (contents: TorrentContent[]) => {
  const root: TorrentContentTree = {
    id: '',
    parentId: '',
    index: -1,
    name: '',
    size: 0,
    priority: TorrentContentPriority.DO_NOT_DOWNLOAD,
    progress: 0,
    is_seed: false,
    piece_range: [],
    availability: 0,
    children: [],
  };

  const selected = new Set<string>();

  contents.forEach((c) => {
    const parts = c.name.split('/');
    let parent = root;

    // 查找已有的部分
    while (parts.length > 1) {
      const child = findChild(parent, parts[0]);

      if (child) {
        parent = child;
        parts.shift();
      } else {
        break;
      }
    }

    // 创建没有的部分
    while (parts.length > 0) {
      const child: TorrentContentTree = {
        ...c,
        id: nanoid(),
        parentId: parent.id,
      };
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      child.name = parts.shift()!;

      if (parts.length > 0) {
        // 这是个文件夹
        child.index = -1;
        child.priority = TorrentContentPriority.DO_NOT_DOWNLOAD;
      } else if (isSelected(child)) {
        selected.add(child.id);
      }

      if (parent.children) {
        parent.children.push(child);
      } else {
        parent.children = [child];
      }

      parent = child;
    }
  });

  const expanded = new Set<string>();
  makeExpanded(expanded, root);
  expanded.delete('');
  makeSelected(selected, root);
  selected.delete('');
  root.size = calcSize(root);

  return {
    tree: root.children,
    folders: [...expanded],
    selected: [...selected],
  };
};

const columnExtensions: VirtualTable.ColumnExtension[] = [
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
];

const find = (tree: TorrentContentTree[], id: string): TorrentContentTree | null => {
  // eslint-disable-next-line no-restricted-syntax
  for (const item of tree) {
    if (item.id === id) {
      return item;
    }

    if (item.children) {
      const found = find(item.children, id);

      if (found) {
        return found;
      }
    }
  }

  return null;
};

const getChildrenIds = (rowIds: string[], rows: TorrentContentTree[]): string[] => (
  rowIds.reduce<string[]>((acc, rowId) => {
    const row = find(rows, rowId);

    if (row && row.children && row.children.length > 0) {
      const childrenIds = row.children.map((child) => child.id);
      const additionalIds = getChildrenIds(childrenIds, rows);
      return [...acc, ...childrenIds, ...additionalIds];
    }

    return acc;
  }, [])
);

const autoSelectTree = (rows: TorrentContentTree[]) => {
  let selected: string[] = [];

  rows.forEach((r) => {
    if (r.children) {
      selected = selected.concat(autoSelectTree(r.children));
    } else if (r.size >= settings.smallFileThreshold) {
      selected.push(r.id);
    }
  });

  return selected;
};

type TorrentDialogProps = {
  open: boolean;
  hash: string;
  onClose: () => void;
};

function TorrentDialog(props: TorrentDialogProps) {
  const { open, hash, onClose } = props;
  const [rows, setRows] = React.useState<TorrentContentTree[]>([]);
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [selection, setSelection] = React.useState<string[]>([]);
  const { t } = useTranslation();

  const columns = React.useMemo<Column[]>(() => [
    { name: 'name', title: t<string>('Name') },
    { name: 'size', title: t<string>('Size') },
    { name: 'progress', title: t<string>('Progress') },
  ], []);

  const loadContent = async () => {
    try {
      const content: TorrentContent[] = await invoke('qbt_get_files', { hash });
      const { tree = [], folders, selected } = makeTree(content);
      setRows(tree);
      setExpanded(folders);
      setSelection(selected);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    if (open && hash.length > 0) {
      loadContent().catch(() => { });
    }
  }, [open, hash]);

  const handleSelection = async (value: string[]) => {
    if (value.length > selection.length) {
      const added = value.filter((v) => !selection.includes(v));
      const children = getChildrenIds(added, rows);
      const all = [...new Set([...value, ...children])];
      const indexes = all.map((id) => find(rows, id)?.index ?? -1);
      _.pull(indexes, -1);
      await invoke('qbt_set_file_priority', {
        hash,
        id: indexes,
        priority: TorrentContentPriority.NORMAL,
      });
      setSelection(all);
    } else {
      const removed = selection.filter((id) => !value.includes(id));
      const children = getChildrenIds(removed, rows);
      const all = [...new Set([...removed, ...children])];
      const indexes = all.map((id) => find(rows, id)?.index ?? -1);
      _.pull(indexes, -1);
      await invoke('qbt_set_file_priority', {
        hash,
        id: indexes,
        priority: TorrentContentPriority.DO_NOT_DOWNLOAD,
      });

      const selected = value.filter((id) => !children.includes(id));
      setSelection(selected);
    }
  };

  const autoSelect = async () => {
    await handleSelection([]);
    const selected = autoSelectTree(rows);
    await handleSelection(selected);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        {t('Torrent Content')}
      </DialogTitle>
      <DialogContent>
        {/* @ts-ignore: no chlidren? */}
        <Grid rows={rows} columns={columns} getRowId={(value: TorrentContentTree) => value.id}>
          <SelectionState
            selection={selection}
            onSelectionChange={(value) => handleSelection(value as string[])}
          />
          <TreeDataState
            expandedRowIds={expanded}
            onExpandedRowIdsChange={(value) => setExpanded(value as string[])}
          />
          <CustomTreeData getChildRows={
            (row: TorrentContentTree | null, rootRows: TorrentContentTree[]) => (
              row ? (row.children ?? null) : rootRows
            )
          }
          />
          <IntegratedSelection />
          <CellTooltip for={['name']} />
          <FileSizeTypeProvider for={['size']} />
          <ProgressTypeProvider for={['progress']} />
          <VirtualTable
            columnExtensions={columnExtensions}
          />
          <TableHeaderRow />
          <TableTreeColumn for="name" showSelectionControls showSelectAll />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={autoSelect}>{t('Auto Select')}</Button>
        <Button onClick={onClose}>{t('Close')}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default TorrentDialog;
