import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取当前文件目录，替代CommonJS中的__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 测试图片路径
let imagePath = path.join(__dirname, 'public', 'game-placeholder.jpg');

// 检查文件是否存在
if (!fs.existsSync(imagePath)) {
  console.log('图片文件不存在，尝试查找其他图片...');
  // 尝试备用路径
  const altImagePath = path.join(__dirname, 'uploads', 'images', 'game-placeholder.jpg');
  if (fs.existsSync(altImagePath)) {
    imagePath = altImagePath;
    console.log(`找到备用图片: ${imagePath}`);
  } else {
    console.error('找不到测试图片文件！');
    process.exit(1);
  }
}

console.log(`使用测试图片: ${imagePath}`);

// 创建包含图片的攻略
async function testImageUpload() {
  try {
    const formData = new FormData();
    
    // 添加攻略数据
    formData.append('title', '测试图片显示攻略');
    formData.append('content', '# 测试攻略内容\n这是一个测试攻略，用于验证图片显示功能。');
    formData.append('difficulty', '简单');
    formData.append('type', '攻略');
    formData.append('game_id', '1');
    formData.append('user_id', '1');
    
    // 添加图片文件（注意：后端期望的字段名是'images'）
    if (fs.existsSync(imagePath)) {
      formData.append('images', fs.createReadStream(imagePath));
      console.log('已添加图片文件到images字段');
    }
    
    // 发送POST请求创建攻略
    const createResponse = await axios.post('http://localhost:3000/api/strategies', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('攻略创建成功:', createResponse.data.id);
    console.log('返回的image_urls:', createResponse.data.image_urls);
    
    // 查询刚创建的攻略，验证数据是否正确保存
    const strategyId = createResponse.data.id;
    const queryResponse = await axios.get(`http://localhost:3000/api/strategies/${strategyId}`);
    
    console.log('查询结果:');
    console.log('  hasImageUrls:', queryResponse.data.image_urls && queryResponse.data.image_urls.length > 0);
    console.log('  imageUrlsType:', Array.isArray(queryResponse.data.image_urls) ? 'array' : typeof queryResponse.data.image_urls);
    console.log('  imageUrlsLength:', Array.isArray(queryResponse.data.image_urls) ? queryResponse.data.image_urls.length : 0);
    console.log('  imageUrlsContent:', queryResponse.data.image_urls);
    
  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testImageUpload();