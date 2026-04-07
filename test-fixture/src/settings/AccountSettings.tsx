import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function AccountSettings() {
  return (
    <div>
      <Input placeholder='Display name' />
      <Input placeholder='Email address' />
      <Button variant='primary'>Save Changes</Button>
    </div>
  );
}
