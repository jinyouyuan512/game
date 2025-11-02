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

// 验证表是否存在
async function verifyTables() {
  try {
    console.log('开始验证数据库中的表...');
    
    // 查询PostgreSQL系统表以检查媒体表是否存在
    const { data: tables, error } = await supabase.rpc('pg_catalog.pg_tables', {
      schemaname: 'public'
    });
    
    if (error) {
      console.error('查询表时出错:', error.message);
      
      // 尝试使用另一种方式查询
      console.log('\n尝试使用SQL查询表...');
      try {
        const { data, error: sqlError } = await supabase.from('pg_catalog.pg_tables').select('tablename');
        if (sqlError) {
          console.error('SQL查询失败:', sqlError.message);
        } else {
          console.log('找到的表:', data.map(t => t.tablename).join(', '));
        }
      } catch (e) {
        console.error('无法查询表信息');
      }
      
      return;
    }
    
    // 提取表名列表
    const tableNames = tables.map(table => table.tablename);
    
    console.log('\n数据库中的表:');
    tableNames.forEach(table => console.log(`- ${table}`));
    
    // 检查媒体表是否存在
    const mediaImagesExists = tableNames.includes('media_images');
    const mediaVideosExists = tableNames.includes('media_videos');
    
    console.log('\n验证结果:');
    console.log(`✅ media_images表: ${mediaImagesExists ? '存在' : '不存在'}`);
    console.log(`✅ media_videos表: ${mediaVideosExists ? '存在' : '不存在'}`);
    
    if (mediaImagesExists && mediaVideosExists) {
      console.log('\n✅ 成功！所有媒体表都已创建。');
      
      // 尝试查询表结构
      console.log('\n尝试获取表结构...');
      try {
        const { data: imagesColumns } = await supabase.from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_name', 'media_images');
          
        const { data: videosColumns } = await supabase.from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_name', 'media_videos');
          
        if (imagesColumns) {
          console.log('\nmedia_images表结构:');
          imagesColumns.forEach(col => console.log(`- ${col.column_name}: ${col.data_type}`));
        }
        
        if (videosColumns) {
          console.log('\nmedia_videos表结构:');
          videosColumns.forEach(col => console.log(`- ${col.column_name}: ${col.data_type}`));
        }
      } catch (e) {
        console.log('无法获取表结构详情');
      }
    } else {
      console.log('\n❌ 失败！某些媒体表未创建。');
      console.log('建议手动执行SQL脚本:');
      console.log(`psql "${process.env.DATABASE_URL}" -f create_media_tables.sql`);
    }
    
  } catch (error) {
    console.error('验证过程中发生错误:', error.message);
  }
}

verifyTables();