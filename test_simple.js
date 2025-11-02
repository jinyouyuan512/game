import axios from 'axios';

// 测试配置
const API_BASE_URL = 'http://localhost:3000';

async function testSimpleStrategyCreate() {
  try {
    console.log('开始简单测试...');
    
    // 创建测试数据，确保内容长度超过100个字符
    const strategyData = {
      title: '简单测试攻略',
      content: '这是一个测试攻略内容，我需要确保它的长度超过100个字符。我将继续添加更多的文字，以满足系统的验证要求。这个测试将验证攻略创建功能是否正常工作，特别是在新的媒体存储架构下。让我再添加一些文字，确保长度足够。',
      difficulty: 'easy',
      type: 'guide',
      game_id: 1,
      user_id: 1,
      status: 'published'
    };
    
    console.log('内容长度:', strategyData.content.length);
    console.log('发送请求...');
    
    const response = await axios.post(`${API_BASE_URL}/api/strategies`, strategyData);
    
    console.log('\n✅ 测试成功!');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testSimpleStrategyCreate();