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

// 更新策略的video_urls字段
const updateQuery = `
  UPDATE strategies 
  SET video_urls = ? 
  WHERE id = ?
`;

// 视频URL数组（JSON格式）
const videoUrls = JSON.stringify([
  '/uploads/videos/飞驰高度路晚到行驶中的跑车红色汽车.mp4'
]);

// 策略ID
const strategyId = 1;

db.run(updateQuery, [videoUrls, strategyId], function(err) {
  if (err) {
    console.error('更新策略视频URL失败:', err);
  } else {
    console.log(`成功更新策略 ${strategyId} 的视频URL`);
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