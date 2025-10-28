<template>
  <div class="search-bar">
    <el-input
      v-model="searchQuery"
      placeholder="搜索游戏或攻略..."
      prefix-icon="el-icon-search"
      @keyup.enter="handleSearch"
      :size="size"
      clearable
    >
      <template #append>
        <el-button @click="handleSearch" :size="size" type="primary" icon="el-icon-search"></el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'default'
  }
});

const emit = defineEmits(['update:modelValue', 'search']);
const router = useRouter();
const searchQuery = ref(props.modelValue);

// 监听外部值变化
import { watch } from 'vue';
watch(
  () => props.modelValue,
  (newValue) => {
    searchQuery.value = newValue;
  }
);

// 监听输入值变化，更新父组件
watch(searchQuery, (newValue) => {
  emit('update:modelValue', newValue);
});

// 处理搜索
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }

  // 发出搜索事件
  emit('search', searchQuery.value);
  
  // 跳转到搜索结果页面或直接在当前页面显示结果
  // 根据需要调整路由逻辑
  router.push({
    path: '/search',
    query: { q: searchQuery.value }
  });
};
</script>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 600px;
}

:deep(.el-input__inner) {
  border-radius: 4px;
}

:deep(.el-input-group__append) {
  border-left: none;
  border-radius: 0 4px 4px 0;
}
</style>