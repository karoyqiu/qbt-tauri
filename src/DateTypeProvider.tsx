import { DataTypeProvider, DataTypeProviderProps } from '@devexpress/dx-react-grid';

function DateFormatter(props: DataTypeProvider.ValueFormatterProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { value } = props;
  const seconds = value as number;

  if (seconds <= 0) {
    return null;
  }

  return <span>{new Date(value * 1000).toLocaleString()}</span>;
}

function DateTypeProvider(props: DataTypeProviderProps) {
  return (
    <DataTypeProvider
      formatterComponent={DateFormatter}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
}

export default DateTypeProvider;
