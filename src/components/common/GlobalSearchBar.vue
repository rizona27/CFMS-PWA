<template>
  <div class="search-bar-container">
    <div class="search-bar glass-effect">
      <div class="search-icon">🔍</div>
      <input
        v-model="searchTermInternal"
        type="text"
        :placeholder="placeholder"
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
  modelValue: string
  /** 占位符文本 */
  placeholder?: string
}>()

const emit = defineEmits<{
  /** 搜索词变化时触发，更新父组件状态 */
  (e: 'update:modelValue', value: string): void
  /** 用户点击清空按钮时触发 */
  (e: 'clear'): void
}>()

const searchTermInternal = ref(props.modelValue || '')

// 监听外部 modelValue 的变化，保持内部状态同步
watch(() => props.modelValue, (newValue) => {
  searchTermInternal.value = newValue
})

/**
 * 处理输入事件，同步内部和外部状态
 */
const onInput = () => {
  emit('update:modelValue', searchTermInternal.value)
}

/**
 * 清空搜索词
 */
const clearSearch = () => {
  searchTermInternal.value = ''
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style scoped>
.search-bar-container {
  width: 100%;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 999px;
  background: var(--glass-bg, rgba(255, 255, 255, 0.8));
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.2));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-icon {
  font-size: 16px;
  color: var(--text-secondary, #64748b);
  margin-right: 10px;
}

.search-input {
  flex-grow: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: var(--text-primary, #1e293b);
  padding: 0;
}

.search-input::placeholder {
  color: var(--text-secondary, #64748b);
  opacity: 0.6;
}

.clear-button {
  background: var(--text-secondary, #64748b);
  color: var(--bg-primary, #f5f7fa);
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
  background: var(--text-primary, #1e293b);
}

/* 深色模式适配 */
:root.dark .search-bar {
  background: var(--glass-bg-dark, rgba(30, 30, 46, 0.8));
  border: 1px solid var(--glass-border-dark, rgba(255, 255, 255, 0.1));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

:root.dark .search-icon {
  color: var(--text-secondary, #cbd5e1);
}

:root.dark .search-input {
  color: var(--text-primary, #f1f5f9);
}

:root.dark .search-input::placeholder {
  color: var(--text-secondary, #cbd5e1);
}

:root.dark .clear-button {
  background: var(--text-secondary, #cbd5e1);
  color: var(--bg-primary, #1a1a2e);
}

:root.dark .clear-button:hover {
  background: var(--text-primary, #f1f5f9);
}
</style>
