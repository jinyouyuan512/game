// 本地API客户端
const API_BASE_URL = 'http://localhost:3000' // 后端服务器地址
// 使用相对路径作为备选方案，让开发服务器代理处理
const API_BASE_URL_RELATIVE = '/api'

// 测试API连接
export const testApiConnection = async () => {
  try {
    console.log('===== 开始测试API连接 =====');
    
    // 测试GET请求
    console.log('测试1: GET请求获取游戏列表');
    try {
      const startTime = Date.now();
      const response = await fetch('http://localhost:3000/api/games', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();
      console.log(`GET请求耗时: ${endTime - startTime}ms`);
      console.log('GET响应状态:', response.status);
      console.log('GET响应状态文本:', response.statusText);
      
      // 显示完整的响应头
      console.log('GET响应头:');
      response.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });
      
      const data = await response.json();
      console.log('GET响应数据类型:', typeof data);
      console.log('GET响应数据:', data);
      
      return { success: true, method: 'GET', data };
    } catch (getError) {
      console.error('GET请求失败:', getError);
      console.error('GET错误详情:', getError.message);
      
      // 测试POST请求
      console.log('测试2: POST请求创建游戏');
      try {
        const testData = {
          name: '测试游戏',
          developer: '测试开发商',
          category: '角色扮演',
          description: '这是一个测试游戏',
          status: 'draft'
        };
        console.log('POST测试数据:', testData);
        
        const startTime = Date.now();
        const response = await fetch('http://localhost:3000/api/games', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testData)
        });
        const endTime = Date.now();
        console.log(`POST请求耗时: ${endTime - startTime}ms`);
        console.log('POST响应状态:', response.status);
        console.log('POST响应状态文本:', response.statusText);
        
        // 显示完整的响应头
        console.log('POST响应头:');
        response.headers.forEach((value, key) => {
          console.log(`  ${key}: ${value}`);
        });
        
        const data = await response.json();
        console.log('POST响应数据:', data);
        
        return { success: true, method: 'POST', data };
      } catch (postError) {
        console.error('POST请求失败:', postError);
        console.error('POST错误详情:', postError.message);
        
        // 尝试使用IP地址
        console.log('测试3: 使用IP地址请求');
        try {
          const response = await fetch('http://127.0.0.1:3000/api/games', {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log('IP地址响应状态:', response.status);
          const data = await response.json();
          console.log('IP地址响应数据:', data);
          return { success: true, method: 'GET_IP', data };
        } catch (ipError) {
          console.error('IP地址请求失败:', ipError);
          console.error('IP错误详情:', ipError.message);
          throw new Error(`所有API连接方式都失败了: ${getError.message}, ${postError.message}, ${ipError.message}`);
        }
      }
    }
  } catch (error) {
    console.error('测试API连接失败:', error);
    throw error;
  }
}

class ApiClient {
  constructor() {
    // 使用相对路径，让Vite开发服务器代理处理API请求，避免CORS问题
    this.baseURL = API_BASE_URL_RELATIVE
  }

  async request(endpoint, options = {}) {
    // 使用相对路径构建URL，让Vite开发服务器代理处理
    // 如果endpoint已经以/api开头，就不再添加前缀
    const normalizedEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`
    const url = normalizedEndpoint
    console.log('===== API请求开始 =====')
    console.log('API请求URL:', url)
    console.log('请求方法:', options.method || 'GET')
    // 检查是否为FormData请求
    const isFormData = options.body instanceof FormData
    const config = {
      mode: 'cors',
      headers: {
        // 对于FormData，不需要设置Content-Type，让浏览器自动设置
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...options.headers
      },
      ...options
    }
    console.log('请求配置:', config)

    // 添加认证token
    const token = localStorage.getItem('user_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      console.log('发送API请求:', url, config)
      const response = await fetch(url, config)
      console.log('API响应状态:', response.status, response.statusText)
      
      // 检查响应是否为JSON
      const contentType = response.headers.get('content-type')
      console.log('响应Content-Type:', contentType)
      
      // 处理非成功状态码
      if (!response.ok) {
        let errorMessage = `请求失败！状态码: ${response.status}`;
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } else {
            const text = await response.text();
            console.log('非JSON响应文本:', text);
            errorMessage = text || errorMessage;
          }
        } catch (jsonError) {
          console.error('解析错误响应失败:', jsonError);
        }
        
        const error = new Error(errorMessage);
        error.statusCode = response.status;
        
        // 特定状态码的处理
        if (response.status === 401) {
          error.type = 'unauthorized';
          // 可以在这里处理token过期的逻辑
          localStorage.removeItem('token');
        } else if (response.status === 403) {
          error.type = 'forbidden';
        } else if (response.status === 404) {
          error.type = 'not_found';
        } else if (response.status === 429) {
          error.type = 'too_many_requests';
        }
        
        throw error;
      }
      
      // 处理成功响应
      let data
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.log('非JSON响应文本:', text)
        data = { message: text }
      }
      
      console.log('API响应数据:', data)
      return data
    } catch (error) {
      // 网络错误处理
      if (!error.statusCode) {
        error.type = 'network_error';
        console.error('网络请求错误:', error);
      }
      
      console.error('API请求错误:', error)
      console.error('错误详情:', error.message)
      console.error('错误类型:', error.type)
      
      // 如果是网络错误，尝试使用绝对路径
      if (error.message.includes('Failed to fetch')) {
        console.log('网络请求失败，尝试使用绝对路径...')
        const absoluteEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`
        const absoluteUrl = `${API_BASE_URL}${absoluteEndpoint}`
        config.mode = 'cors'
        
        try {
          const response = await fetch(absoluteUrl, config)
          console.log('绝对路径API响应状态:', response.status, response.statusText)
          
          const contentType = response.headers.get('content-type')
          
          // 处理IP重试的非成功状态码
          if (!response.ok) {
            let errorMessage = `请求失败！状态码: ${response.status}`;
            
            try {
              if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                if (errorData.message) {
                  errorMessage = errorData.message;
                }
              } else {
                const text = await response.text();
                console.log('IP地址非JSON响应文本:', text);
                errorMessage = text || errorMessage;
              }
            } catch (jsonError) {
              console.error('解析IP错误响应失败:', jsonError);
            }
            
            const retryError = new Error(errorMessage);
            retryError.statusCode = response.status;
            retryError.type = 'ip_retry_failed';
            throw retryError;
          }
          
          // 处理IP重试的成功响应
          let data
          if (contentType && contentType.includes('application/json')) {
            data = await response.json()
          } else {
            const text = await response.text()
            console.log('IP地址非JSON响应文本:', text)
            data = { message: text }
          }
          
          console.log('IP地址API响应数据:', data)
          return data
        } catch (ipError) {
          console.error('IP地址重试也失败:', ipError)
          const combinedError = new Error(`API请求失败: ${error.message} (IP地址重试也失败: ${ipError.message})`)
          combinedError.type = 'multiple_attempts_failed'
          throw combinedError
        }
      }
      
      throw error
    }
  }

  // GET请求
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  // POST请求
  async post(endpoint, data) {
    const isFormData = data instanceof FormData
    return this.request(endpoint, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data)
    })
  }

  // PUT请求
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // DELETE请求
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()