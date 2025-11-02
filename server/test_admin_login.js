// 测试管理员登录功能
import axios from 'axios';

async function testAdminLogin() {
  console.log('1. 测试脚本开始执行...');
  
  try {
    console.log('2. 准备发送登录请求到 http://localhost:3000/api/admin/login');
    console.log('3. 使用凭据: username=admin, password=admin123');
    
    // 发送登录请求
    const response = await axios.post('http://localhost:3000/api/admin/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: function(status) {
        return true; // 不拒绝任何状态码，让我们查看所有响应
      }
    });
    
    console.log('4. 收到响应，状态码:', response.status);
    console.log('5. 响应头:', response.headers);
    console.log('6. 响应数据:', response.data);
    
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ 登录成功！');
    } else {
      console.log('❌ 请求完成但返回错误状态码:', response.status);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ 发生异常:', error.message);
    if (error.response) {
      console.error('❌ 响应错误详情:');
      console.error('- 状态码:', error.response.status);
      console.error('- 数据:', error.response.data);
      console.error('- 头信息:', error.response.headers);
    } else if (error.request) {
      console.error('❌ 请求已发送但未收到响应:', error.request);
    }
    return null;
  } finally {
    console.log('7. 测试脚本执行结束');
  }
}

// 运行测试
console.log('0. 脚本启动');
testAdminLogin().catch(err => {
  console.error('❌ 测试函数执行失败:', err);
});

export { testAdminLogin };