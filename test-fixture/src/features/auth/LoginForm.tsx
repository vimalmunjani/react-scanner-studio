import React from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export function LoginForm() {
  return (
    <form>
      <Input type='email' placeholder='Email' />
      <Input type='password' placeholder='Password' />
      <Button label='Log In' variant='primary' />
      <Button label='Forgot Password' variant='secondary' disabled />
    </form>
  );
}
