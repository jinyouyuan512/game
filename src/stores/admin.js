import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    currentAdmin: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    permissions: []
  }),

  getters: {
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission) || state.currentAdmin?.role === 'super_admin'
    },
    
    canManageGames: (state) => {
      return state.permissions.includes('manage_games') || state.currentAdmin?.role === 'super_admin'
    },
    
    canManageStrategies: (state) => {
      return state.permissions.includes('manage_strategies') || state.currentAdmin?.role === 'super_admin'
    },
    
    canManageUsers: (state) => {
      return state.permissions.includes('manage_users') || state.currentAdmin?.role === 'super_admin'
    }
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        // 调用后端API进行登录验证
        const response = await fetch('http://localhost:3000/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || '登录失败，请检查用户名和密码')
        }
        
        const data = await response.json()
        console.log('登录API响应数据:', data)
        
        // 格式化管理员数据
        const adminData = {
          id: data.admin.id,
          username: data.admin.username,
          email: data.admin.email || 'admin@example.com',
          role: data.admin.role || 'superadmin',
          permissions: ['manage_games', 'manage_strategies', 'manage_users', 'view_analytics'],
          sessionToken: data.sessionToken,
          expiresAt: data.expiresAt
        }
        
        // 确保正确设置状态
        this.currentAdmin = adminData
        // 强制设置认证状态为true
        this.isAuthenticated = true
        this.permissions = adminData.permissions
        
        console.log('管理员状态已更新:', {
          currentAdmin: this.currentAdmin,
          isAuthenticated: this.isAuthenticated
        })
        
        // 立即验证状态是否正确设置
        console.log('状态验证:', {
          currentAdminExists: !!this.currentAdmin,
          isAuthenticated: this.isAuthenticated,
          permissionsCount: this.permissions.length
        })
        
        // 保存到本地存储
        localStorage.setItem('admin_session', JSON.stringify({
          admin: adminData,
          timestamp: Date.now(),
          sessionToken: data.sessionToken,
          expiresAt: data.expiresAt
        }))
        
        // 清除可能存在的旧缓存
        sessionStorage.removeItem('admin_session')
        
        return { success: true, admin: adminData }
      } catch (error) {
        console.error('登录API调用失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.currentAdmin = null
      this.isAuthenticated = false
      this.permissions = []
      this.error = null
      
      // 清除本地存储
      localStorage.removeItem('admin_session')
    },

    async checkAuthStatus() {
      try {
        const sessionData = localStorage.getItem('admin_session')
        if (sessionData) {
          const { admin, timestamp } = JSON.parse(sessionData)
          
          // 检查会话是否过期（24小时）
          const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000
          
          if (!isExpired) {
            this.currentAdmin = admin
            this.isAuthenticated = true
            this.permissions = admin.permissions || []
            return true
          } else {
            // 会话过期，清除数据
            this.logout()
          }
        }
        return false
      } catch (error) {
        console.error('检查认证状态失败:', error)
        this.logout()
        return false
      }
    },

    async fetchAdminProfile() {
      if (!this.isAuthenticated) return null
      
      this.loading = true
      try {
        // 在实际应用中，这里应该从数据库获取管理员信息
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('username', this.currentAdmin.username)
          .single()
        
        if (error && error.code !== 'PGRST116') { // PGRST116 是没有找到记录的错误
          throw error
        }
        
        if (data) {
          this.currentAdmin = { ...this.currentAdmin, ...data }
        }
        
        return this.currentAdmin
      } catch (error) {
        console.error('获取管理员信息失败:', error)
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    },

    async updateAdminProfile(profileData) {
      if (!this.isAuthenticated) return false
      
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('admins')
          .update(profileData)
          .eq('id', this.currentAdmin.id)
          .select()
          .single()
        
        if (error) throw error
        
        this.currentAdmin = { ...this.currentAdmin, ...data }
        
        // 更新本地存储
        const sessionData = JSON.parse(localStorage.getItem('admin_session') || '{}')
        sessionData.admin = this.currentAdmin
        localStorage.setItem('admin_session', JSON.stringify(sessionData))
        
        return true
      } catch (error) {
        console.error('更新管理员信息失败:', error)
        this.error = error.message
        return false
      } finally {
        this.loading = false
      }
    },

    // 获取系统统计数据
    async fetchSystemStats() {
      this.loading = true
      try {
        const [gamesResult, strategiesResult, conversationsResult] = await Promise.all([
          supabase.from('games').select('id', { count: 'exact', head: true }),
          supabase.from('strategies').select('id', { count: 'exact', head: true }),
          supabase.from('ai_conversations').select('id', { count: 'exact', head: true })
        ])
        
        return {
          totalGames: gamesResult.count || 0,
          totalStrategies: strategiesResult.count || 0,
          totalConversations: conversationsResult.count || 0,
          totalViews: 12580, // 模拟数据
          activeUsers: 1250   // 模拟数据
        }
      } catch (error) {
        console.error('获取系统统计失败:', error)
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    }
  }
})