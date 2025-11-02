import axios from 'axios';

// 测试配置
const API_BASE_URL = 'http://localhost:3000';

async function testContentLengthRestriction() {
  try {
    console.log('开始测试内容长度限制...');
    
    // 创建测试数据，确保内容长度超过50个字符
    const strategyData = {
      title: '测试50字符限制',
      content: '这是一个长度足够的测试内容，确保它超过50个字符的限制要求。添加更多的文字内容来保证总长度达到标准。这样应该能够成功创建攻略了。',
      difficulty: 'easy',
      type: 'guide',
      game_id: 1,
      user_id: 1,
      status: 'published'
    };
    
    console.log('内容长度:', strategyData.content.length, '字符');
    console.log('发送请求...');
    
    const response = await axios.post(`${API_BASE_URL}/api/strategies`, strategyData);
    
    console.log('\n✅ 测试成功!');
    console.log('攻略ID:', response.data.data.id);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testContentLengthRestriction();