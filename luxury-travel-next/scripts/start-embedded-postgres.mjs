import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import pg from 'pg';

const databaseName = process.env.EMBEDDED_POSTGRES_DB || 'luxury_travel_next_utf8';
const port = Number(process.env.EMBEDDED_POSTGRES_PORT || 55432);
const user = process.env.EMBEDDED_POSTGRES_USER || 'postgres';
const password = process.env.EMBEDDED_POSTGRES_PASSWORD || 'postgres';
const runtimeRoot = path.resolve(
  process.env.EMBEDDED_POSTGRES_DIR || path.join(os.tmpdir(), 'luxury-travel-next-postgres')
);
const nativeDir = path.join(runtimeRoot, 'native');
const databaseDir = path.join(runtimeRoot, 'data');
const isWindows = process.platform === 'win32';
const executableSuffix = isWindows ? '.exe' : '';

function assertSafeRuntimePath(targetPath) {
  const root = path.resolve(runtimeRoot);
  const target = path.resolve(targetPath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Unsafe embedded Postgres runtime path: ${target}`);
  }
}

function quoteIdentifier(identifier) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid database name "${identifier}". Use letters, numbers, and underscores only.`);
  }
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function resolveNativeSourceDir() {
  const packageByPlatform = {
    darwin: { arm64: '@embedded-postgres/darwin-arm64', x64: '@embedded-postgres/darwin-x64' },
    linux: {
      arm: '@embedded-postgres/linux-arm',
      arm64: '@embedded-postgres/linux-arm64',
      ia32: '@embedded-postgres/linux-ia32',
      ppc64: '@embedded-postgres/linux-ppc64',
      x64: '@embedded-postgres/linux-x64'
    },
    win32: { x64: '@embedded-postgres/windows-x64' }
  };
  const platformPackages = packageByPlatform[process.platform];
  const packageName = platformPackages?.[process.arch];
  if (!packageName) {
    throw new Error(`Unsupported embedded Postgres platform: ${process.platform}/${process.arch}`);
  }
  const binaries = await import(packageName);
  return path.resolve(path.dirname(binaries.postgres), '..');
}

async function ensureNativeRuntime() {
  const postgresPath = path.join(nativeDir, 'bin', `postgres${executableSuffix}`);
  try {
    await fs.access(postgresPath);
    return;
  } catch {}

  await fs.mkdir(runtimeRoot, { recursive: true });
  const sourceDir = await resolveNativeSourceDir();
  await fs.cp(sourceDir, nativeDir, { recursive: true, force: true });
}

async function ensureDatabaseCluster(initdbPath) {
  const pgVersionPath = path.join(databaseDir, 'PG_VERSION');
  try {
    await fs.access(pgVersionPath);
    return;
  } catch {}

  await fs.mkdir(runtimeRoot, { recursive: true });
  const entries = await fs.readdir(databaseDir).catch(() => []);
  if (entries.length > 0) {
    assertSafeRuntimePath(databaseDir);
    await fs.rm(databaseDir, { recursive: true, force: true });
  }

  const passwordFile = path.join(runtimeRoot, 'pg-password.txt');
  await fs.writeFile(passwordFile, `${password}\n`);
  try {
    await runProcess(initdbPath, [
      `--pgdata=${databaseDir}`,
      '--auth=password',
      `--username=${user}`,
      `--pwfile=${passwordFile}`,
      '--lc-messages=C'
    ]);
  } finally {
    await fs.unlink(passwordFile).catch(() => undefined);
  }
}

