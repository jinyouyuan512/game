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

// 查询包含特定UUID的视频记录
const query = `
  SELECT * FROM media_videos 
  WHERE file_path LIKE '%8c166af6-8b15-4ae5-bcfb-7a9931a8ed3a%'
`;

db.all(query, (err, rows) => {
  if (err) {
    console.error('查询错误:', err);
  } else {
    console.log('查询结果:');
    console.log(rows);
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