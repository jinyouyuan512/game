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
  
  // 开始事务
  db.serialize(() => {
    // 1. 首先在strategies表中插入一条新记录
    const strategyInsert = `
      INSERT INTO strategies (id, title, content, difficulty, type, game_id, user_id, view_count, status, createdAt, updatedAt, video_urls)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const strategyData = [
      28,  // id
      "测试策略28",  // title
      "这是一个测试策略，用于验证视频功能",  // content
      "easy",  // difficulty
      "guide",  // type
      1,  // game_id
      1,  // user_id
      0,  // view_count
      "published",  // status
      new Date().toISOString(),  // createdAt
      new Date().toISOString(),  // updatedAt
      JSON.stringify(['/uploads/videos/test_video.mp4'])  // video_urls
    ];
    
    db.run(strategyInsert, strategyData, function(err) {
      if (err) {
        console.error('插入策略记录失败:', err.message);
      } else {
        console.log(`成功插入策略记录，ID: ${this.lastID || 28}`);
        console.log('视频URL已直接设置到strategy的video_urls字段');
      }
      
      // 关闭数据库连接
      db.close((err) => {
        if (err) {
          console.error('关闭数据库连接失败:', err.message);
        } else {
          console.log('数据库连接已关闭');
        }
      });
    });
  });
});