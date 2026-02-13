#!/usr/bin/env node

import { Command } from 'commander';
import {
  infoCommand,
  initCommand,
  startCommand,
  buildCommand,
  scanCommand,
} from './commands/index.js';

const program = new Command();

program
  .name('react-scanner-studio')
  .description('A CLI application built with Commander.js')
  .version('1.0.0');

// Register commands
infoCommand(program);
initCommand(program);
scanCommand(program);
startCommand(program);
buildCommand(program);

program.parse();
