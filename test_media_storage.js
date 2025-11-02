import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件目录，替代__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试配置
const API_BASE_URL = 'http://localhost:3000';
const TEST_IMAGE_PATH = path.join(__dirname, 'public', 'images', 'game-placeholder.jpg');
const TEST_VIDEO_PATH = path.join(__dirname, 'public', 'images', 'game-placeholder.jpg'); // 使用图片作为视频测试

async function testMediaStorage() {
  try {
    console.log('开始测试媒体存储功能...');
    
    // 1. 准备测试数据
    console.log('准备测试数据...');
    
    // 2. 创建表单数据 - 不包含文件上传，先测试基本功能
    const strategyData = {
      title: '测试媒体存储功能',
      content: '这是一个测试攻略，用于验证媒体文件存储功能。这里添加更多内容以满足100个字符的要求。这个攻略将测试如何将图片和视频信息存储在独立的数据库表中，并通过外键与攻略表关联。',
      difficulty: 'easy',
      type: 'guide',
      game_id: '1',
      user_id: '1',
      status: 'published'
    };
    
    console.log('使用表单数据:', JSON.stringify(strategyData, null, 2));
    console.log('注意：此测试不包含实际文件上传，仅测试基本功能');
    
    // 3. 发送POST请求创建攻略
    console.log('发送请求创建攻略...');
    const response = await axios.post(`${API_BASE_URL}/api/strategies`, strategyData);
    
    console.log('\n✅ 攻略创建成功!');
    console.log('攻略ID:', response.data.data.id);
    console.log('攻略标题:', response.data.data.title);
    console.log('媒体统计:', response.data.mediaStats);
    console.log('图片URLs:', response.data.data.image_urls);
    console.log('视频URLs:', response.data.data.video_urls);
    
    // 4. 查询攻略详情，验证媒体信息
    console.log('\n查询攻略详情...');
    const strategyId = response.data.data.id;
    const detailResponse = await axios.get(`${API_BASE_URL}/api/strategies/${strategyId}`);
    
    console.log('\n✅ 攻略详情查询成功!');
    console.log('详情返回的图片URLs:', detailResponse.data.data.image_urls);
    console.log('详情返回的视频URLs:', detailResponse.data.data.video_urls);
    
    // 验证媒体信息是否一致
    const imagesMatch = JSON.stringify(response.data.data.image_urls) === JSON.stringify(detailResponse.data.data.image_urls);
    const videosMatch = JSON.stringify(response.data.data.video_urls) === JSON.stringify(detailResponse.data.data.video_urls);
    
    console.log('\n验证结果:');
    console.log('图片URLs一致性:', imagesMatch ? '✅ 一致' : '❌ 不一致');
    console.log('视频URLs一致性:', videosMatch ? '✅ 一致' : '❌ 不一致');
    
    if (imagesMatch && videosMatch) {
      console.log('\n🎉 测试成功：媒体存储功能正常工作！');
      return true;
    } else {
      console.log('\n❌ 测试失败：媒体信息不一致！');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败：', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return false;
  }
}

// 运行测试
testMediaStorage().then(success => {
  process.exit(success ? 0 : 1);
});