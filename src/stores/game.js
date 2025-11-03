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
        
        // 处理后端返回的格式 { data: { games: [], total: ... } }
        const gamesData = response.data || {};
        this.games = gamesData.games || response.data || response || []
        this.gamesTotal = gamesData.total || response.total || this.games.length
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
        
        // 处理后端返回的格式 { data: { strategies: [], total: ... } }
        const strategiesData = response.data || {};
        this.strategies = strategiesData.strategies || [];
        this.strategiesTotal = strategiesData.total || this.strategies.length;
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
      this.strategiesLoading = true
      this.strategiesError = null
      
      try {
        // 直接调用专门的游戏攻略API接口
        const response = await apiClient.get(`/api/strategies/game/${gameId}`)
        
        // 处理后端返回的格式 { success: true, data: [...], message: '...', gameId: ... }
        const responseData = response.data || response
        let strategies = []
        
        if (responseData.success && Array.isArray(responseData.data)) {
          strategies = responseData.data
        } else if (Array.isArray(responseData)) {
          strategies = responseData
        } else if (responseData.strategies && Array.isArray(responseData.strategies)) {
          strategies = responseData.strategies
        }
        
        // 更新store状态
        this.strategies = strategies
        this.strategiesTotal = strategies.length
        
        console.log(`成功获取游戏${gameId}的攻略，共${strategies.length}条`)
        return strategies
      } catch (error) {
        this.strategiesError = error.message || `获取游戏${gameId}的攻略失败`
        console.error(`Failed to fetch strategies for game ${gameId}:`, error)
        // 不显示错误消息，避免干扰用户体验
        return []
      } finally {
        this.strategiesLoading = false
      }
    },

    /**
     * 获取攻略详情
     */
    async fetchStrategyDetail(id, incrementViews = true) {
      this.strategiesLoading = true
      this.strategiesError = null
      
      try {
        const response = await apiClient.get(`/api/strategies/${id}${incrementViews ? '?increment_views=true' : ''}`)
        // 处理响应数据结构，兼容两种格式
        // 服务器返回格式: { success: true, data: {...}, message: '...', mediaStats: {...} }
        // 确保获取到正确的数据结构
        const responseData = response.data || response
        const strategyData = responseData.data || responseData
        
        // 确保video_urls和image_urls字段存在
        if (!strategyData.video_urls) {
          strategyData.video_urls = []
        }
        if (!strategyData.image_urls) {
          strategyData.image_urls = []
        }
        
        this.currentStrategy = strategyData
        
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
        // 检查是否为FormData对象
        const isFormData = strategyData instanceof FormData
        
        let response
        
        if (isFormData) {
          // 对于FormData，确保添加user_id字段（测试环境固定为1）
          if (!strategyData.has('user_id')) {
            strategyData.append('user_id', '1')
          }
          response = await apiClient.post('/api/strategies', strategyData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        } else {
          // 对于普通对象，使用原来的处理方式
          const strategyPayload = {
            game_id: strategyData.game_id,
            title: strategyData.title,
            content: strategyData.content,
            difficulty: strategyData.difficulty || 'medium',
            type: strategyData.type || 'general',
            user_id: 1 // 测试环境使用固定用户ID
          }
          response = await apiClient.post('/api/strategies', strategyPayload)
        }
        
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
        if (error.response?.status === 401) {
          const errorData = {
            message: '未授权，请先登录',
            type: 'unauthorized',
            statusCode: 401
          }
          throw errorData
        } else if (error.response?.status === 400) {
          const errorData = {
            message: error.response.data?.message || '请检查输入信息',
            type: 'validation_error',
            statusCode: 400
          }
          throw errorData
        } else {
          const errorData = {
            message: this.strategiesError,
            type: 'network_error',
            statusCode: error.response?.status
          }
          throw errorData
        }
      } finally {
        this.strategiesLoading = false
      }
    },
    
    /**
     * 创建新游戏
     */
    async createGame(gameData) {
      console.log('createGame方法开始执行，接收的数据:', gameData);
      
      // 验证必要字段是否存在
      if (!gameData.name || !gameData.developer || !gameData.category) {
        console.error('缺少必要字段:', { name: gameData.name, developer: gameData.developer, category: gameData.category });
        throw new Error('缺少必要字段: 游戏名称、开发商和分类为必填项');
      }
      
      this.gamesLoading = true
      this.gamesError = null
      
      try {
        // 确保gameData包含必要字段并符合后端API要求，添加所有可能的字段
        const gamePayload = {
          name: gameData.name,
          description: gameData.description || '',
          developer: gameData.developer,
          publisher: gameData.publisher || '',
          category: gameData.category,
          release_date: gameData.release_date || null,
          cover_image_url: gameData.cover_image_url || '',
          status: gameData.status || 'draft'
        };
        
        console.log('准备发送到API的数据:', gamePayload);
        console.log('API请求URL:', '/api/games');
        
        // 显示apiClient对象信息
        console.log('apiClient对象存在:', !!apiClient);
        console.log('apiClient.post方法存在:', typeof apiClient.post === 'function');
        
        // 尝试发送请求
        console.log('开始发送API请求...');
        const response = await apiClient.post('/api/games', gamePayload)
        
        console.log('API请求成功，响应数据:', response);
        
        // 将新创建的游戏添加到游戏列表中
        if (response.data || response) {
          const newGame = response.data || response
          console.log('准备添加到游戏列表的新游戏:', newGame);
          this.games.unshift(newGame)
          this.gamesTotal++
        }
        
        console.log('createGame方法执行成功');
        return response.data || response
      } catch (error) {
        this.gamesError = error.message || '创建游戏失败'
        console.error('Failed to create game:', error);
        console.error('错误详情:', error.response?.data || error);
        console.error('错误状态码:', error.response?.status);
        
        // 处理不同类型的错误
        if (error.response?.status === 401) {
          const errorData = {
            message: '未授权，请先登录',
            type: 'unauthorized',
            statusCode: 401
          }
          throw errorData
        } else if (error.response?.status === 400) {
          const errorData = {
            message: error.response.data?.message || '请检查输入信息',
            type: 'validation_error',
            statusCode: 400
          }
          throw errorData
        } else {
          const errorData = {
            message: this.gamesError,
            type: 'network_error',
            statusCode: error.response?.status
          }
          throw errorData
        }
      } finally {
        this.gamesLoading = false
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
    },
    
    /**
     * 测试API连接
     */
    async testApiConnection() {
      console.log('开始测试API连接...');
      try {
        // 直接测试POST请求到/api/games
        const testData = {
          name: '测试游戏',
          developer: '测试开发商',
          category: '角色扮演',
          description: '这是一个测试游戏',
          status: 'draft'
        };
        
        console.log('测试数据:', testData);
        const response = await apiClient.post('/api/games', testData);
        console.log('API测试成功，响应:', response);
        return response;
      } catch (error) {
        console.error('API测试失败:', error);
        console.error('错误详情:', error.response || error);
        throw error;
      }
    }
  }
})