<template>
  <div class="search-bar-container">
    <div class="search-bar glass-effect">
      <div class="search-icon">🔍</div>
      <input
        v-model="searchTermInternal"
        type="text"
        placeholder="搜索用户、基金名称、代码或金额..."
        class="search-input"
        @input="onInput"
      />
      <button v-if="searchTermInternal" class="clear-button" @click="clearSearch">
        &times;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  /** 外部传入的搜索词，用于初始化或外部重置 */
  searchTerm: string
}>()

const emit = defineEmits<{
  /** 搜索词变化时触发，更新父组件状态 */
  (e: 'update:searchTerm', value: string): void
  /** 用户点击清空按钮时触发 */
  (e: 'clear'): void
}>()

const searchTermInternal = ref(props.searchTerm || '')

// 监听外部 searchTerm 的变化，保持内部状态同步
watch(() => props.searchTerm, (newValue) => {
  searchTermInternal.value = newValue
})

/**
 * 处理输入事件，同步内部和外部状态
 */
const onInput = () => {
  emit('update:searchTerm', searchTermInternal.value)
}

/**
 * 清空搜索词
 */
const clearSearch = () => {
  searchTermInternal.value = ''
  emit('update:searchTerm', '')
  emit('clear')
}
</script>

<style scoped>
.search-bar-container {
  /* 确保搜索栏占满宽度，居中对齐 */
  width: 100%;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 999px; /* 药丸形状 */
  
  /* 确保磨玻璃效果 */
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  transition: all 0.3s ease;
}

.search-icon {
  font-size: 16px;
  color: var(--text-secondary);
  margin-right: 10px;
}

.search-input {
  flex-grow: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: var(--text-primary);
  padding: 0;
  
  /* 保证输入框背景与磨玻璃背景融合 */
}

/* 占位符样式 */
.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

.clear-button {
  background: var(--text-secondary);
  color: var(--bg-primary);
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 10px;
  padding: 0;
  transition: background 0.2s ease;
}

.clear-button:hover {
  background: var(--text-primary);
}

/* 适配深色模式 */
.dark-mode .search-input {
  background: transparent;
}
.dark-mode .clear-button {
  background: var(--text-secondary);
  color: var(--bg-primary);
}
</style>