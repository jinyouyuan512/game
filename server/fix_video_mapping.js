import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixVideoMapping() {
    try {
        console.log('🔧 开始修复视频URL映射...');
        
        // 检查实际文件
        const videosDir = path.join(process.cwd(), 'uploads', 'videos');
        const files = fs.readdirSync(videosDir);
        
        console.log(`找到 ${files.length} 个视频文件:`);
        files.forEach((file, index) => {
            console.log(`${index + 1}. ${file}`);
        });
        
        if (files.length === 0) {
            console.log('没有找到视频文件');
            return;
        }
        
        // 使用第一个视频文件
        const videoFile = files[0];
        const videoUrl = `/uploads/videos/${encodeURIComponent(videoFile)}`;
        
        console.log(`\n将使用视频文件: ${videoFile}`);
        console.log(`生成的URL: ${videoUrl}`);
        
        // 更新策略28的video_urls字段
        const { data, error } = await supabase
            .from('strategies')
            .update({ 
                video_urls: [videoUrl]
            })
            .eq('id', 28)
            .select();
            
        if (error) {
            console.error('更新策略28失败:', error);
            return;
        }
        
        console.log('✅ 成功更新策略28的视频URL:');
        console.log(JSON.stringify(data, null, 2));
        
        // 验证更新结果
        const { data: updatedStrategy, error: verifyError } = await supabase
            .from('strategies')
            .select('id, title, video_urls')
            .eq('id', 28)
            .single();
            
        if (verifyError) {
            console.error('验证更新失败:', verifyError);
        } else {
            console.log('\n🔍 验证更新结果:');
            console.log(`策略ID: ${updatedStrategy.id}`);
            console.log(`标题: ${updatedStrategy.title}`);
            console.log(`视频URLs: ${JSON.stringify(updatedStrategy.video_urls, null, 2)}`);
        }
        
    } catch (error) {
        console.error('修复过程中出错:', error);
    }
}

fixVideoMapping();