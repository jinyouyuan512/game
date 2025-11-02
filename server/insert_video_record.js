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

// 插入视频记录
const insertQuery = `
  INSERT INTO media_videos (strategy_id, file_path, file_name, file_size, mime_type, duration)
  VALUES (?, ?, ?, ?, ?, ?)
`;

// 视频信息
const strategyId = 1; // 假设关联到策略ID 1
const filePath = '/uploads/videos/飞驰高度路晚到行驶中的跑车红色汽车.mp4';
const fileName = '飞驰高度路晚到行驶中的跑车红色汽车.mp4';
const fileSize = 1024000; // 假设文件大小为1MB
const mimeType = 'video/mp4';
const duration = 120; // 假设视频时长为120秒

db.run(insertQuery, [strategyId, filePath, fileName, fileSize, mimeType, duration], function(err) {
  if (err) {
    console.error('插入视频记录失败:', err);
  } else {
    console.log(`成功插入视频记录，ID: ${this.lastID}`);
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