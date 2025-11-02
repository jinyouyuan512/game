import { supabase } from './server.js';
import fs from 'fs';
import path from 'path';

async function fixCorruptedFilenames() {
  try {
    console.log('开始修复数据库中的乱码文件名...');
    
    // 1. 获取所有media_videos记录
    const { data: videos, error: videosError } = await supabase
      .from('media_videos')
      .select('*');
    
    if (videosError) {
      console.error('获取视频记录失败:', videosError);
      return;
    }
    
    console.log(`找到 ${videos.length} 条视频记录`);
    
    // 2. 检查并修复每条记录
    for (const video of videos) {
      const { id, strategy_id, file_path, file_name } = video;
      
      // 检查文件名是否包含乱码字符
      if (file_name.includes('è') || file_name.includes('å') || file_name.includes('ä')) {
        console.log(`发现乱码文件名: ${file_name} (ID: ${id})`);
        
        // 尝试修复文件名
        try {
          // 将乱码字符串转换为Buffer，然后重新解码为UTF-8
          const buffer = Buffer.from(file_name, 'latin1');
          const fixedFileName = buffer.toString('utf8');
          
          // 构建修复后的文件路径
          const fixedFilePath = `/uploads/videos/${fixedFileName}`;
          
          console.log(`修复后的文件名: ${fixedFileName}`);
          console.log(`修复后的文件路径: ${fixedFilePath}`);
          
          // 检查实际文件是否存在
          const actualFilePath = path.join(process.cwd(), '../uploads/videos', fixedFileName);
          const originalFilePath = path.join(process.cwd(), '../uploads/videos', file_name);
          
          let fileExists = false;
          if (fs.existsSync(actualFilePath)) {
            fileExists = true;
            console.log(`文件存在: ${actualFilePath}`);
          } else if (fs.existsSync(originalFilePath)) {
            // 如果修复后的文件名不存在，但原始文件名存在，则重命名文件
            console.log(`重命名文件: ${originalFilePath} -> ${actualFilePath}`);
            fs.renameSync(originalFilePath, actualFilePath);
            fileExists = true;
          } else {
            console.log(`文件不存在: ${actualFilePath} 或 ${originalFilePath}`);
          }
          
          if (fileExists) {
            // 更新数据库记录
            const { error: updateError } = await supabase
              .from('media_videos')
              .update({
                file_name: fixedFileName,
                file_path: fixedFilePath
              })
              .eq('id', id);
            
            if (updateError) {
              console.error(`更新记录 ${id} 失败:`, updateError);
            } else {
              console.log(`✅ 成功更新记录 ${id}`);
            }
          }
        } catch (fixError) {
          console.error(`修复文件名失败:`, fixError);
        }
      }
    }
    
    // 3. 对media_images表做同样的处理
    const { data: images, error: imagesError } = await supabase
      .from('media_images')
      .select('*');
    
    if (imagesError) {
      console.error('获取图片记录失败:', imagesError);
      return;
    }
    
    console.log(`找到 ${images.length} 条图片记录`);
    
    // 4. 检查并修复每条图片记录
    for (const image of images) {
      const { id, strategy_id, file_path, file_name } = image;
      
      // 检查文件名是否包含乱码字符
      if (file_name.includes('è') || file_name.includes('å') || file_name.includes('ä')) {
        console.log(`发现乱码文件名: ${file_name} (ID: ${id})`);
        
        // 尝试修复文件名
        try {
          // 将乱码字符串转换为Buffer，然后重新解码为UTF-8
          const buffer = Buffer.from(file_name, 'latin1');
          const fixedFileName = buffer.toString('utf8');
          
          // 构建修复后的文件路径
          const fixedFilePath = `/uploads/images/${fixedFileName}`;
          
          console.log(`修复后的文件名: ${fixedFileName}`);
          console.log(`修复后的文件路径: ${fixedFilePath}`);
          
          // 检查实际文件是否存在
          const actualFilePath = path.join(process.cwd(), '../uploads/images', fixedFileName);
          const originalFilePath = path.join(process.cwd(), '../uploads/images', file_name);
          
          let fileExists = false;
          if (fs.existsSync(actualFilePath)) {
            fileExists = true;
            console.log(`文件存在: ${actualFilePath}`);
          } else if (fs.existsSync(originalFilePath)) {
            // 如果修复后的文件名不存在，但原始文件名存在，则重命名文件
            console.log(`重命名文件: ${originalFilePath} -> ${actualFilePath}`);
            fs.renameSync(originalFilePath, actualFilePath);
            fileExists = true;
          } else {
            console.log(`文件不存在: ${actualFilePath} 或 ${originalFilePath}`);
          }
          
          if (fileExists) {
            // 更新数据库记录
            const { error: updateError } = await supabase
              .from('media_images')
              .update({
                file_name: fixedFileName,
                file_path: fixedFilePath
              })
              .eq('id', id);
            
            if (updateError) {
              console.error(`更新记录 ${id} 失败:`, updateError);
            } else {
              console.log(`✅ 成功更新记录 ${id}`);
            }
          }
        } catch (fixError) {
          console.error(`修复文件名失败:`, fixError);
        }
      }
    }
    
    console.log('修复完成！');
  } catch (error) {
    console.error('修复过程中发生错误:', error);
  }
  
  process.exit(0);
}

fixCorruptedFilenames();