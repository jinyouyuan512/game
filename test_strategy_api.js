// test_strategy_api.js - 测试攻略API是否正常工作
import axios from 'axios';
const API_BASE_URL = 'http://localhost:3000/api';

// 测试数据 - 一个有效的攻略提交请求
const testStrategyData = {
  title: '测试攻略标题',
  content: '这是一个测试攻略内容。这里包含了详细的游戏攻略步骤和技巧。',
  difficulty: '中等',
  type: '新手攻略',
  game_id: 1,  // 假设有一个ID为1的游戏存在
  user_id: 1   // 假设有一个ID为1的用户存在
};

async function testStrategiesAPI() {
  console.log('开始测试攻略API...');
  
  try {
    // 1. 测试GET /api/strategies - 获取所有攻略
    console.log('\n1. 测试GET /api/strategies');
    const getStrategiesResponse = await axios.get(`${API_BASE_URL}/strategies`);
    console.log(`   状态码: ${getStrategiesResponse.status}`);
    console.log(`   返回数据类型: ${typeof getStrategiesResponse.data}`);
    console.log(`   攻略数量: ${Array.isArray(getStrategiesResponse.data) ? getStrategiesResponse.data.length : 'N/A'}`);
    
    // 2. 测试POST /api/strategies - 创建新攻略
    console.log('\n2. 测试POST /api/strategies - 创建新攻略');
    console.log('   提交的数据:', testStrategyData);
    
    try {
      const postStrategyResponse = await axios.post(`${API_BASE_URL}/strategies`, testStrategyData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   状态码: ${postStrategyResponse.status}`);
      console.log(`   创建成功！攻略ID: ${postStrategyResponse.data.id}`);
      console.log(`   返回的攻略数据:`, postStrategyResponse.data);
      
      // 如果创建成功，验证是否可以获取到该攻略
      if (postStrategyResponse.data.id) {
        console.log(`\n3. 验证新创建的攻略是否可访问`);
        const getNewStrategyResponse = await axios.get(`${API_BASE_URL}/strategies/${postStrategyResponse.data.id}`);
        console.log(`   状态码: ${getNewStrategyResponse.status}`);
        console.log(`   验证成功，攻略标题: ${getNewStrategyResponse.data.title}`);
      }
      
    } catch (postError) {
      console.error(`   POST请求失败: ${postError.message}`);
      if (postError.response) {
        console.error(`   服务器返回状态码: ${postError.response.status}`);
        console.error(`   错误响应数据:`, postError.response.data);
      } else if (postError.request) {
        console.error(`   未收到响应，请检查服务器是否运行`);
      }
    }
    
    // 3. 测试GET /api/strategies/game/:gameId - 根据游戏ID获取攻略
    console.log('\n4. 测试GET /api/strategies/game/1');
    try {
      const gameStrategiesResponse = await axios.get(`${API_BASE_URL}/strategies/game/1`);
      console.log(`   状态码: ${gameStrategiesResponse.status}`);
      console.log(`   游戏ID 1 的攻略数量: ${Array.isArray(gameStrategiesResponse.data) ? gameStrategiesResponse.data.length : 'N/A'}`);
    } catch (gameError) {
      console.error(`   获取游戏攻略失败: ${gameError.message}`);
      if (gameError.response) {
        console.error(`   状态码: ${gameError.response.status}`);
        console.error(`   响应数据:`, gameError.response.data);
      }
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

// 运行测试
testStrategiesAPI().then(() => {
  console.log('\n测试完成！');
}).catch(error => {
  console.error('测试运行失败:', error);
});