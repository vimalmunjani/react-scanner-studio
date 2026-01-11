#!/usr/bin/env node

import { Command } from 'commander';
import {
  infoCommand,
  initCommand,
  startCommand,
  buildCommand,
} from './commands/index.js';

const program = new Command();

program
  .name('react-scanner-ui')
  .description('A CLI application built with Commander.js')
  .version('1.0.0');

// Register commands
infoCommand(program);
initCommand(program);
startCommand(program);
buildCommand(program);

program.parse();
