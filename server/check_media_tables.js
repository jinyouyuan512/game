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

// 检查媒体相关表是否存在
const tables = ['media_videos', 'media_images'];

tables.forEach(table => {
  const query = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`;
  
  db.get(query, [table], (err, row) => {
    if (err) {
      console.error(`查询${table}表错误:`, err);
    } else {
      if (row) {
        console.log(`表 ${table} 存在`);
      } else {
        console.log(`表 ${table} 不存在`);
      }
    }
  });
});

// 等待查询完成后再关闭连接
setTimeout(() => {
  // 关闭数据库连接
  db.close((err) => {
    if (err) {
      console.error('关闭数据库连接失败:', err);
    } else {
      console.log('数据库连接已关闭');
    }
  });
}, 1000);