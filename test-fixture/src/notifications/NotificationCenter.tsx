import { Button } from '../components/Button';

export function NotificationCenter() {
  return (
    <div>
      <Button variant='secondary'>Mark All Read</Button>
      <Button variant='danger'>Clear All</Button>
    </div>
  );
}
