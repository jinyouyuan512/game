import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库文件路径
const dbPath = join(__dirname, 'you.sqlite');

// SQL文件路径
const sqlFilePath = join(__dirname, 'create_media_tables_sqlite.sql');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err);
    return;
  }
  console.log('成功连接到数据库');
});

// 读取并执行SQL文件
async function executeSqlFile() {
  try {
    const sql = await readFile(sqlFilePath, 'utf8');
    console.log('正在执行SQL文件...');
    
    // 分割SQL语句并逐个执行（避免.table命令）
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '').map(stmt => stmt.trim());
    
    // 移除包含.table的语句
    const filteredStatements = statements.filter(stmt => !stmt.includes('.tables'));
    
    for (const statement of filteredStatements) {
      if (statement.trim() !== '') {
        console.log('执行语句:', statement.substring(0, 50) + '...');
        await new Promise((resolve, reject) => {
          db.run(statement, (err) => {
            if (err) {
              console.error('执行语句出错:', err.message);
              reject(err);
            } else {
              console.log('语句执行成功');
              resolve();
            }
          });
        });
      }
    }
    
    console.log('SQL文件执行完成');
  } catch (error) {
    console.error('执行SQL文件时出错:', error);
  } finally {
    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接失败:', err);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  }
}

executeSqlFile();