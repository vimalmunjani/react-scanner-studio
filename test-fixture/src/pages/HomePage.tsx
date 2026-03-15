import React from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';

export function HomePage() {
  return (
    <div>
      <h1>Home</h1>
      <Button label='Get Started' variant='primary' />
      <Button label='Learn More' variant='secondary' />
      <Input placeholder='Search...' />
      <Modal title='Welcome' open={false} />
    </div>
  );
}
