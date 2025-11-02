// 测试注册API的脚本
import axios from 'axios';

// 测试注册函数
async function testRegister() {
  console.log('===== 开始测试注册API =====');
  
  const testUser = {
    username: `test_user_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123'
  };
  
  console.log('测试用户数据:', testUser);
  console.log('准备发送POST请求到: http://localhost:3000/api/auth/register');
  
  try {
    // 设置超时时间为5秒
    const config = {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    console.log('正在发送请求...');
    const response = await axios.post('http://localhost:3000/api/auth/register', testUser, config);
    console.log('✓ 请求发送成功! 收到响应');
    console.log('注册成功! 响应状态码:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('✗ 注册失败!');
    if (error.response) {
      console.error('服务器返回错误响应');
      console.error('状态码:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('发送请求成功但未收到响应');
      console.error('请求详情:', error.request);
    } else {
      console.error('请求配置错误');
      console.error('错误信息:', error.message);
    }
    console.error('完整错误:', error);
    return false;
  }
}

// 运行测试
console.log('脚本已启动');
// 直接调用测试函数，不使用复杂的模块检测
console.log('开始执行注册测试...');
testRegister().then(success => {
  console.log('\n===== 测试完成 =====');
  console.log('测试结果:', success ? '成功' : '失败');
}).catch(err => {
  console.error('测试执行出错:', err);
});

export { testRegister };