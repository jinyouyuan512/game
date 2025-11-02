import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 初始化Supabase客户端
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('错误：缺少Supabase配置。请检查.env文件。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 尝试刷新Supabase schema缓存
async function refreshSchema() {
  try {
    console.log('开始刷新Supabase Schema缓存...');
    
    // 刷新schema缓存的方法
    console.log('方法1: 尝试使用pg_refresh_schema函数...');
    try {
      const { error } = await supabase.rpc('pg_refresh_schema', {
        schema_name: 'public'
      });
      if (error) {
        console.log('方法1失败:', error.message);
      } else {
        console.log('✅ 方法1成功刷新schema缓存');
      }
    } catch (e) {
      console.log('方法1执行失败:', e.message);
    }
    
    // 尝试方法2: 通过查询系统表来触发缓存更新
    console.log('\n方法2: 尝试查询系统表触发缓存更新...');
    try {
      await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      console.log('✅ 方法2触发缓存更新请求已发送');
    } catch (e) {
      console.log('方法2执行失败:', e.message);
    }
    
    // 等待几秒钟让缓存刷新
    console.log('\n等待3秒让缓存刷新...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 测试表是否可以访问
    console.log('\n刷新后测试表访问...');
    
    // 测试media_images表
    try {
      const { data, error } = await supabase.from('media_images').select('*').limit(1);
      if (error) {
        console.log('❌ media_images表访问失败:', error.message);
      } else {
        console.log(`✅ media_images表访问成功，找到${data.length}条记录`);
      }
    } catch (e) {
      console.log('❌ media_images表测试异常:', e.message);
    }
    
    // 测试media_videos表
    try {
      const { data, error } = await supabase.from('media_videos').select('*').limit(1);
      if (error) {
        console.log('❌ media_videos表访问失败:', error.message);
      } else {
        console.log(`✅ media_videos表访问成功，找到${data.length}条记录`);
      }
    } catch (e) {
      console.log('❌ media_videos表测试异常:', e.message);
    }
    
    console.log('\n建议操作:');
    console.log('1. 如果表仍无法访问，请在Supabase控制台手动刷新schema');
    console.log('2. 在控制台中执行以下步骤:');
    console.log('   - 进入SQL编辑器');
    console.log('   - 执行SQL: NOTIFY pgrst, \'reload schema\';');
    console.log('   - 或者重新运行我们的创建表SQL脚本');
    
  } catch (error) {
    console.error('刷新过程中发生错误:', error.message);
  }
}

refreshSchema();