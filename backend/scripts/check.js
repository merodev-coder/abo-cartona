import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
async function check(dir) {
  for (const file of await readdir(dir, { withFileTypes: true })) {
    if (file.name === 'node_modules' || file.name === '.git') continue;
    const path = `${dir}/${file.name}`;
    if (file.isDirectory()) await check(path);
    else if (file.name.endsWith('.js')) {
      const result = spawnSync(process.execPath, ['--check', path], { stdio: 'inherit' });
      if (result.status !== 0) process.exitCode = 1;
    }
  }
}
await check('.');
