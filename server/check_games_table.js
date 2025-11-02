import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库文件路径
const dbPath = join(__dirname, 'you.sqlite');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err);
    return;
  }
  console.log('成功连接到数据库');
});

// 查询Games表的结构
const query = `PRAGMA table_info(Games)`;

db.all(query, (err, rows) => {
  if (err) {
    console.error('查询错误:', err);
  } else {
    console.log('Games表结构:');
    rows.forEach(row => {
      console.log(`- ${row.name} (${row.type}) ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''}`);
    });
  }
  
  // 关闭数据库连接
  db.close((err) => {
    if (err) {
      console.error('关闭数据库连接失败:', err);
    } else {
      console.log('数据库连接已关闭');
    }
  });
});