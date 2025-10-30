// 简单的API连接测试脚本
import https from 'https';
import http from 'http';

// 记录日志函数
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// 执行GET请求
async function httpGet(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    log(`发送GET请求到: ${url}`);
    
    const req = protocol.get(url, (res) => {
      const endTime = Date.now();
      log(`GET请求耗时: ${endTime - startTime}ms`);
      log(`GET响应状态: ${res.statusCode} ${res.statusMessage}`);
      log('GET响应头:');
      
      // 显示所有响应头
      Object.entries(res.headers).forEach(([key, value]) => {
        log(`  ${key}: ${value}`);
      });
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        log(`GET响应数据长度: ${data.length} 字节`);
        try {
          const jsonData = JSON.parse(data);
          log('GET响应数据(解析为JSON):', Array.isArray(jsonData) ? `数组长度: ${jsonData.length}` : jsonData);
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            log('第一个元素示例:', jsonData[0]);
          }
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data: jsonData,
            parsedData: jsonData
          });
        } catch (e) {
          log(`GET响应数据(原始文本): ${data.substring(0, 100)}...`);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data: data,
            parsedData: null
          });
        }
      });
    });
    
    req.on('error', (error) => {
      log(`GET请求错误: ${error.message}`);
      reject(error);
    });
    
    req.end();
  });
}

// 执行POST请求
async function httpPost(url, postData) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const data = JSON.stringify(postData);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const protocol = url.startsWith('https') ? https : http;
    
    log(`发送POST请求到: ${url}`);
    log(`POST请求数据:`, JSON.stringify(postData, null, 2));
    
    const req = protocol.request(url, options, (res) => {
      const endTime = Date.now();
      log(`POST请求耗时: ${endTime - startTime}ms`);
      log(`POST响应状态: ${res.statusCode} ${res.statusMessage}`);
      log('POST响应头:');
      
      // 显示所有响应头
      Object.entries(res.headers).forEach(([key, value]) => {
        log(`  ${key}: ${value}`);
      });
      
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        log(`POST响应数据长度: ${responseData.length} 字节`);
        try {
          const jsonData = JSON.parse(responseData);
          log('POST响应数据(解析为JSON):', jsonData);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data: jsonData,
            parsedData: jsonData
          });
        } catch (e) {
          log(`POST响应数据(原始文本): ${responseData || '(空响应)'}`);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data: responseData,
            parsedData: null
          });
        }
      });
    });
    
    req.on('error', (error) => {
      log(`POST请求错误: ${error.message}`);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// 主测试函数
async function runTests() {
  log('===== 开始API连接测试 =====');
  
  // 测试配置
  const endpoints = [
    'http://localhost:3000/api/games',
    'http://127.0.0.1:3000/api/games'
  ];
  
  // 使用与games.js中匹配的字段结构
  const testGameData = {
    name: '测试游戏-' + Date.now(), // 添加时间戳确保唯一性
    description: '这是一个测试游戏的详细描述',
    developer: '测试游戏工作室',
    category: '动作冒险',
    release_date: '2024-01-15',
    cover_image_url: 'http://example.com/cover.jpg'
  };
  
  log('测试游戏数据结构:', JSON.stringify(testGameData, null, 2));
  
  // 测试每个端点
  for (const endpoint of endpoints) {
    log(`\n===== 测试端点: ${endpoint} =====`);
    
    // 测试GET请求
    try {
      log('\n--- 测试GET请求 ---');
      const getResult = await httpGet(endpoint);
      if (getResult.success) {
        log('GET请求测试成功!');
      } else {
        log(`GET请求测试失败，状态码: ${getResult.statusCode}`);
      }
    } catch (error) {
      log(`GET请求测试失败: ${error.message}`);
      log('错误堆栈:', error.stack);
    }
    
    // 测试POST请求
    try {
      log('\n--- 测试POST请求 ---');
      const postResult = await httpPost(endpoint, testGameData);
      if (postResult.success) {
        log('POST请求测试成功!');
      } else {
        log(`POST请求测试失败，状态码: ${postResult.statusCode}`);
        // 分析错误响应
        if (postResult.statusCode === 400 && postResult.parsedData) {
          log('400错误详情:', JSON.stringify(postResult.parsedData, null, 2));
        }
      }
    } catch (error) {
      log(`POST请求测试失败: ${error.message}`);
      log('错误堆栈:', error.stack);
    }
  }
  
  log('\n===== API连接测试完成 =====');
}

// 运行测试
runTests().catch(error => {
  log(`测试过程中出现错误: ${error.message}`);
  log('错误堆栈:', error.stack);
  process.exit(1);
});