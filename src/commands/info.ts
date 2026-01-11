import { Command } from 'commander';
import { logger } from '../utils/index.js';

export function infoCommand(program: Command): void {
  program
    .command('info')
    .description('Coming soon')
    .action(() => {
      logger.infoBox(
        'Coming Soon',
        'This feature is currently under development.\nStay tuned for updates!'
      );
    });
}
