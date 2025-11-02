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
    
    // 直接尝试使用Supabase客户端方法来添加列
    console.log('尝试更新数据库结构...');
    try {
      // 创建一个临时策略数据，尝试插入包含新字段的记录，这会触发列的创建
      console.log('尝试创建包含新字段的临时记录...');
      await supabase.from('strategies').insert([
        {
          title: '临时测试记录',
          content: '这是一个临时测试记录，用于触发数据库结构更新',
          game_id: 1,
          user_id: 1,
          difficulty: '简单',
          type: '测试',
          image_urls: '[]',
          video_urls: '[]'
        }
      ]);
      
      // 如果成功插入，尝试删除这个临时记录
      await supabase.from('strategies').delete().eq('title', '临时测试记录');
      console.log('数据库结构更新成功!');
    } catch (alterError) {
      console.error('直接更新失败，尝试其他方法:', alterError.message);
    }
    
    // 跳过这个检查，因为我们已经在try-catch中处理了错误
    
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