import React from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';

export function CheckoutForm() {
  return (
    <div>
      <Input placeholder='Card Number' />
      <Input placeholder='CVV' />
      <Input placeholder='Expiry Date' />
      <Button label='Pay Now' variant='primary' />
      <Button label='Cancel' variant='danger' />
      <Modal title='Payment Confirmation' open={false} />
    </div>
  );
}
