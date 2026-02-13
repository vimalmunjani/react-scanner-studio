# Troubleshooting

This guide covers common issues you may encounter when using React Scanner Studio and how to resolve them.

## Common Issues

### Configuration Not Found

**Error:**

```
╭─────────────────────────────────────────────╮
│   Configuration Not Found                   │
│                                             │
│   react-scanner.config.js not found.        │
│   Run react-scanner-studio init first to    │
│   create the configuration.                 │
╰─────────────────────────────────────────────╯
```

**Cause:** The `react-scanner.config.js` file is missing. React Scanner Studio searches for this file starting from the current directory and moving upward through parent directories.

**Solution:**

1. Run `npx react-scanner-studio init` to create the configuration file in your current directory
2. Or manually create `react-scanner.config.js` in your project directory

---

### Scan Data Not Found

**Error:**

```
╭─────────────────────────────────────────────╮
│   Scan Data Not Found                       │
│                                             │
│   Scan data file not found:                 │
│   .react-scanner-studio/scan-report.json    │
│                                             │
│   Run npx react-scanner first to generate   │
│   the scan data.                            │
╰─────────────────────────────────────────────╯
```

**Cause:** The scan data file hasn't been generated yet.

**Solution:**

1. Run `npx react-scanner` to scan your codebase
2. Verify that the `outputTo` path in your config matches what React Scanner Studio expects

---

### Missing Dependency: react-scanner

**Error:**

```
╭─────────────────────────────────────────────╮
│   Missing Dependency: "react-scanner"       │
│                                             │
│   react-scanner is not installed.           │
│   This package is required to analyze your  │
│   React components.                         │
╰─────────────────────────────────────────────╯
```

**Cause:** The `react-scanner` package is not installed in your project.

**Solution:**

```bash
# Using npm
npm install --save-dev react-scanner

# Using yarn
yarn add --dev react-scanner

# Using pnpm
pnpm add --save-dev react-scanner
```

---

### Port Already in Use

**Error:**

```
⚠ Port 3000 is not available.
? Would you like to run on port 3001 instead? (Y/n)
```

**Cause:** Another process is already using the requested port.

**Solutions:**

1. **Accept the alternative port** — Press Enter to use the suggested port

2. **Specify a different port:**

   ```bash
   react-scanner-studio start --port 8080
   ```

3. **Find and kill the process using the port:**

   ```bash
   # On macOS/Linux
   lsof -i :3000
   kill -9 <PID>

   # On Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

---

### No Components Found

**Symptom:** The dashboard shows no components or empty data.

**Possible Causes and Solutions:**

1. **Wrong `crawlFrom` path**
   - Verify the path in `react-scanner.config.js` points to your source directory
   - Use a relative path from the config file location (e.g., `./src`)

2. **Wrong `importedFrom` value**
   - Ensure `importedFrom` matches how components are imported in your code
   - Check the exact package name (e.g., `@mui/material` not `material-ui`)

3. **Files are excluded**
   - Check if your source files match the glob patterns
   - Verify files aren't in the `exclude` array

4. **No matching imports**
   - Open a source file and verify the import statement matches `importedFrom`
   ```js
   // If importedFrom is '@mui/material'
   import { Button } from '@mui/material'; // ✓ Will be tracked
   import Button from './Button'; // ✗ Won't be tracked
   ```

---

### Build Fails with Vite Error

**Error:**

```
✖ Vite build failed
```

**Possible Causes and Solutions:**

1. **Node.js version too old**
   - Ensure you're using Node.js 18.0 or higher

   ```bash
   node --version
   ```

2. **Corrupted node_modules**
   - Delete `node_modules` and reinstall

   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Permission issues**
   - Ensure you have write permissions to the output directory
   ```bash
   chmod -R 755 .react-scanner-studio
   ```

---

### Dashboard Shows Stale Data

**Symptom:** The dashboard doesn't reflect recent code changes.

**Cause:** The scan data is outdated.

**Solution:**

1. Re-run the scanner to update the data:
   ```bash
   npx react-scanner
   ```
2. Refresh the dashboard or restart the server:
   ```bash
   react-scanner-studio start
   ```

---

### EACCES Permission Error

**Error:**

```
Error: EACCES: permission denied
```

**Cause:** Insufficient permissions to read/write files.

**Solutions:**

1. **Fix directory permissions:**

   ```bash
   sudo chown -R $(whoami) .
   ```

2. **Use a different output directory:**
   Update the `outputTo` path in your config to a writable location.

3. **Run with elevated permissions (not recommended):**
   ```bash
   sudo npx react-scanner-studio start
   ```

---

### ES Module Errors

**Error:**

```
Error: require() of ES Module not supported
```

**Cause:** Mixing CommonJS and ES modules incorrectly.

**Solution:**
Ensure your `react-scanner.config.js` uses CommonJS syntax:

```js
// ✓ Correct (CommonJS)
module.exports = {
  crawlFrom: './src',
  // ...
};

// ✗ Incorrect (ES Module)
export default {
  crawlFrom: './src',
  // ...
};
```

---

## Getting Help

If you're still experiencing issues:

1. **Check the GitHub Issues**
   - [Open Issues](https://github.com/vimalmunjani/react-scanner-studio/issues)
   - Search for similar problems

2. **Open a New Issue**
   - Provide your Node.js version: `node --version`
   - Include your `react-scanner.config.js`
   - Include the full error message
   - Describe the steps to reproduce

3. **Join the Community**
   - [GitHub Discussions](https://github.com/vimalmunjani/react-scanner-studio/discussions)
   - [Discord](https://discord.gg/D7n5c7bj)

## See Also

- [Installation](/guide/installation) — Installation guide
- [Configuration](/configuration/) — Configuration reference
- [CLI Commands](/cli/) — Command reference
