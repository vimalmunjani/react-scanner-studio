import { Command } from 'commander';
import { checkPeerDependency } from '../utils/dependencies.js';

export function buildCommand(program: Command): void {
  program
    .command('build')
    .description('Coming soon')
    .action(() => {
      checkPeerDependency();
      console.log('Coming soon...');
    });
}
