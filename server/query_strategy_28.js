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

// 查询第28个策略
const query = `
  SELECT id, title, video_urls 
  FROM strategies 
  WHERE id = 28
`;

db.get(query, (err, row) => {
  if (err) {
    console.error('查询策略失败:', err);
  } else if (!row) {
    console.log('未找到ID为28的策略');
  } else {
    console.log('策略信息:');
    console.log(`ID: ${row.id}`);
    console.log(`标题: ${row.title}`);
    console.log(`视频URLs: ${row.video_urls}`);
    
    // 解析视频URL数组
    try {
      const videoUrls = JSON.parse(row.video_urls);
      console.log('解析后的视频URL数组:');
      videoUrls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
    } catch (parseError) {
      console.error('解析视频URL失败:', parseError);
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