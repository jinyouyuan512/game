// 测试攻略API的404错误处理
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';

// 测试脚本：验证攻略不存在时的正确404响应
async function testStrategy404() {
  const apiUrl = 'http://localhost:3000';
  
  try {
    console.log('测试1：请求不存在的攻略ID 999');
    const response = await axios.get(`${apiUrl}/api/strategies/999`);
    console.log('测试1 - 意外响应：');
    console.log('状态码：', response.status);
    console.log('响应数据：', response.data);
  } catch (error) {
    console.log('测试1 - 预期的错误响应：');
    console.log('状态码：', error.response?.status);
    console.log('错误信息：', error.response?.data?.error || error.message);
  }
  
  try {
    console.log('\n测试2：创建一个测试攻略');
    const createResponse = await axios.post(`${apiUrl}/api/strategies`, {
      title: '测试攻略',
      content: '这是测试内容',
      difficulty: '简单',
      type: '攻略',
      game_id: 1,
      user_id: 1
    });
    console.log('创建成功，攻略ID：', createResponse.data?.id);
    console.log('创建响应：', createResponse.data);
  } catch (error) {
    console.log('创建攻略失败：', error.response?.data?.error || error.message);
  }
}

testStrategy404().catch(console.error);