import axios from 'axios';

// 测试配置
const API_BASE_URL = 'http://localhost:3000';

async function testShortContentRejection() {
  try {
    console.log('开始测试短内容拒绝功能...');
    
    // 创建测试数据，确保内容长度少于50个字符（应被拒绝）
    const strategyData = {
      title: '测试短内容',
      content: '这是一个短内容，应该被拒绝，因为它少于50个字符。',
      difficulty: 'easy',
      type: 'guide',
      game_id: 1,
      user_id: 1,
      status: 'published'
    };
    
    console.log('内容长度:', strategyData.content.length, '字符');
    console.log('发送请求...');
    
    const response = await axios.post(`${API_BASE_URL}/api/strategies`, strategyData);
    
    console.log('\n❌ 测试失败: 短内容不应被接受!');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response && error.response.status === 400 && 
        error.response.data.error === '攻略内容至少需要50个字符') {
      console.log('\n✅ 测试成功! 短内容已被正确拒绝');
      console.log('错误信息:', error.response.data.error);
    } else {
      console.error('\n❌ 测试失败: 预期拒绝短内容但出现不同错误');
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('错误:', error.message);
      }
    }
  }
}

testShortContentRejection();