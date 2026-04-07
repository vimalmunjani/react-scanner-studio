import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function SalesReport() {
  return (
    <div>
      <Input placeholder='Date range' />
      <Button variant='primary'>Generate Report</Button>
      <Button variant='secondary'>Schedule</Button>
    </div>
  );
}
