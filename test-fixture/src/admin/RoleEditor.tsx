import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

export function RoleEditor() {
  return (
    <Modal title='Edit Role'>
      <Button variant='primary'>Save Role</Button>
      <Button variant='secondary'>Cancel</Button>
    </Modal>
  );
}
