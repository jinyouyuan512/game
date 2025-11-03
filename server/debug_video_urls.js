import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugVideoUrls() {
    try {
        console.log('🔍 查询数据库中的视频记录...');
        
        // 查询所有包含视频的策略
        const { data: strategies, error } = await supabase
            .from('strategies')
            .select('*')
            .not('video_urls', 'is', null);
            
        if (error) {
            console.error('查询策略失败:', error);
            return;
        }
        
        console.log(`找到 ${strategies.length} 个包含视频的策略:`);
        
        strategies.forEach((strategy, index) => {
            console.log(`\n策略 ${index + 1}:`);
            console.log(`ID: ${strategy.id}`);
            console.log(`标题: ${strategy.title}`);
            console.log(`视频URL: ${strategy.video_urls}`);
        });
        
        // 检查实际文件
        const videosDir = path.join(process.cwd(), 'uploads', 'videos');
        console.log(`\n📁 检查实际文件目录: ${videosDir}`);
        
        if (fs.existsSync(videosDir)) {
            const files = fs.readdirSync(videosDir);
            console.log(`实际文件列表 (${files.length} 个文件):`);
            files.forEach((file, index) => {
                console.log(`${index + 1}. ${file}`);
            });
        } else {
            console.log('视频目录不存在');
        }
        
        // 查询媒体资源表
        console.log('\n🎬 查询媒体资源表...');
        const { data: mediaResources, error: mediaError } = await supabase
            .from('media_resources')
            .select('*')
            .eq('type', 'video');
            
        if (mediaError) {
            console.error('查询媒体资源失败:', mediaError);
        } else {
            console.log(`找到 ${mediaResources.length} 个视频媒体资源:`);
            mediaResources.forEach((media, index) => {
                console.log(`\n媒体资源 ${index + 1}:`);
                console.log(`ID: ${media.id}`);
                console.log(`文件名: ${media.filename}`);
                console.log(`URL: ${media.url}`);
                console.log(`原始名称: ${media.original_name}`);
            });
        }
        
    } catch (error) {
        console.error('调试过程中出错:', error);
    }
}

debugVideoUrls();