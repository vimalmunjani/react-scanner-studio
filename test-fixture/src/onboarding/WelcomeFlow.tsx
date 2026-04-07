import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

export function WelcomeFlow() {
  return (
    <div>
      <Input placeholder='Your name' />
      <Input placeholder='Team name' />
      <Button variant='primary'>Get Started</Button>
      <Modal title='Welcome to the platform'>
        <Button variant='secondary'>Take the Tour</Button>
        <Button variant='secondary'>Skip</Button>
      </Modal>
    </div>
  );
}
