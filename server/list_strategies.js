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

// 查询所有策略
const query = `
  SELECT id, title, video_urls 
  FROM strategies
`;

db.all(query, (err, rows) => {
  if (err) {
    console.error('查询策略失败:', err);
  } else {
    console.log('所有策略:');
    if (rows.length === 0) {
      console.log('没有找到策略记录');
    } else {
      rows.forEach(row => {
        console.log(`ID: ${row.id}`);
        console.log(`标题: ${row.title}`);
        console.log(`视频URLs: ${row.video_urls}`);
        console.log('---');
      });
    }
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