import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function UserManagement() {
  return (
    <div>
      <Input placeholder='Search users…' />
      <Button variant='primary'>Invite User</Button>
      <Button variant='danger'>Remove User</Button>
    </div>
  );
}
