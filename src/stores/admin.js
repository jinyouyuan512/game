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
        // 简化的登录逻辑 - 在实际应用中应该使用更安全的认证方式
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
          const adminData = {
            id: 'admin-001',
            username: 'admin',
            email: 'admin@gamesite.com',
            role: 'super_admin',
            permissions: ['manage_games', 'manage_strategies', 'manage_users', 'view_analytics']
          }
          
          this.currentAdmin = adminData
          this.isAuthenticated = true
          this.permissions = adminData.permissions
          
          // 保存到本地存储
          localStorage.setItem('admin_session', JSON.stringify({
            admin: adminData,
            timestamp: Date.now()
          }))
          
          return { success: true, admin: adminData }
        } else {
          throw new Error('用户名或密码错误')
        }
      } catch (error) {
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