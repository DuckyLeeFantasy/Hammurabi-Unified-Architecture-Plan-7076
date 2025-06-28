import sqlite3 from 'sqlite3';
import { join } from 'path';
import { app } from 'electron';

export class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = join(app.getPath('userData'), 'hammurabi.db');
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        this.createTables()
          .then(() => {
            console.log('Database initialized successfully');
            resolve();
          })
          .catch(reject);
      });
    });
  }

  async createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        config TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        message_type TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents (id)
      )`,
      `CREATE TABLE IF NOT EXISTS browser_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        title TEXT,
        visit_time DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        folder TEXT DEFAULT 'default',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS file_operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        agent_id TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const sql of tables) {
      await this.run(sql);
    }
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async query(sql, params = []) {
    if (sql.trim().toLowerCase().startsWith('select')) {
      return await this.all(sql, params);
    } else {
      return await this.run(sql, params);
    }
  }

  async saveSettings(settings) {
    const promises = Object.entries(settings).map(([key, value]) => {
      return this.run(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, JSON.stringify(value)]
      );
    });
    
    await Promise.all(promises);
    return { success: true };
  }

  async getSettings() {
    const rows = await this.all('SELECT key, value FROM settings');
    const settings = {};
    
    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch (e) {
        settings[row.key] = row.value;
      }
    }
    
    return settings;
  }

  async saveAgent(agentData) {
    return await this.run(
      'INSERT OR REPLACE INTO agents (id, name, type, config, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [agentData.id, agentData.name, agentData.type, JSON.stringify(agentData.config)]
    );
  }

  async getAgents() {
    const rows = await this.all('SELECT * FROM agents ORDER BY created_at DESC');
    return rows.map(row => ({
      ...row,
      config: JSON.parse(row.config)
    }));
  }

  async saveConversation(agentId, messageType, content) {
    return await this.run(
      'INSERT INTO conversations (id, agent_id, message_type, content) VALUES (?, ?, ?, ?)',
      [require('uuid').v4(), agentId, messageType, content]
    );
  }

  async getConversation(agentId, limit = 50) {
    return await this.all(
      'SELECT * FROM conversations WHERE agent_id = ? ORDER BY timestamp DESC LIMIT ?',
      [agentId, limit]
    );
  }

  async addBrowserHistory(url, title) {
    return await this.run(
      'INSERT INTO browser_history (url, title) VALUES (?, ?)',
      [url, title]
    );
  }

  async getBrowserHistory(limit = 100) {
    return await this.all(
      'SELECT * FROM browser_history ORDER BY visit_time DESC LIMIT ?',
      [limit]
    );
  }

  async addBookmark(url, title, folder = 'default') {
    return await this.run(
      'INSERT INTO bookmarks (url, title, folder) VALUES (?, ?, ?)',
      [url, title, folder]
    );
  }

  async getBookmarks(folder = null) {
    if (folder) {
      return await this.all(
        'SELECT * FROM bookmarks WHERE folder = ? ORDER BY created_at DESC',
        [folder]
      );
    } else {
      return await this.all(
        'SELECT * FROM bookmarks ORDER BY folder, created_at DESC'
      );
    }
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}