import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

export function SecuritySettings() {
  return (
    <div>
      <Input placeholder='Current password' />
      <Input placeholder='New password' />
      <Button variant='primary'>Update Password</Button>
      <Modal title='Two-Factor Authentication'>
        <Button variant='secondary'>Enable 2FA</Button>
      </Modal>
    </div>
  );
}
