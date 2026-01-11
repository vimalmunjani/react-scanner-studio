import pc from 'picocolors';
import boxen from 'boxen';
import ora, { type Ora } from 'ora';

/**
 * Beautiful logger utility using boxen, picocolors, and ora
 */

// Spinner instance for loading states
let currentSpinner: Ora | null = null;

/**
 * Display a styled info box
 */
export function infoBox(title: string, content?: string): void {
  const message = content
    ? `${pc.bold(pc.cyan(title))}\n\n${content}`
    : pc.bold(pc.cyan(title));
  console.log(
    boxen(message, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
    })
  );
}

/**
 * Display a styled success box
 */
export function successBox(title: string, content?: string): void {
  const message = content
    ? `${pc.bold(pc.green(title))}\n\n${content}`
    : pc.bold(pc.green(title));
  console.log(
    boxen(message, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'green',
    })
  );
}

/**
 * Display a styled error box
 */
export function errorBox(title: string, content?: string): void {
  const message = content
    ? `${pc.bold(pc.red(title))}\n\n${content}`
    : pc.bold(pc.red(title));
  console.log(
    boxen(message, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'red',
    })
  );
}

/**
 * Display a styled warning box
 */
export function warningBox(title: string, content?: string): void {
  const message = content
    ? `${pc.bold(pc.yellow(title))}\n\n${content}`
    : pc.bold(pc.yellow(title));
  console.log(
    boxen(message, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'yellow',
    })
  );
}

/**
 * Log a success message with a checkmark
 */
export function success(message: string): void {
  console.log(`${pc.green('✔')} ${pc.green(message)}`);
}

/**
 * Log an error message with an X
 */
export function error(message: string): void {
  console.log(`${pc.red('✖')} ${pc.red(message)}`);
}

/**
 * Log a warning message
 */
export function warning(message: string): void {
  console.log(`${pc.yellow('⚠')} ${pc.yellow(message)}`);
}

/**
 * Log an info message
 */
export function info(message: string): void {
  console.log(`${pc.cyan('ℹ')} ${pc.cyan(message)}`);
}

/**
 * Log a step/bullet point
 */
export function step(message: string): void {
  console.log(`  ${pc.dim('➜')} ${message}`);
}

/**
 * Log a highlighted message
 */
export function highlight(message: string): void {
  console.log(pc.bold(pc.magenta(message)));
}

/**
 * Log a dimmed/subtle message
 */
export function dim(message: string): void {
  console.log(pc.dim(message));
}

/**
 * Log a URL or link
 */
export function link(url: string): string {
  return pc.underline(pc.cyan(url));
}

/**
 * Format text as bold
 */
export function bold(text: string): string {
  return pc.bold(text);
}

/**
 * Start a spinner with a message
 */
export function startSpinner(message: string): Ora {
  if (currentSpinner) {
    currentSpinner.stop();
  }
  currentSpinner = ora({
    text: message,
    color: 'cyan',
  }).start();
  return currentSpinner;
}

/**
 * Update the spinner text
 */
export function updateSpinner(message: string): void {
  if (currentSpinner) {
    currentSpinner.text = message;
  }
}

/**
 * Stop the spinner with a success message
 */
export function spinnerSuccess(message: string): void {
  if (currentSpinner) {
    currentSpinner.succeed(pc.green(message));
    currentSpinner = null;
  }
}

/**
 * Stop the spinner with an error message
 */
export function spinnerError(message: string): void {
  if (currentSpinner) {
    currentSpinner.fail(pc.red(message));
    currentSpinner = null;
  }
}

/**
 * Stop the spinner with a warning message
 */
export function spinnerWarning(message: string): void {
  if (currentSpinner) {
    currentSpinner.warn(pc.yellow(message));
    currentSpinner = null;
  }
}

/**
 * Stop the spinner with an info message
 */
export function spinnerInfo(message: string): void {
  if (currentSpinner) {
    currentSpinner.info(pc.cyan(message));
    currentSpinner = null;
  }
}

/**
 * Stop the spinner without a message
 */
export function stopSpinner(): void {
  if (currentSpinner) {
    currentSpinner.stop();
    currentSpinner = null;
  }
}

/**
 * Display the welcome/banner box for the CLI
 */
export function banner(name: string, version?: string): void {
  const versionText = version ? pc.dim(`v${version}`) : '';
  const title = `${pc.bold(pc.cyan(name))} ${versionText}`;
  console.log(
    boxen(title, {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan',
    })
  );
}

/**
 * Display server running information
 */
export function serverInfo(port: number, features: string[] = []): void {
  const url = `http://localhost:${port}`;
  let content = `${pc.bold('Local:')}   ${link(url)}`;

  if (features.length > 0) {
    content += '\n\n' + features.map(f => `${pc.dim('➜')} ${f}`).join('\n');
  }

  console.log(
    boxen(content, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'green',
      title: pc.bold(pc.green('🚀 Server Running')),
      titleAlignment: 'center',
    })
  );
}

/**
 * Display build complete information
 */
export function buildComplete(
  outputDir: string,
  commands: string[] = []
): void {
  let content = `${pc.bold('Output:')} ${pc.cyan(outputDir)}`;

  if (commands.length > 0) {
    content +=
      '\n\n' +
      pc.dim('Serve with:') +
      '\n' +
      commands.map(c => `  ${pc.cyan(c)}`).join('\n');
  }

  console.log(
    boxen(content, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'green',
      title: pc.bold(pc.green('✔ Build Complete')),
      titleAlignment: 'center',
    })
  );
}

/**
 * Display an error with details
 */
export function errorWithDetails(title: string, details: string[]): void {
  const content = details.map(d => `${pc.dim('•')} ${d}`).join('\n');
  console.log(
    boxen(`${pc.bold(pc.red(title))}\n\n${content}`, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'red',
    })
  );
}

/**
 * Display installation instructions
 */
export function installInstructions(packageName: string): void {
  const content = [
    `${pc.bold('npm:')}  npm install ${packageName}`,
    `${pc.bold('yarn:')} yarn add ${packageName}`,
    `${pc.bold('pnpm:')} pnpm add ${packageName}`,
  ].join('\n');

  console.log(
    boxen(content, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'yellow',
      title: pc.bold(pc.yellow('📦 Install Required')),
      titleAlignment: 'center',
    })
  );
}

// Export picocolors for direct use if needed
export { pc };
