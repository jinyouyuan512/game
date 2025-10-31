import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAIStore = defineStore('ai', {
  state: () => ({
    conversations: [],
    currentConversation: [],
    loading: false,
    error: null,
    sessionId: null
  }),

  actions: {
    initSession() {
      this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      this.currentConversation = []
    },

    async askQuestion(question, gameId = null) {
      if (!this.sessionId) {
        this.initSession()
      }

      this.loading = true
      this.error = null

      // 添加用户问题到对话
      const userMessage = {
        type: 'user',
        content: question,
        timestamp: new Date()
      }
      this.currentConversation.push(userMessage)

      try {
        // 模拟AI回答 - 在实际项目中这里应该调用真实的AI API
        const answer = await this.generateAIResponse(question, gameId)
        
        // 添加AI回答到对话
        const aiMessage = {
          type: 'ai',
          content: answer,
          timestamp: new Date()
        }
        this.currentConversation.push(aiMessage)

        // 保存对话记录到数据库
        await this.saveConversation(question, answer, gameId)

      } catch (error) {
        this.error = error.message
        console.error('Error asking question:', error)
        
        // 添加错误消息
        const errorMessage = {
          type: 'ai',
          content: '抱歉，我现在无法回答您的问题。请稍后再试。',
          timestamp: new Date(),
          isError: true
        }
        this.currentConversation.push(errorMessage)
      } finally {
        this.loading = false
      }
    },

    async generateAIResponse(question, gameId) {
      // 调用后端真实AI API
      try {
        const response = await fetch('/api/ai/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': this.sessionId
          },
          body: JSON.stringify({ question, gameId })
        });
        
        if (!response.ok) {
          throw new Error(`AI API响应失败: ${response.status}`);
        }
        
        const data = await response.json();
        return data.answer;
      } catch (error) {
        console.error('调用真实AI API失败，使用本地备用逻辑:', error.message);
        
        // 备用逻辑（保持原有模拟功能，确保在API调用失败时仍能提供服务）
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

        // 根据问题关键词生成相应回答
        const lowerQuestion = question.toLowerCase()
        
        if (lowerQuestion.includes('原神')) {
          if (lowerQuestion.includes('角色') || lowerQuestion.includes('培养')) {
            return '在原神中，角色培养主要包括以下几个方面：\n\n1. **等级提升**：使用经验书提升角色等级\n2. **天赋升级**：收集天赋材料提升技能等级\n3. **圣遗物搭配**：根据角色定位选择合适的圣遗物套装\n4. **武器选择**：为角色装备适合的武器\n\n建议优先培养主C角色，再考虑辅助角色的培养。'
          } else if (lowerQuestion.includes('元素') || lowerQuestion.includes('反应')) {
            return '原神的元素反应系统是战斗的核心：\n\n**增幅反应**：\n- 蒸发：水+火，伤害x1.5或x2\n- 融化：冰+火，伤害x1.5或x2\n\n**剧变反应**：\n- 超载：雷+火，造成范围爆炸伤害\n- 感电：雷+水，持续造成雷元素伤害\n- 冻结：冰+水，冻结敌人\n- 超导：雷+冰，降低物理抗性\n\n合理利用元素反应可以大幅提升战斗效率！'
          }
        } else if (lowerQuestion.includes('赛博朋克') || lowerQuestion.includes('2077')) {
          if (lowerQuestion.includes('结局') || lowerQuestion.includes('ending')) {
            return '赛博朋克2077有多个结局，主要取决于以下因素：\n\n**主要结局路线**：\n1. **恶魔结局**：选择荒坂的帮助\n2. **星星结局**：与帕南一起离开夜之城\n3. **太阳结局**：独自突袭荒坂塔\n4. **节制结局**：让强尼接管身体\n\n**隐藏结局**：\n- 需要与强尼的关系达到70%以上\n- 在屋顶选择等待5分钟不做任何选择\n\n每个结局都有不同的前置条件和角色关系要求。'
          }
        } else if (lowerQuestion.includes('塞尔达') || lowerQuestion.includes('王国之泪')) {
          if (lowerQuestion.includes('建造') || lowerQuestion.includes('究极手')) {
            return '王国之泪的建造系统使用究极手能力：\n\n**基础操作**：\n1. 使用究极手抓取物品\n2. 将物品组合在一起\n3. 创造各种载具和机械\n\n**实用建造技巧**：\n- **飞行器**：使用扇叶+电池制作\n- **载具**：轮子+木板制作基础车辆\n- **攻击装置**：长矛+弹簧制作投射器\n\n**高级技巧**：\n- 利用物理引擎创造复杂机械\n- 组合不同材料获得特殊效果\n- 保存常用设计到收藏夹'
          }
        }

        // 默认回答
        return `感谢您的提问！关于"${question}"，我建议您：\n\n1. 查看相关的游戏攻略文章\n2. 参考官方游戏指南\n3. 与其他玩家交流经验\n\n如果您需要更具体的帮助，请提供更多详细信息，我会尽力为您解答。`
      }
    },

    async saveConversation(question, answer, gameId = null) {
      try {
        const conversationData = {
          question,
          answer,
          session_id: this.sessionId,
          game_id: gameId,
          context_data: {
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            page_url: window.location.href
          }
        }
        
        // 尝试保存到数据库
        try {
          const { data, error } = await supabase
            .from('ai_conversations')
            .insert([conversationData])
            .select()
          
          if (error) {
            console.warn('Supabase保存失败，使用本地存储:', error.message)
            // 不抛出错误，而是继续使用本地存储
          } else {
            console.log('对话保存成功到数据库:', data)
            return data
          }
        } catch (dbError) {
          console.warn('数据库连接错误，使用本地存储:', dbError.message)
        }
        
        // 使用本地存储作为备选方案
        try {
          const localHistory = JSON.parse(localStorage.getItem('ai_conversations') || '[]')
          localHistory.push({
            ...conversationData,
            id: Date.now(),
            created_at: new Date().toISOString()
          })
          localStorage.setItem('ai_conversations', JSON.stringify(localHistory))
          console.log('对话已保存到本地存储')
          return { id: Date.now(), ...conversationData }
        } catch (localError) {
          console.error('本地存储保存失败:', localError)
        }
        
        // 如果两种方式都失败，仅返回数据对象
        return { id: Date.now(), ...conversationData }
      } catch (error) {
        console.error('保存对话处理失败:', error)
        // 不再设置error状态，避免干扰用户体验
        return null
      }
    },

    async fetchConversationHistory(sessionId = null) {
      try {
        const targetSessionId = sessionId || this.sessionId
        
        // 尝试从数据库获取
        try {
          const { data, error } = await supabase
            .from('ai_conversations')
            .select(`
              *,
              games (
                name,
                category
              )
            `)
            .eq('session_id', targetSessionId)
            .order('created_at', { ascending: true })
          
          if (!error && data && data.length > 0) {
            // 转换数据格式以匹配前端需求
            const conversations = data.map(item => [
              {
                type: 'user',
                content: item.question,
                timestamp: new Date(item.created_at).getTime()
              },
              {
                type: 'ai',
                content: item.answer,
                timestamp: new Date(item.created_at).getTime() + 1000 // AI回答稍晚一点
              }
            ]).flat()
            
            this.currentConversation = conversations
            console.log('对话历史从数据库加载成功:', conversations.length, '条消息')
            return conversations
          }
        } catch (dbError) {
          console.warn('数据库查询错误，尝试从本地存储加载:', dbError.message)
        }
        
        // 尝试从本地存储获取
        try {
          const localHistory = JSON.parse(localStorage.getItem('ai_conversations') || '[]')
          const sessionConversations = localHistory
            .filter(item => item.session_id === targetSessionId)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          
          // 转换数据格式
          const conversations = sessionConversations.map(item => [
            {
              type: 'user',
              content: item.question,
              timestamp: new Date(item.created_at).getTime()
            },
            {
              type: 'ai',
              content: item.answer,
              timestamp: new Date(item.created_at).getTime() + 1000
            }
          ]).flat()
          
          this.currentConversation = conversations
          console.log('对话历史从本地存储加载成功:', conversations.length, '条消息')
          return conversations
        } catch (localError) {
          console.error('本地存储读取失败:', localError)
        }
        
        // 如果两种方式都失败，返回空数组
        this.currentConversation = []
        return []
      } catch (error) {
        console.error('获取对话历史处理失败:', error)
        // 不再设置error状态，避免干扰用户体验
        return []
      }
    },

    clearCurrentConversation() {
      this.currentConversation = []
      this.sessionId = null
    }
  }
})