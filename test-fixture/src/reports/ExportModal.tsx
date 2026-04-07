import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

export function ExportModal() {
  return (
    <Modal title='Export Report'>
      <Button variant='primary'>Download CSV</Button>
      <Button variant='secondary'>Download PDF</Button>
      <Button variant='secondary'>Cancel</Button>
    </Modal>
  );
}
