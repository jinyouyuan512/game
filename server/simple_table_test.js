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

// 简单测试函数
async function simpleTest() {
  console.log('开始简单测试...');
  
  try {
    // 打印Supabase URL用于手动访问
    console.log(`\nSupabase控制台URL: ${supabaseUrl}/editor`);
    console.log('请在控制台中手动执行以下SQL:');
    console.log('```sql');
    console.log('-- 创建媒体文件存储表');
    console.log('-- 图片文件表');
    console.log('CREATE TABLE IF NOT EXISTS media_images (');
    console.log('    id SERIAL PRIMARY KEY,');
    console.log('    strategy_id INTEGER NOT NULL,');
    console.log('    file_path VARCHAR(255) NOT NULL,');
    console.log('    file_name VARCHAR(255) NOT NULL,');
    console.log('    file_size INTEGER,');
    console.log('    mime_type VARCHAR(100),');
    console.log('    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,');
    console.log('    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE');
    console.log(');');
    console.log('');
    console.log('-- 视频文件表');
    console.log('CREATE TABLE IF NOT EXISTS media_videos (');
    console.log('    id SERIAL PRIMARY KEY,');
    console.log('    strategy_id INTEGER NOT NULL,');
    console.log('    file_path VARCHAR(255) NOT NULL,');
    console.log('    file_name VARCHAR(255) NOT NULL,');
    console.log('    file_size INTEGER,');
    console.log('    mime_type VARCHAR(100),');
    console.log('    duration INTEGER,  -- 视频时长（秒）');
    console.log('    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,');
    console.log('    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE');
    console.log(');');
    console.log('');
    console.log('-- 添加索引');
    console.log('CREATE INDEX IF NOT EXISTS idx_media_images_strategy_id ON media_images(strategy_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_media_videos_strategy_id ON media_videos(strategy_id);');
    console.log('```');
    
    // 尝试测试插入操作
    console.log('\n尝试测试插入操作（如果表不存在会报错）...');
    
    try {
      const { data, error } = await supabase.from('media_images')
        .insert([{
          strategy_id: 1,
          file_path: '/test/path.jpg',
          file_name: 'test.jpg',
          file_size: 1024,
          mime_type: 'image/jpeg'
        }])
        .select()
        .single();
      
      if (error) {
        if (error.message.includes('relation')) {
          console.log('❌ media_images表不存在');
          console.log('错误详情:', error.message);
        } else {
          console.log('✅ media_images表存在，但插入可能有其他错误:', error.message);
        }
      } else {
        console.log('✅ media_images表存在且可以插入数据');
        // 清理测试数据
        await supabase.from('media_images').delete().eq('id', data.id);
      }
    } catch (e) {
      console.log('❌ media_images表测试失败:', e.message);
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

simpleTest();