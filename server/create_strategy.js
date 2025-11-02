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

// 插入策略记录
const insertQuery = `
  INSERT INTO strategies (title, content, game_id, user_id, status, view_count, createdAt, updatedAt, difficulty, type, image_urls, video_urls)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// 策略信息
const title = '测试策略';
const content = '这是一个测试策略内容';
const gameId = 1;
const userId = 1;
const status = 'published';
const viewCount = 0;
const createdAt = new Date().toISOString();
const updatedAt = new Date().toISOString();
const difficulty = '简单';
const type = '攻略';
const imageUrls = JSON.stringify([]);
const videoUrls = JSON.stringify([
  '/uploads/videos/飞驰高度路晚到行驶中的跑车红色汽车.mp4'
]);

db.run(insertQuery, [title, content, gameId, userId, status, viewCount, createdAt, updatedAt, difficulty, type, imageUrls, videoUrls], function(err) {
  if (err) {
    console.error('插入策略记录失败:', err);
  } else {
    console.log(`成功插入策略记录，ID: ${this.lastID}`);
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