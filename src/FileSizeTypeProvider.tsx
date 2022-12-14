import { DataTypeProvider, DataTypeProviderProps } from '@devexpress/dx-react-grid';
import { useTranslation } from 'react-i18next';

const sizeUnits = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'] as const;
const speedUnits = sizeUnits.map((u) => `${u}-per-second`);

const formatSize = (locale: string, bytes: number, units: readonly string[]) => {
  let i = 0;
  let n = bytes;
  const threshold = 1024 as const;

  while (n > threshold && i < units.length) {
    n /= threshold;
    i += 1;
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: units[i],
    maximumFractionDigits: 2,
  });
  return formatter.format(n);
};

function FileSizeFormatter(props: DataTypeProvider.ValueFormatterProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { value } = props;
  const { i18n } = useTranslation();

  return <code>{formatSize(i18n.language, value as number, sizeUnits)}</code>;
}

function SpeedFormatter(props: DataTypeProvider.ValueFormatterProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { value } = props;
  const { i18n } = useTranslation();

  return <code>{formatSize(i18n.language, value as number, speedUnits)}</code>;
}

type FileSizeTypeProviderProps = DataTypeProviderProps & {
  forSpeed?: boolean;
};

function FileSizeTypeProvider(props: FileSizeTypeProviderProps) {
  const { forSpeed = false, ...rest } = props;
  const Formatter = forSpeed ? SpeedFormatter : FileSizeFormatter;

  return (
    <DataTypeProvider
      formatterComponent={Formatter}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    />
  );
}

export default FileSizeTypeProvider;
