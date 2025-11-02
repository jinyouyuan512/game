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

// 直接执行SQL创建表
async function createTablesDirectly() {
  try {
    console.log('开始直接在Supabase中创建媒体表...');
    
    // 分割SQL脚本为单独的语句
    const sqlStatements = sqlContent.split(';').filter(statement => {
      const trimmed = statement.trim();
      return trimmed && !trimmed.startsWith('--');
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of sqlStatements) {
      try {
        // 在Supabase中，我们需要使用rpc来执行原始SQL
        // 但由于之前的方法失败，我们尝试直接使用SQL插入数据的方式来验证表是否存在
        console.log(`\n尝试执行: ${statement.substring(0, 50)}...`);
        
        // 对于表创建，我们可以尝试直接查询是否存在，如果不存在则尝试创建
        if (statement.includes('CREATE TABLE')) {
          // 提取表名
          const tableNameMatch = statement.match(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(?:public\.)?([^\s(]+)/i);
          if (tableNameMatch) {
            const tableName = tableNameMatch[1];
            console.log(`检查表 ${tableName} 是否存在...`);
            
            try {
              // 尝试查询表是否存在
              const { data } = await supabase.rpc('pg_table_exists', {
                schema_name: 'public',
                table_name: tableName
              });
              console.log(`查询结果: ${data}`);
            } catch (e) {
              console.log(`无法直接检查表是否存在: ${e.message}`);
              console.log('尝试使用替代方法...');
            }
            
            // 尝试使用http请求直接执行SQL（通过Supabase的rest API）
            console.log(`尝试使用HTTP请求创建表 ${tableName}...`);
            try {
              const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  sql: statement + ';'
                })
              });
              
              const result = await response.json();
              console.log(`HTTP请求结果: ${response.status} ${response.statusText}`);
              if (response.ok) {
                console.log('✅ 表创建成功');
                successCount++;
              } else {
                console.log('❌ 表创建失败:', result);
                errorCount++;
              }
            } catch (httpError) {
              console.log('❌ HTTP请求失败:', httpError.message);
              errorCount++;
            }
          }
        } else if (statement.includes('CREATE INDEX')) {
          // 处理索引创建
          console.log('尝试创建索引...');
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                sql: statement + ';'
              })
            });
            
            if (response.ok) {
              console.log('✅ 索引创建成功');
              successCount++;
            } else {
              console.log('❌ 索引创建失败');
              errorCount++;
            }
          } catch (e) {
            console.log('❌ 索引创建请求失败:', e.message);
            errorCount++;
          }
        }
        
      } catch (statementError) {
        console.log(`❌ 执行失败: ${statementError.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n✅ 执行完成: 成功 ${successCount}, 失败 ${errorCount}`);
    console.log('\n建议: 如果自动创建失败，请在Supabase控制台中手动执行SQL脚本');
    
  } catch (error) {
    console.error('❌ 执行过程中发生错误:', error.message);
  }
}

createTablesDirectly();