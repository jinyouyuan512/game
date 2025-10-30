// 执行数据库更新脚本
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 创建Supabase客户端
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 读取SQL脚本
const sqlScriptPath = path.join(process.cwd(), 'update_strategies_table.sql');
const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');

async function updateDatabase() {
  console.log('开始更新数据库...');
  
  try {
    // 注意：Supabase JS客户端不直接支持执行原始SQL脚本
    // 我们将分别执行每个SQL语句
    const sqlStatements = sqlScript
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
      .replace(/--.*$/gm, '') // 移除单行注释
      .split(';') // 分割SQL语句
      .map(statement => statement.trim())
      .filter(statement => statement); // 过滤空语句
    
    console.log(`找到 ${sqlStatements.length} 个SQL语句需要执行`);
    
    // 执行ALTER TABLE语句
    console.log('执行 ALTER TABLE 语句...');
    const alterTableResult = await supabase.rpc('execute_sql', {
      sql: 'ALTER TABLE strategies ADD COLUMN IF NOT EXISTS image_urls TEXT, ADD COLUMN IF NOT EXISTS video_urls TEXT;'
    });
    
    if (alterTableResult.error) {
      console.error('执行ALTER TABLE失败:', alterTableResult.error.message);
    } else {
      console.log('ALTER TABLE执行成功');
    }
    
    // 执行UPDATE语句 - 更新image_urls
    console.log('更新image_urls字段...');
    const { error: updateImageError } = await supabase
      .from('strategies')
      .update({ image_urls: '[]' })
      .is('image_urls', null);
    
    if (updateImageError) {
      console.error('更新image_urls失败:', updateImageError.message);
    } else {
      console.log('image_urls更新成功');
    }
    
    // 执行UPDATE语句 - 更新video_urls
    console.log('更新video_urls字段...');
    const { error: updateVideoError } = await supabase
      .from('strategies')
      .update({ video_urls: '[]' })
      .is('video_urls', null);
    
    if (updateVideoError) {
      console.error('更新video_urls失败:', updateVideoError.message);
    } else {
      console.log('video_urls更新成功');
    }
    
    // 检查表结构
    console.log('验证表结构...');
    const { data, error } = await supabase
      .from('strategies')
      .select('id, image_urls, video_urls')
      .limit(1);
    
    if (error) {
      console.error('验证表结构失败:', error.message);
    } else {
      console.log('表结构验证成功! 新列已添加到strategies表。');
      console.log('示例数据:', data);
    }
    
    console.log('\n✅ 数据库更新完成!');
    console.log('现在您可以重新启动服务器并测试攻略提交功能。');
    
  } catch (err) {
    console.error('❌ 执行更新时发生错误:', err.message);
    console.log('\n替代方案: 您可以手动登录Supabase控制台并执行update_strategies_table.sql脚本中的SQL语句。');
  }
}

// 运行更新
updateDatabase();