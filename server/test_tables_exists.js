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

// 测试表是否存在
async function testTables() {
  console.log('开始测试媒体表是否存在...');
  
  try {
    // 尝试查询media_images表
    console.log('\n测试media_images表...');
    try {
      const { data, error } = await supabase.from('media_images').select('*').limit(1);
      if (error) {
        if (error.message.includes('relation')) {
          console.log('❌ media_images表不存在');
        } else {
          console.log('⚠️ 查询时出现错误:', error.message);
          console.log('✅ 但表可能存在');
        }
      } else {
        console.log('✅ media_images表存在');
        console.log(`   找到 ${data.length} 条记录`);
      }
    } catch (e) {
      console.log('❌ media_images表不存在或无法访问');
    }
    
    // 尝试查询media_videos表
    console.log('\n测试media_videos表...');
    try {
      const { data, error } = await supabase.from('media_videos').select('*').limit(1);
      if (error) {
        if (error.message.includes('relation')) {
          console.log('❌ media_videos表不存在');
        } else {
          console.log('⚠️ 查询时出现错误:', error.message);
          console.log('✅ 但表可能存在');
        }
      } else {
        console.log('✅ media_videos表存在');
        console.log(`   找到 ${data.length} 条记录`);
      }
    } catch (e) {
      console.log('❌ media_videos表不存在或无法访问');
    }
    
    // 尝试直接执行原始SQL来创建表
    console.log('\n尝试使用psql命令行工具创建表...');
    console.log(`请手动运行以下命令：`);
    console.log(`psql "${process.env.DATABASE_URL}" -f create_media_tables.sql`);
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

testTables();