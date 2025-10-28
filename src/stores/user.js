import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

// 配置API基础URL
const API_BASE_URL = 'http://localhost:3000/api'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('user_token') || null)
  const loading = ref(false)
  const error = ref(null)
  
  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userInfo = computed(() => user.value)
  
  // 方法
  const login = async (credentials) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials)
      
      // 更健壮的响应处理
      if (response.status === 200 && response.data) {
        const { token: authToken, user: userData } = response.data
        
        if (authToken && userData) {
          token.value = authToken
          user.value = userData
          
          // 保存token到localStorage
          localStorage.setItem('user_token', authToken)
          
          // 设置axios默认header
          axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
          
          return { success: true, user: userData }
        } else {
          throw new Error('登录失败：响应数据不完整')
        }
      } else {
        throw new Error('登录失败：服务器响应异常')
      }
    } catch (err) {
      // 更详细的错误处理
      let errorMessage = '登录失败'
      
      if (err.response) {
        // 服务器响应错误
        errorMessage = err.response.data?.message || `服务器错误 (${err.response.status})`
      } else if (err.request) {
        // 网络错误
        errorMessage = '网络连接失败，请检查网络设置'
      } else {
        // 其他错误
        errorMessage = err.message || '未知错误'
      }
      
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }
  
  const register = async (userData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData)
      
      // 更健壮的响应处理
      if (response.status === 201 && response.data) {
        const { token: authToken, user: newUser } = response.data
        
        if (authToken && newUser) {
          token.value = authToken
          user.value = newUser
          
          // 保存token到localStorage
          localStorage.setItem('user_token', authToken)
          
          // 设置axios默认header
          axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
          
          return { success: true, user: newUser }
        } else {
          throw new Error('注册失败：响应数据不完整')
        }
      } else {
        throw new Error('注册失败：服务器响应异常')
      }
    } catch (err) {
      // 更详细的错误处理
      let errorMessage = '注册失败'
      
      if (err.response) {
        // 服务器响应错误
        errorMessage = err.response.data?.message || `服务器错误 (${err.response.status})`
      } else if (err.request) {
        // 网络错误
        errorMessage = '网络连接失败，请检查网络设置'
      } else {
        // 其他错误
        errorMessage = err.message || '未知错误'
      }
      
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }
  
  const logout = async () => {
    try {
      // 调用后端登出API（可选，因为JWT是无状态的）
      if (token.value) {
        await axios.post(`${API_BASE_URL}/auth/logout`)
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // 即使API调用失败，也要清除本地状态
    } finally {
      // 清除本地状态
      user.value = null
      token.value = null
      
      // 从localStorage移除token
      localStorage.removeItem('user_token')
      
      // 移除axios默认header
      delete axios.defaults.headers.common['Authorization']
    }
  }
  
  const fetchUserProfile = async () => {
    if (!token.value) return { success: false, error: '未登录' }
    
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`)
      
      if (response.status === 200 && response.data) {
        const { user: userData } = response.data
        
        if (userData) {
          user.value = userData
          return { success: true, user: userData }
        } else {
          throw new Error('获取用户信息失败：响应数据不完整')
        }
      } else {
        throw new Error('获取用户信息失败：服务器响应异常')
      }
    } catch (err) {
      // 如果是401或403错误，说明token可能已过期，清除登录状态
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        logout()
        return { success: false, error: '登录已过期，请重新登录' }
      }
      
      // 其他错误处理
      let errorMessage = '获取用户信息失败'
      
      if (err.response) {
        errorMessage = err.response.data?.message || `服务器错误 (${err.response.status})`
      } else if (err.request) {
        errorMessage = '网络连接失败，请检查网络设置'
      } else {
        errorMessage = err.message || '未知错误'
      }
      
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }
  
  const initializeAuth = () => {
    const savedToken = localStorage.getItem('user_token')
    
    if (savedToken) {
      token.value = savedToken
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
      
      // 获取用户信息
      fetchUserProfile()
    }
  }
  
  return {
    // 状态
    user,
    token,
    loading,
    error,
    
    // 计算属性
    isAuthenticated,
    userInfo,
    
    // 方法
    login,
    register,
    logout,
    fetchUserProfile,
    initializeAuth
  }
})