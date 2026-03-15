import React from 'react';

interface InputProps {
  placeholder?: string;
  value?: string;
  type?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (e: any) => void;
}

export function Input({
  placeholder,
  value,
  type = 'text',
  onChange,
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}
