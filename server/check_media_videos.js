import { supabase } from './server.js';

async function checkMediaVideos() {
  try {
    console.log('检查media_videos表中id=28的记录...');
    const { data, error } = await supabase
      .from('media_videos')
      .select('*')
      .eq('strategy_id', 28);
    
    if (error) {
      console.error('查询失败:', error);
      return;
    }
    
    console.log('查询结果:');
    console.log('记录数量:', data.length);
    if (data.length > 0) {
      data.forEach((record, index) => {
        console.log(`记录 ${index + 1}:`);
        console.log('ID:', record.id);
        console.log('Strategy ID:', record.strategy_id);
        console.log('File Path:', record.file_path);
        console.log('File Name:', record.file_name);
        console.log('Created At:', record.created_at);
        console.log('---');
      });
    } else {
      console.log('没有找到相关记录');
    }
  } catch (error) {
    console.error('执行错误:', error);
  }
  
  process.exit(0);
}

checkMediaVideos();