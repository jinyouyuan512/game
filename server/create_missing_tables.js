import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const sqlite3v = sqlite3.verbose();

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库文件路径
const dbPath = path.join(__dirname, 'database.db');
const sqlFilePath = path.join(__dirname, 'add_missing_tables.sql');

// 读取SQL文件
function readSqlFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('读取SQL文件失败:', error.message);
    process.exit(1);
  }
}

// 执行SQL语句
function executeSql(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// 主函数
async function createMissingTables() {
  console.log('开始创建缺失的数据表...');
  
  // 创建数据库连接
  const db = new sqlite3v.Database(dbPath, (err) => {
    if (err) {
      console.error('连接数据库失败:', err.message);
      process.exit(1);
    }
    console.log('成功连接到数据库');
  });
  
  try {
    // 读取SQL文件
    const sql = readSqlFile(sqlFilePath);
    
    // 执行SQL
    await executeSql(db, sql);
    console.log('✅ 成功创建所有缺失的数据表');
    
    // 提示用户重启服务器
    console.log('\n请重启服务器以应用新的数据库结构');
    
  } catch (error) {
    console.error('❌ 创建数据表失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接失败:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  }
}

// 运行脚本
createMissingTables();