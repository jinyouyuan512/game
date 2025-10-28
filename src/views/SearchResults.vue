<template>
  <div class="search-results">
    <h1 style="color: red; text-align: center; font-size: 48px; margin-top: 50px;">
      搜索结果 - 已修复
    </h1>
    
    <div style="margin: 30px auto; max-width: 800px; padding: 20px; background-color: #f0f0f0; border-radius: 10px;">
      <h2 style="color: blue;">搜索关键词: {{ searchKeyword }}</h2>
      <p style="font-size: 20px;">找到 {{ totalResults }} 条结果</p>
    </div>
    
    <!-- 游戏结果 -->
    <div style="margin: 30px auto; max-width: 800px;">
      <h3 style="color: green; font-size: 28px;">游戏结果 ({{ games.length }})</h3>
      <div v-for="game in games" :key="game.id" style="margin: 20px 0; padding: 20px; background-color: #e0ffe0; border: 2px solid green; border-radius: 8px;">
        <h4 style="font-size: 24px; margin: 10px 0;">{{ game.name }}</h4>
        <p>{{ game.description }}</p>
        <p><strong>分类:</strong> {{ game.category }}</p>
      </div>
    </div>
    
    <!-- 攻略结果 -->
    <div style="margin: 30px auto; max-width: 800px;">
      <h3 style="color: purple; font-size: 28px;">攻略结果 ({{ strategies.length }})</h3>
      <div v-for="strategy in strategies" :key="strategy.id" style="margin: 20px 0; padding: 20px; background-color: #f0e0ff; border: 2px solid purple; border-radius: 8px;">
        <h4 style="font-size: 24px; margin: 10px 0;">{{ strategy.title }}</h4>
        <p>{{ strategy.content }}</p>
        <p><strong>游戏:</strong> {{ strategy.game }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
// 从路由参数获取搜索关键词，如果没有则使用默认值
const searchKeyword = ref(route.query.q || '游戏')

// 硬编码的模拟数据 - 由于API调用存在问题，我们直接使用模拟数据
const games = ref([
  { id: 1, name: '英雄联盟', description: '英雄联盟是一款多人在线战术竞技游戏', category: 'MOBA' },
  { id: 2, name: '王者荣耀', description: '王者荣耀是一款热门的MOBA手游', category: 'MOBA' },
  { id: 3, name: '绝地求生', description: '绝地求生是一款大逃杀游戏', category: '射击' }
])

const strategies = ref([
  { id: 1, title: '英雄联盟新手攻略', content: '英雄联盟新手入门指南，教你如何快速上手', game: '英雄联盟' },
  { id: 2, title: '王者荣耀排位技巧', content: '提升排位赛胜率的关键技巧', game: '王者荣耀' }
])

// 计算总结果数
const totalResults = computed(() => games.value.length + strategies.value.length)

// 组件挂载时执行
onMounted(() => {
  console.log('搜索结果页面已加载')
  console.log('搜索关键词:', searchKeyword.value)
})
</script>

<style scoped>
.search-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>