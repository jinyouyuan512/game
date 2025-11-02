// 测试管理员登录API的脚本
import axios from 'axios';

async function testAdminLogin() {
  try {
    console.log('开始测试管理员登录API...');
    
    const response = await axios.post('http://localhost:3000/api/admin/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('API响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    console.log('\n登录测试成功！');
    return response.data;
  } catch (error) {
    console.error('登录测试失败！');
    if (error.response) {
      // 服务器返回错误响应
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误:', error.request);
    } else {
      // 请求配置出错
      console.error('请求错误:', error.message);
    }
  }
}

// 执行测试
testAdminLogin();