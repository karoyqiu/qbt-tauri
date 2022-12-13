import { DataTypeProvider, DataTypeProviderProps } from '@devexpress/dx-react-grid';
import { Tooltip } from '@mui/material';
import React from 'react';

function TooltipFormatter(props: DataTypeProvider.ValueFormatterProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { value } = props;

  return (
    <Tooltip title={value as string}>
      <span>{value}</span>
    </Tooltip>
  );
}

function CellTooltip(props: DataTypeProviderProps) {
  return (
    <DataTypeProvider
      formatterComponent={TooltipFormatter}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
}

export default CellTooltip;
