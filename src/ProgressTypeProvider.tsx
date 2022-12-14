import { DataTypeProvider, DataTypeProviderProps } from '@devexpress/dx-react-grid';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import React from 'react';
import { useTranslation } from 'react-i18next';

function ProgressFormatter(props: DataTypeProvider.ValueFormatterProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { value } = props;
  const { i18n } = useTranslation();
  const progress = value as number;

  const percentFormatter = React.useMemo(() => new Intl.NumberFormat(i18n.language, {
    style: 'percent',
    minimumFractionDigits: 2,
  }), [i18n.language]);

  return (
    <Stack direction="row-reverse" spacing={1} alignItems="center" justifyContent="flex-start">
      <CircularProgress size="1em" variant="determinate" value={progress * 100} />
      <code>{percentFormatter.format(progress)}</code>
    </Stack>
  );
}

function ProgressTypeProvider(props: DataTypeProviderProps) {
  return (
    <DataTypeProvider
      formatterComponent={ProgressFormatter}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
}

export default ProgressTypeProvider;
