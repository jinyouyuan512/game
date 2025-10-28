// API客户端配置
// 在开发环境中使用空字符串（通过Vite代理），在生产环境中使用环境变量或默认URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// 测试API连接
export const testApiConnection = async () => {
  try {
    console.log('测试API连接...');
    
    // 尝试使用不同的方式
    console.log('尝试方式1: 直接fetch');
    try {
      const response1 = await fetch('http://localhost:3000/api/games', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('方式1响应状态:', response1.status);
      const data1 = await response1.json();
      console.log('方式1响应数据:', data1);
      return data1;
    } catch (error1) {
      console.error('方式1失败:', error1);
      
      console.log('尝试方式2: 使用IP地址');
      try {
        const response2 = await fetch('http://127.0.0.1:3000/api/games', {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('方式2响应状态:', response2.status);
        const data2 = await response2.json();
        console.log('方式2响应数据:', data2);
        return data2;
      } catch (error2) {
        console.error('方式2失败:', error2);
        throw new Error('所有API连接方式都失败了');
      }
    }
  } catch (error) {
    console.error('测试API连接失败:', error);
    throw error;
  }
}

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    console.log('===== API请求开始 =====')
    console.log('API请求URL:', url)
    console.log('请求方法:', options.method || 'GET')
    const config = {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
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
      
      // 如果是网络错误，尝试使用IP地址
      if (error.message.includes('Failed to fetch') && url.includes('localhost')) {
        console.log('尝试使用IP地址重试...')
        const ipUrl = url.replace('localhost', '127.0.0.1')
        config.mode = 'cors'
        
        try {
          const response = await fetch(ipUrl, config)
          console.log('IP地址API响应状态:', response.status, response.statusText)
          
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
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
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