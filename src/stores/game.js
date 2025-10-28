import { defineStore } from 'pinia'
import { apiClient } from '../lib/api'
import { ElMessage } from 'element-plus'

export const useGameStore = defineStore('game', {
  state: () => ({
    // 游戏相关状态
    games: [],
    currentGame: null,
    gamesLoading: false,
    gamesError: null,
    gamesFilters: {
      category: '',
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      pageSize: 12
    },
    gamesTotal: 0,
    
    // 攻略相关状态
    strategies: [],
    currentStrategy: null,
    strategiesLoading: false,
    strategiesError: null,
    strategiesFilters: {
      gameId: '',
      difficulty: '',
      tag: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
      pageSize: 10
    },
    strategiesTotal: 0,
    
    // 标签相关状态
    tags: [],
    tagsLoading: false,
    tagsError: null,
    
    // 搜索相关状态
    searchResults: {
      games: [],
      strategies: []
    },
    searchLoading: false,
    searchError: null,
    searchKeyword: '',
    searchTime: 0
  }),

  getters: {
    // 计算属性：获取游戏分类列表
    gameCategories: (state) => {
      const categories = new Set()
      state.games.forEach(game => {
        if (game.category) categories.add(game.category)
      })
      return Array.from(categories).sort()
    },
    
    // 计算属性：获取攻略难度列表
    strategyDifficulties: () => [
      { value: 'easy', label: '简单' },
      { value: 'medium', label: '中等' },
      { value: 'hard', label: '困难' }
    ],
    
    // 计算属性：搜索结果总数
    totalSearchResults: (state) => state.searchResults.games.length + state.searchResults.strategies.length
  },

  actions: {
    /**
     * 获取游戏列表（支持分页、筛选和排序）
     */
    async fetchGames(filters = null) {
      this.gamesLoading = true
      this.gamesError = null
      
      try {
        // 使用提供的筛选条件或当前状态中的筛选条件
        const currentFilters = filters || this.gamesFilters
        
        // 构建查询参数
        const params = new URLSearchParams()
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value !== '') params.append(key, value)
        })
        
        const queryString = params.toString() ? `?${params.toString()}` : ''
        const response = await apiClient.get(`/api/games${queryString}`)
        
        this.games = response.data || response || []
        this.gamesTotal = response.total || this.games.length
        this.gamesFilters = currentFilters
        
        return this.games
      } catch (error) {
        this.gamesError = error.message || '获取游戏列表失败'
        console.error('Failed to fetch games:', error)
        ElMessage.error(this.gamesError)
        return []
      } finally {
        this.gamesLoading = false
      }
    },

    /**
     * 获取游戏详情
     */
    async fetchGameDetail(id) {
      this.gamesLoading = true
      this.gamesError = null
      
      try {
        const response = await apiClient.get(`/api/games/${id}`)
        // 直接使用response，因为apiClient已经返回了解析后的数据
        this.currentGame = response
        console.log(`成功获取游戏ID ${id} 的详情:`, this.currentGame.name)
        
        // 同时获取该游戏的攻略
        await this.fetchGameStrategies(id)
        
        return this.currentGame
      } catch (error) {
        this.gamesError = error.message || `获取游戏ID:${id}的详情失败`
        console.error(`Failed to fetch game detail for id ${id}:`, error)
        ElMessage.error(this.gamesError)
        return null
      } finally {
        this.gamesLoading = false
      }
    },

    /**
     * 获取攻略列表（支持分页、筛选和排序）
     */
    async fetchStrategies(filters = null) {
      this.strategiesLoading = true
      this.strategiesError = null
      
      try {
        // 使用提供的筛选条件或当前状态中的筛选条件
        const currentFilters = filters || this.strategiesFilters
        
        // 构建查询参数
        const params = new URLSearchParams()
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value !== '') params.append(key, value)
        })
        
        const queryString = params.toString() ? `?${params.toString()}` : ''
        const response = await apiClient.get(`/api/strategies${queryString}`)
        
        this.strategies = response.data || response || []
        this.strategiesTotal = response.total || this.strategies.length
        this.strategiesFilters = currentFilters
        
        return this.strategies
      } catch (error) {
        this.strategiesError = error.message || '获取攻略列表失败'
        console.error('Failed to fetch strategies:', error)
        ElMessage.error(this.strategiesError)
        return []
      } finally {
        this.strategiesLoading = false
      }
    },

    /**
     * 获取特定游戏的攻略列表
     */
    async fetchGameStrategies(gameId) {
      return this.fetchStrategies({ ...this.strategiesFilters, gameId, page: 1 })
    },

    /**
     * 获取攻略详情
     */
    async fetchStrategyDetail(id, incrementViews = true) {
      this.strategiesLoading = true
      this.strategiesError = null
      
      try {
        const response = await apiClient.get(`/api/strategies/${id}${incrementViews ? '?increment_views=true' : ''}`)
        this.currentStrategy = response.data || response
        
        // 同时获取相关标签
        if (!this.tags.length) {
          await this.fetchTags()
        }
        
        return this.currentStrategy
      } catch (error) {
        this.strategiesError = error.message || `获取攻略ID:${id}的详情失败`
        console.error(`Failed to fetch strategy detail for id ${id}:`, error)
        ElMessage.error(this.strategiesError)
        return null
      } finally {
        this.strategiesLoading = false
      }
    },

    /**
     * 获取攻略详情（兼容fetchStrategyDetail）
     */
    async fetchStrategy(id) {
      return this.fetchStrategyDetail(id)
    },
    
    /**
     * 根据游戏ID获取攻略列表（兼容fetchGameStrategies）
     */
    async fetchStrategiesByGame(gameId) {
      return this.fetchGameStrategies(gameId)
    },
    
    /**
     * 获取标签列表
     */
    async fetchTags() {
      this.tagsLoading = true
      this.tagsError = null
      
      try {
        const response = await apiClient.get('/api/tags')
        this.tags = response.data || response || []
        return this.tags
      } catch (error) {
        this.tagsError = error.message || '获取标签列表失败'
        console.error('Failed to fetch tags:', error)
        ElMessage.error(this.tagsError)
        return []
      } finally {
        this.tagsLoading = false
      }
    },

    /**
     * 统一搜索（同时搜索游戏和攻略）
     */
    async search(keyword) {
      this.searchLoading = true
      this.searchError = null
      this.searchKeyword = keyword
      
      try {
        const startTime = performance.now()
        const response = await apiClient.get(`/api/search?q=${encodeURIComponent(keyword)}`)
        const endTime = performance.now()
        
        this.searchResults = {
          games: response.games || [],
          strategies: response.strategies || []
        }
        this.searchTime = Math.round(endTime - startTime)
        
        console.log(`搜索完成: '${keyword}' (${this.searchTime}ms)`, this.searchResults)
        return this.searchResults
      } catch (error) {
        this.searchError = error.message || '搜索失败'
        console.error('Failed to search:', error)
        ElMessage.error(this.searchError)
        
        // 返回空结果
        this.searchResults = { games: [], strategies: [] }
        return this.searchResults
      } finally {
        this.searchLoading = false
      }
    },
    
    /**
     * 高级搜索（支持多条件筛选）
     */
    async advancedSearch(params) {
      this.searchLoading = true
      this.searchError = null
      
      try {
        const startTime = performance.now()
        
        // 构建查询参数
        const queryParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== '') {
            // 对数组类型的参数进行特殊处理
            if (Array.isArray(value)) {
              value.forEach(item => queryParams.append(key, item))
            } else {
              queryParams.append(key, value)
            }
          }
        })
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
        const response = await apiClient.get(`/api/search/advanced${queryString}`)
        const endTime = performance.now()
        
        this.searchResults = {
          games: response.games || [],
          strategies: response.strategies || []
        }
        this.searchTime = Math.round(endTime - startTime)
        
        console.log(`高级搜索完成 (${this.searchTime}ms)`, this.searchResults)
        return this.searchResults
      } catch (error) {
        this.searchError = error.message || '高级搜索失败'
        console.error('Failed to perform advanced search:', error)
        ElMessage.error(this.searchError)
        
        // 返回空结果
        this.searchResults = { games: [], strategies: [] }
        return this.searchResults
      } finally {
        this.searchLoading = false
      }
    },
    
    /**
     * 重置搜索结果
     */
    resetSearch() {
      this.searchResults = { games: [], strategies: [] }
      this.searchKeyword = ''
      this.searchError = null
      this.searchTime = 0
    },
    
    /**
     * 更新游戏筛选条件
     */
    updateGamesFilters(filters) {
      this.gamesFilters = { ...this.gamesFilters, ...filters }
    },
    
    /**
     * 更新攻略筛选条件
     */
    updateStrategiesFilters(filters) {
      this.strategiesFilters = { ...this.strategiesFilters, ...filters }
    },
    
    /**
     * 创建新攻略
     */
    async createStrategy(strategyData) {
      this.strategiesLoading = true
      this.strategiesError = null
      
      try {
        const response = await apiClient.post('/api/strategies', strategyData)
        
        // 将新创建的攻略添加到策略列表的开头
        if (response.data || response) {
          const newStrategy = response.data || response
          // 添加游戏名称信息
          const game = this.games.find(g => g.id === newStrategy.game_id)
          if (game) {
            newStrategy.game_name = game.name
          }
          this.strategies.unshift(newStrategy)
          this.strategiesTotal++
        }
        
        ElMessage.success('攻略创建成功！')
        return response.data || response
      } catch (error) {
        this.strategiesError = error.message || '创建攻略失败'
        console.error('Failed to create strategy:', error)
        
        // 处理不同类型的错误
        const errorData = {
          message: this.strategiesError,
          type: error.response?.status === 401 ? 'unauthorized' : 'network_error',
          statusCode: error.response?.status
        }
        
        throw errorData
      } finally {
        this.strategiesLoading = false
      }
    },
    
    /**
     * 重置所有状态
     */
    reset() {
      this.games = []
      this.currentGame = null
      this.gamesError = null
      this.strategies = []
      this.currentStrategy = null
      this.strategiesError = null
      this.tags = []
      this.tagsError = null
      this.resetSearch()
    }
  }
})