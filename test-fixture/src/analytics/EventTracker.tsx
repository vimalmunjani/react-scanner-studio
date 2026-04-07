import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function EventTracker() {
  return (
    <div>
      <Input placeholder='Event name' />
      <Input placeholder='Event value' />
      <Button variant='primary'>Track Event</Button>
    </div>
  );
}
