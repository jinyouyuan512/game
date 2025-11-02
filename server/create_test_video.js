import { writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 视频文件路径
const videoPath = join(__dirname, 'uploads', 'videos', '飞驰高度路晚到行驶中的跑车红色汽车.mp4');

// 创建一个简单的测试视频文件（只是一个文本文件，但命名为.mp4）
const videoContent = `
这是一个测试视频文件，用于模拟"飞驰高度路晚到行驶中的跑车红色汽车.mp4"
实际应用中，这里应该是真正的视频文件内容。
`.trim();

async function createTestVideo() {
  try {
    // 确保目录存在
    const dirPath = join(__dirname, 'uploads', 'videos');
    
    // 创建视频文件
    await writeFile(videoPath, videoContent);
    console.log('测试视频文件创建成功:', videoPath);
  } catch (error) {
    console.error('创建测试视频文件失败:', error);
  }
}

createTestVideo();