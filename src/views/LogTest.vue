<template>
  <div class="test-container">
    <h1>日志测试页面</h1>
    <p>这是一个测试页面，用于记录组件生命周期和渲染信息</p>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'

console.log('LogTest组件开始初始化')

const route = useRoute()
const componentMounted = ref(false)
console.log('路由参数:', route.query)

onMounted(() => {
  console.log('✅ LogTest组件已成功挂载')
  componentMounted.value = true
  console.log('组件挂载状态:', componentMounted.value)
  console.log('搜索关键词:', route.query.q || '未提供')
  
  // 执行一些简单操作并记录
  setTimeout(() => {
    console.log('3秒后 - 确认组件仍然活跃')
  }, 3000)
})

onBeforeUnmount(() => {
  console.log('❌ LogTest组件即将卸载')
})

console.log('LogTest组件初始化完成')
</script>

<style scoped>
.test-container {
  text-align: center;
  padding: 50px;
  background-color: #f0f0f0;
  border-radius: 10px;
  margin: 50px;
}

h1 {
  color: blue;
  font-size: 36px;
}
</style>