import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

export function FunnelReport() {
  return (
    <div>
      <Button variant='primary'>View Funnel</Button>
      <Modal title='Funnel Details'>
        <Button variant='secondary'>Download PDF</Button>
      </Modal>
    </div>
  );
}
