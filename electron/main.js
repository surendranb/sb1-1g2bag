import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database('finance.db');

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    description TEXT,
    amount REAL,
    category TEXT,
    source TEXT,
    statement_id INTEGER
  );
  
  CREATE TABLE IF NOT EXISTS statements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    type TEXT,
    imported_at TEXT
  );
`);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for database operations
ipcMain.handle('save-transactions', async (event, transactions) => {
  const stmt = db.prepare(`
    INSERT INTO transactions (date, description, amount, category, source, statement_id)
    VALUES (@date, @description, @amount, @category, @source, @statement_id)
  `);
  
  const insertMany = db.transaction((transactions) => {
    for (const trans of transactions) {
      stmt.run(trans);
    }
  });
  
  insertMany(transactions);
  return true;
});

ipcMain.handle('get-transactions', async () => {
  const transactions = db.prepare('SELECT * FROM transactions ORDER BY date DESC').all();
  return transactions;
});