import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 加载环境变量
dotenv.config();

// 读取SQL脚本
const sqlFilePath = path.resolve('./create_media_tables.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// 初始化Supabase客户端
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('错误：缺少Supabase配置。请检查.env文件。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 执行SQL脚本
async function executeSqlScript() {
  try {
    console.log('开始在Supabase数据库中创建媒体表...');
    
    // 分割SQL脚本为单独的语句
    const sqlStatements = sqlContent.split(';').filter(statement => statement.trim().length > 0);
    
    for (const statement of sqlStatements) {
      try {
        const result = await supabase.rpc('pg_catalog.pg_statement_analyze', {
          query: statement + ';'
        });
        console.log(`✅ 执行成功: ${statement.substring(0, 50)}...`);
      } catch (statementError) {
        console.error(`❌ 执行失败: ${statement.substring(0, 50)}...`);
        console.error(statementError.message);
      }
    }
    
    console.log('\n✅ 所有表创建操作已完成！');
    
  } catch (error) {
    console.error('❌ 创建表时发生错误:', error.message);
    
    // 提供手动执行命令
    console.log('\n建议手动执行以下命令：');
    console.log(`psql "${process.env.DATABASE_URL}" -f ${sqlFilePath}`);
  }
}

executeSqlScript();