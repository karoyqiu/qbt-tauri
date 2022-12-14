/* eslint-disable jsx-a11y/anchor-is-valid */
import Link from '@mui/material/Link';
import React from 'react';

type LinkButtonProps = {
  onClick: () => void;
  children?: React.ReactNode;
};

function LinkButton(props: LinkButtonProps) {
  const { onClick, children } = props;
  return (
    <Link
      component="button"
      onClick={onClick}
      textAlign="start"
    >
      {children}
    </Link>
  );
}

export default LinkButton;
