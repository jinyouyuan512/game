import { defineStore } from 'pinia'
import { apiClient } from '../lib/api'

export const useGameStore = defineStore('game', {
  state: () => ({
    games: [],
    currentGame: null,
    strategies: [],
    currentStrategy: null,
    tags: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchGames() {
      this.loading = true
      try {
        const data = await apiClient.get('/api/games')
        this.games = data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching games:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchGameById(id) {
      this.loading = true
      try {
        const data = await apiClient.get(`/api/games/${id}`)
        this.currentGame = data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching game:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchStrategiesByGame(gameId) {
      this.loading = true
      try {
        const data = await apiClient.get(`/api/strategies?gameId=${gameId}`)
        this.strategies = data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching strategies:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchStrategyById(id) {
      this.loading = true
      try {
        const data = await apiClient.get(`/api/strategies/${id}`)
        this.currentStrategy = data
        
        // 增加浏览量
        await this.incrementViewCount(id)
      } catch (error) {
        this.error = error.message
        console.error('Error fetching strategy:', error)
      } finally {
        this.loading = false
      }
    },

    async incrementViewCount(strategyId) {
      try {
        await apiClient.put(`/api/strategies/${strategyId}/view`)
      } catch (error) {
        console.error('Error incrementing view count:', error)
      }
    },

    async searchStrategies(query) {
      this.loading = true
      try {
        const data = await apiClient.get(`/api/strategies/search?q=${encodeURIComponent(query)}`)
        this.strategies = data
      } catch (error) {
        this.error = error.message
        console.error('Error searching strategies:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchTags() {
      try {
        const data = await apiClient.get('/api/tags')
        this.tags = data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching tags:', error)
      }
    },

    async createGame(gameData) {
      this.loading = true
      try {
        const newGame = await apiClient.post('/api/games', gameData)
        this.games.push(newGame)
        return newGame
      } catch (error) {
        this.error = error.message
        console.error('Error creating game:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createStrategy(strategyData) {
      this.loading = true
      try {
        const newStrategy = await apiClient.post('/api/strategies', strategyData)
        // 如果当前有加载过该游戏的攻略，则更新列表
        if (this.strategies && this.strategies.length > 0) {
          this.strategies.push(newStrategy)
        }
        return newStrategy
      } catch (error) {
        this.error = error.message
        console.error('Error creating strategy:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})