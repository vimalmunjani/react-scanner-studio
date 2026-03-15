import React from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';

export function SignupForm() {
  return (
    <form>
      <Input placeholder='Full Name' />
      <Input type='email' placeholder='Email' />
      <Input type='password' placeholder='Password' />
      <Button label='Create Account' variant='primary' />
      <Modal title='Terms of Service' open={false} />
    </form>
  );
}
