import React from 'react';
import { Button } from './Button';

interface ModalProps {
  title: string;
  open?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

export function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className='modal'>
      <h2>{title}</h2>
      {children}
      <Button label='Close' variant='secondary' onClick={onClose} />
    </div>
  );
}
