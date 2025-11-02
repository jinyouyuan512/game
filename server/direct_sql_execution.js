import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 获取Supabase配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('错误：缺少Supabase配置。请检查.env文件。');
  process.exit(1);
}

// ES模块中获取当前目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取SQL文件
const sqlFilePath = path.join(__dirname, 'create_media_tables.sql');
let sqlContent = '';

try {
  sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  console.log('成功读取SQL文件');
} catch (error) {
  console.error('读取SQL文件失败:', error.message);
  // 如果文件不存在，使用硬编码的SQL
  sqlContent = `-- 创建媒体文件存储表
-- 图片文件表
CREATE TABLE IF NOT EXISTS media_images (
    id SERIAL PRIMARY KEY,
    strategy_id INTEGER NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE
);

-- 视频文件表
CREATE TABLE IF NOT EXISTS media_videos (
    id SERIAL PRIMARY KEY,
    strategy_id INTEGER NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    duration INTEGER,  -- 视频时长（秒）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_media_images_strategy_id ON media_images(strategy_id);
CREATE INDEX IF NOT EXISTS idx_media_videos_strategy_id ON media_videos(strategy_id);`;
  console.log('使用内置SQL脚本');
}

// 分割SQL语句
function splitSqlStatements(sql) {
  // 简单的SQL语句分割，按分号分割但排除注释和字符串中的分号
  const statements = [];
  let currentStatement = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1] || '';

    // 处理块注释
    if (char === '/' && nextChar === '*' && !inSingleQuote && !inDoubleQuote) {
      inBlockComment = true;
      i++;
      continue;
    }
    if (char === '*' && nextChar === '/' && inBlockComment) {
      inBlockComment = false;
      i++;
      continue;
    }
    if (inBlockComment) continue;

    // 处理行注释
    if (char === '-' && nextChar === '-' && !inSingleQuote && !inDoubleQuote && !inBlockComment) {
      inComment = true;
      i++;
      continue;
    }
    if (char === '\n' && inComment) {
      inComment = false;
      continue;
    }
    if (inComment) continue;

    // 处理引号
    if (char === "'" && !inDoubleQuote && sql[i - 1] !== '\\') inSingleQuote = !inSingleQuote;
    if (char === '"' && !inSingleQuote && sql[i - 1] !== '\\') inDoubleQuote = !inDoubleQuote;

    // 添加字符到当前语句
    currentStatement += char;

    // 当遇到分号且不在引号或注释中时，分割语句
    if (char === ';' && !inSingleQuote && !inDoubleQuote && !inComment && !inBlockComment) {
      statements.push(currentStatement.trim());
      currentStatement = '';
    }
  }

  // 添加最后一个语句（如果有）
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements;
}

// 执行单个SQL语句
async function executeSqlStatement(statement) {
  try {
    console.log(`\n尝试执行SQL: ${statement.substring(0, 50)}...`);
    
    // 使用Supabase REST API的rpc端点执行SQL
    // 注意：这需要数据库中有一个可以执行SQL的存储过程
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql: statement })
    });

    const result = await response.json();
    console.log('执行结果:', result);
    return { success: true, result };
  } catch (error) {
    console.error('执行SQL失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 尝试重新加载schema
async function reloadSchema() {
  try {
    console.log('\n尝试重新加载Supabase Schema...');
    
    // 使用NOTIFY命令重新加载schema
    const reloadSql = "NOTIFY pgrst, 'reload schema';";
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql: reloadSql })
    });

    if (response.ok) {
      console.log('✅ Schema重新加载请求已发送');
    } else {
      console.log('❌ Schema重新加载失败:', await response.text());
    }
  } catch (error) {
    console.error('Schema重新加载异常:', error.message);
  }
}

// 主函数
async function main() {
  console.log('开始直接执行SQL创建媒体表...');
  
  // 分割SQL语句
  const statements = splitSqlStatements(sqlContent);
  console.log(`找到 ${statements.length} 个SQL语句`);

  // 执行每个SQL语句
  let successCount = 0;
  for (const statement of statements) {
    // 由于我们不能直接执行SQL，我们将显示SQL语句并提供手动执行的说明
    console.log(`\nSQL语句 ${successCount + 1}:`);
    console.log('```sql');
    console.log(statement);
    console.log('```');
    
    // 注意：由于安全限制，我们不能直接执行SQL，用户需要在控制台手动执行
    console.log('❌ 由于安全限制，此脚本无法直接执行SQL语句');
    console.log('✅ 请复制上面的SQL语句，在Supabase控制台中手动执行');
    
    successCount++;
  }

  // 提供手动执行的详细说明
  console.log('\n=========================================');
  console.log('请按照以下步骤在Supabase控制台中手动创建表:');
  console.log('1. 打开浏览器，访问:', supabaseUrl);
  console.log('2. 登录到您的Supabase账户');
  console.log('3. 进入您的项目');
  console.log('4. 点击左侧菜单中的"SQL Editor"');
  console.log('5. 复制上面显示的所有SQL语句并粘贴到SQL编辑器中');
  console.log('6. 点击"RUN"按钮执行SQL');
  console.log('7. 执行完成后，点击"Reload Schema"按钮刷新缓存');
  console.log('=========================================');

  console.log('\n建议：如果您有psql命令行工具，可以尝试以下命令:');
  // 这里我们提供了使用psql的命令模板，但不执行它
  console.log(`psql "${supabaseUrl.replace('https://', 'postgresql://postgres:YOUR_PASSWORD@')}/postgres" -f create_media_tables.sql`);
}

main();