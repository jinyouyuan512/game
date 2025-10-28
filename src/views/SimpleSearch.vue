<template>
  <div class="simple-search">
    <h1>简化搜索页面</h1>
    <div class="debug-box">
      <h3>调试信息</h3>
      <p><strong>路由参数q:</strong> {{ routeQuery }}</p>
      <button @click="showAlert">显示Alert</button>
      <button @click="loadMockData">加载模拟数据</button>
    </div>
    
    <div v-if="games.length > 0" class="results">
      <h3>游戏结果 ({{ games.length }})</h3>
      <div v-for="game in games" :key="game.id" class="game-item">
        <h4>{{ game.name }}</h4>
        <p>{{ game.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const routeQuery = ref('')
const games = ref([])

onMounted(() => {
  // 获取路由参数
  const query = route.query.q || ''
  routeQuery.value = query
  console.log('组件挂载，路由参数:', query)
  
  // 直接加载模拟数据
  loadMockData()
})

const showAlert = () => {
  alert('Alert测试成功！当前搜索关键词: ' + routeQuery.value)
}

const loadMockData = () => {
  // 使用模拟数据
  games.value = [
    {
      id: 1,
      name: '英雄联盟',
      description: '一款流行的MOBA游戏'
    },
    {
      id: 2,
      name: '王者荣耀',
      description: '国内热门的MOBA手游'
    }
  ]
  console.log('已加载模拟数据，共', games.value.length, '条')
}
</script>

<style scoped>
.simple-search {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.debug-box {
  background-color: #ffeeee;
  border: 2px solid #ff6b6b;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
}

button {
  margin: 10px 10px 0 0;
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #357abd;
}

.results {
  margin-top: 30px;
}

.game-item {
  border: 1px solid #ddd;
  padding: 15px;
  margin: 10px 0;
  border-radius: 4px;
}
</style>