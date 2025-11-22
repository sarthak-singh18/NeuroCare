const fs = require('fs');
const path = require('path');

const DEFAULT_DB = {
  profiles: {},
  consents: [],
  analyses: []
};

const DEFAULT_DB_PATH = path.join(__dirname, '../../data/db.json');

function getDbPath() {
  return process.env.NEURACARE_DB_PATH || DEFAULT_DB_PATH;
}

class Mutex {
  constructor() {
    this._locked = false;
    this._queue = [];
  }

  lock() {
    return new Promise((resolve) => {
      if (!this._locked) {
        this._locked = true;
        resolve();
      } else {
        this._queue.push(resolve);
      }
    });
  }

  unlock() {
    const next = this._queue.shift();
    if (next) {
      next();
    } else {
      this._locked = false;
    }
  }
}

const mutex = new Mutex();

async function ensureFile() {
  const dbPath = getDbPath();
  await fs.promises.mkdir(path.dirname(dbPath), { recursive: true });
  try {
    await fs.promises.access(dbPath, fs.constants.F_OK);
  } catch (_) {
    await fs.promises.writeFile(dbPath, JSON.stringify(DEFAULT_DB, null, 2));
  }
}

function normalize(data = {}) {
  return {
    profiles: data.profiles || {},
    consents: Array.isArray(data.consents) ? data.consents : [],
    analyses: Array.isArray(data.analyses) ? data.analyses : []
  };
}

async function withLock(task) {
  await mutex.lock();
  try {
    return await task();
  } finally {
    mutex.unlock();
  }
}

async function readDB() {
  return withLock(async () => {
    const dbPath = getDbPath();
    await ensureFile();
    try {
      const raw = await fs.promises.readFile(dbPath, 'utf8');
      const parsed = raw ? JSON.parse(raw) : DEFAULT_DB;
      return normalize(parsed);
    } catch (error) {
      console.error('[DB] Failed to read database file:', error.message);
      throw new Error('Unable to read local database');
    }
  });
}

async function writeDB(nextData) {
  if (!nextData || typeof nextData !== 'object') {
    throw new Error('writeDB expects a plain object payload');
  }

  return withLock(async () => {
    const dbPath = getDbPath();
    await ensureFile();
    const normalized = normalize(nextData);
    try {
  await fs.promises.writeFile(dbPath, JSON.stringify(normalized, null, 2));
      return normalized;
    } catch (error) {
      console.error('[DB] Failed to write database file:', error.message);
      throw new Error('Unable to write to local database');
    }
  });
}

async function updateDB(mutator) {
  if (typeof mutator !== 'function') {
    throw new Error('updateDB expects a mutator function');
  }

  return withLock(async () => {
    const dbPath = getDbPath();
    await ensureFile();
    let current = DEFAULT_DB;
    try {
      const raw = await fs.promises.readFile(dbPath, 'utf8');
      current = raw ? JSON.parse(raw) : DEFAULT_DB;
    } catch (error) {
      console.error('[DB] Failed during update read:', error.message);
    }

    const draft = normalize(current);
    const updated = await mutator(draft) || draft;
    const normalized = normalize(updated);

    try {
  await fs.promises.writeFile(dbPath, JSON.stringify(normalized, null, 2));
      return normalized;
    } catch (error) {
      console.error('[DB] Failed during update write:', error.message);
      throw new Error('Unable to persist update to database');
    }
  });
}

module.exports = {
  getDbPath,
  readDB,
  writeDB,
  updateDB,
  DEFAULT_DB
};