function runProcess(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, LC_MESSAGES: 'C' }
    });
    let stderr = '';
    child.stdout?.on('data', (chunk) => process.stdout.write(chunk));
    child.stderr?.on('data', (chunk) => {
      stderr += String(chunk);
      process.stderr.write(chunk);
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${path.basename(command)} failed with code ${code}.\n${stderr}`));
    });
  });
}

// On Windows, Node.js child processes inherit the parent Job Object from the terminal
// (conhost/Windows Terminal). When the Job Object is destroyed (e.g. on console close or
// taskkill), ALL processes in the group – including detached postgres – receive
// STATUS_CONTROL_C_EXIT (0xC000013A), crashing postgres's background workers.
// The fix: use Windows Task Scheduler, which spawns the process in the Service session
// (session 0) completely outside any user Job Object.
function startPostgresWindows(postgresPath) {
  return new Promise((resolve, reject) => {
    const taskName = 'LuxuryTravelPostgresEmbedded';
    // Escape single quotes for PowerShell string literals
    const pgEsc = postgresPath.replace(/'/g, "''");
    const ddEsc = databaseDir.replace(/'/g, "''");
    const wdEsc = runtimeRoot.replace(/'/g, "''");
    const psCmd = [
      `Unregister-ScheduledTask -TaskName '${taskName}' -Confirm:$false -ErrorAction SilentlyContinue`,
      `$a = New-ScheduledTaskAction -Execute '${pgEsc}' -Argument ('-D "' + '${ddEsc}' + '" -p ${port}') -WorkingDirectory '${wdEsc}'`,
      `$s = New-ScheduledTaskSettingsSet -ExecutionTimeLimit 0 -MultipleInstances IgnoreNew`,
      `Register-ScheduledTask -TaskName '${taskName}' -Action $a -Settings $s -RunLevel Highest -Force | Out-Null`,
      `Start-ScheduledTask -TaskName '${taskName}'`,
      `exit 0`
    ].join('; ');

    const ps = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', psCmd], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stderr = '';
    ps.stderr?.on('data', (chunk) => { stderr += String(chunk); process.stderr.write(chunk); });
    ps.stdout?.on('data', (chunk) => { process.stdout.write(chunk); });
    ps.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Failed to register postgres Task Scheduler task (code ${code}):\n${stderr}`));
        return;
      }
      // Poll until postgres is actually accepting connections
      pollPort('127.0.0.1', port, 60_000)
        .then(() => resolve({ pid: null }))
        .catch(reject);
    });
  });
}

function pollPort(host, targetPort, timeoutMs) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const attempt = () => {
      const sock = new net.Socket();
      sock.setTimeout(1000);
      sock.connect(targetPort, host, () => { sock.destroy(); resolve(); });
      sock.on('error', () => { sock.destroy(); if (Date.now() < deadline) setTimeout(attempt, 500); else reject(new Error(`Postgres did not open port ${targetPort} within ${timeoutMs}ms`)); });
      sock.on('timeout', () => { sock.destroy(); if (Date.now() < deadline) setTimeout(attempt, 500); else reject(new Error(`Postgres did not open port ${targetPort} within ${timeoutMs}ms`)); });
    };
    attempt();
  });
}

function startPostgresUnix(postgresPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(postgresPath, ['-D', databaseDir, '-p', String(port)], {
      detached: true,
      stdio: ['ignore', 'ignore', 'pipe'],
      env: { ...process.env, LC_MESSAGES: 'C' }
    });
    let settled = false;
    child.stderr?.on('data', (chunk) => {
      const message = String(chunk);
      process.stderr.write(message);
      if (!settled && message.includes('database system is ready to accept connections')) {
        settled = true;
        resolve(child);
      }
    });
    child.on('close', (code) => {
      if (!settled) {
        reject(new Error(`postgres exited before accepting connections (code ${code ?? 'unknown'}).`));
      }
    });
  });
}

function startPostgres(postgresPath) {
  if (isWindows) return startPostgresWindows(postgresPath);
  return startPostgresUnix(postgresPath);
}

async function ensureDatabaseExists() {
  const { Client } = pg;
  const client = new Client({
    host: '127.0.0.1',
    port,
    user,
    password,
    database: 'postgres'
  });
  await client.connect();
  try {
    const existing = await client.query('select 1 from pg_database where datname = $1 limit 1', [
      databaseName
    ]);
    if (existing.rowCount === 0) {
      await client.query(`create database ${quoteIdentifier(databaseName)}`);
    }
  } finally {
    await client.end();
  }
}

async function stopPostgres(child) {
  if (!child?.pid) return;
  if (isWindows) {
    await new Promise((resolve) => {
      spawn('taskkill', ['/pid', String(child.pid), '/f', '/t']).on('close', resolve);
    });
    return;
  }
  child.kill('SIGINT');
}

async function main() {
  await ensureNativeRuntime();
  const initdbPath = path.join(nativeDir, 'bin', `initdb${executableSuffix}`);
  const postgresPath = path.join(nativeDir, 'bin', `postgres${executableSuffix}`);
  await ensureDatabaseCluster(initdbPath);
  const postgresProcess = await startPostgres(postgresPath);
  await ensureDatabaseExists();
  // On Unix, unref the child so Node.js exits without terminating postgres.
  // On Windows, postgres is started via Task Scheduler (no real child to unref).
  if (postgresProcess.unref) postgresProcess.unref();
  console.log(`Embedded Postgres ready at postgresql://${user}:${password}@localhost:${port}/${databaseName}`);
  console.log(`Runtime directory: ${runtimeRoot}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
