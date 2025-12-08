<template>
  <div class="api-log-view">
    <div class="custom-navbar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
        返回
      </button>
      <h1 class="page-title">API 日志</h1>
      <div class="nav-spacer"></div>
    </div>
    
    <div class="content">
      <!-- 日志类型筛选器 -->
      <div class="log-filter-section">
        <div class="filter-title">筛选日志类型</div>
        <div class="filter-buttons">
          <button
            v-for="type in allLogTypes"
            :key="type"
            class="filter-button"
            :class="{
              'selected': selectedLogTypes.includes(type),
              [type]: true
            }"
            @click="toggleLogType(type)"
          >
            <span class="filter-button-icon">
              <span class="check-icon" v-if="selectedLogTypes.includes(type)">✓</span>
            </span>
            <span class="filter-button-text">{{ getLogTypeDisplayName(type) }}</span>
            <span class="filter-count" v-if="getLogCountByType(type) > 0">
              {{ getLogCountByType(type) }}
            </span>
          </button>
        </div>
        
        <div class="filter-actions">
          <button class="action-button" @click="toggleSelectAll">
            {{ isAllSelected ? '取消全选' : '全选' }}
          </button>
          <button class="action-button danger" @click="clearLogs" :disabled="logEntries.length === 0">
            清空日志
          </button>
        </div>
      </div>
      
      <!-- 分割线 -->
      <div class="divider"></div>
      
      <!-- 日志列表 -->
      <div class="log-list-container" ref="logListContainer" @scroll="handleUserScroll">
        <div v-if="logEntries.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">暂无 API 日志记录</div>
          <div class="empty-subtext">API 操作日志将在这里显示</div>
        </div>
        
        <div v-else-if="filteredLogs.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">没有匹配的日志记录</div>
          <div class="empty-subtext">请调整筛选条件</div>
        </div>
        
        <div v-else class="log-list">
          <!-- 按类型分组的日志 -->
          <div
            v-for="type in filteredLogTypes"
            :key="type"
            class="log-type-group"
          >
            <div class="log-type-header" @click="toggleExpandType(type)">
              <div class="type-info">
                <span class="type-dot" :class="type"></span>
                <span class="type-name">{{ getLogTypeDisplayName(type) }}</span>
                <span class="type-count">({{ getLogsByType(type).length }})</span>
              </div>
              <span class="expand-icon">
                {{ isTypeExpanded(type) ? '▲' : '▼' }}
              </span>
            </div>
            
            <div class="log-items" v-if="isTypeExpanded(type)">
              <div
                v-for="log in getLogsByType(type)"
                :key="log.id"
                class="log-item"
                :class="log.type"
              >
                <div class="log-header">
                  <span class="log-timestamp">{{ formatTimestamp(log.timestamp) }}</span>
                  <span class="log-id">#{{ formatLogId(log.id) }}</span>
                </div>
                <div class="log-message">{{ log.message }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Toast 消息 -->
    <div v-if="showToast" class="toast-message" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../stores/dataStore'
import { useAuthStore } from '../stores/authStore'
import type { LogEntry } from '../stores/dataStore'

const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()

// 所有日志类型
const allLogTypes = ['info', 'success', 'error', 'warning', 'network', 'cache'] as const

// 响应式状态
const selectedLogTypes = ref<string[]>(['info', 'success', 'error', 'warning', 'network', 'cache'])
const expandedLogTypes = ref<string[]>(['info', 'success', 'error', 'warning', 'network', 'cache'])
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('info')
const logListContainer = ref<HTMLElement>()
const isAutoScrolling = ref(true)

// 从 localStorage 加载筛选状态
const loadFilterState = () => {
  try {
    const savedTypes = localStorage.getItem('selectedLogTypes')
    if (savedTypes) {
      selectedLogTypes.value = JSON.parse(savedTypes)
    }
    
    const savedExpanded = localStorage.getItem('expandedLogTypes')
    if (savedExpanded) {
      expandedLogTypes.value = JSON.parse(savedExpanded)
    }
  } catch (error) {
    console.error('加载日志筛选状态失败:', error)
    dataStore.addLog('加载日志筛选状态失败: ' + (error as Error).message, 'error')
  }
}

// 保存筛选状态到 localStorage
const saveFilterState = () => {
  try {
    localStorage.setItem('selectedLogTypes', JSON.stringify(selectedLogTypes.value))
    localStorage.setItem('expandedLogTypes', JSON.stringify(expandedLogTypes.value))
  } catch (error) {
    console.error('保存日志筛选状态失败:', error)
    dataStore.addLog('保存日志筛选状态失败: ' + (error as Error).message, 'error')
  }
}

// 计算属性
const logEntries = computed(() => dataStore.logMessages)
const filteredLogs = computed(() => {
  return logEntries.value.filter(log => selectedLogTypes.value.includes(log.type))
})
const isAllSelected = computed(() => {
  return selectedLogTypes.value.length === allLogTypes.length
})

// 获取按类型分组的日志类型
const filteredLogTypes = computed(() => {
  const types = new Set<string>()
  filteredLogs.value.forEach(log => types.add(log.type))
  return Array.from(types).sort()
})

// 方法
const goBack = () => {
  router.back()
  dataStore.addLog('从API日志页面返回', 'info')
}

const getLogTypeDisplayName = (type: string): string => {
  const displayNames: Record<string, string> = {
    'info': '信息',
    'success': '成功',
    'error': '错误',
    'warning': '警告',
    'network': '网络',
    'cache': '缓存'
  }
  return displayNames[type] || type
}

const getLogCountByType = (type: string): number => {
  return logEntries.value.filter(log => log.type === type).length
}

const getLogsByType = (type: string): LogEntry[] => {
  return logEntries.value
    .filter(log => log.type === type)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

const toggleLogType = (type: string) => {
  const index = selectedLogTypes.value.indexOf(type)
  if (index === -1) {
    selectedLogTypes.value.push(type)
  } else {
    selectedLogTypes.value.splice(index, 1)
  }
  saveFilterState()
  
  // 记录操作日志
  const action = index === -1 ? '选择' : '取消选择'
  dataStore.addLog(`日志筛选: ${action} ${getLogTypeDisplayName(type)} 类型`, 'info')
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedLogTypes.value = []
  } else {
    selectedLogTypes.value = [...allLogTypes]
  }
  saveFilterState()
  
  // 记录操作日志
  dataStore.addLog(
    `日志筛选: ${isAllSelected.value ? '取消全选' : '全选'} 所有类型`,
    'info'
  )
}

const toggleExpandType = (type: string) => {
  const index = expandedLogTypes.value.indexOf(type)
  if (index === -1) {
    expandedLogTypes.value.push(type)
  } else {
    expandedLogTypes.value.splice(index, 1)
  }
  saveFilterState()
}

const isTypeExpanded = (type: string): boolean => {
  return expandedLogTypes.value.includes(type)
}

const clearLogs = () => {
  if (logEntries.value.length === 0) return
  
  dataStore.clearLogs()
  showToastMessage('日志已清空', 'success')
  
  // 记录操作日志（因为刚刚清空，需要重新添加）
  setTimeout(() => {
    dataStore.addLog('清空了所有日志记录', 'info')
  }, 100)
}

const formatTimestamp = (date: Date): string => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  
  const logDate = new Date(date)
  const logDay = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate())
  
  let dateStr = ''
  if (logDay.getTime() === today.getTime()) {
    dateStr = '今天'
  } else if (logDay.getTime() === yesterday.getTime()) {
    dateStr = '昨天'
  } else {
    dateStr = `${logDate.getMonth() + 1}月${logDate.getDate()}日`
  }
  
  const timeStr = logDate.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  return `${dateStr} ${timeStr}`
}

const formatLogId = (id: string): string => {
  return id.substring(0, 8)
}

const showToastMessage = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// 监听日志变化，自动滚动到底部
const scrollToBottom = () => {
  if (logListContainer.value && isAutoScrolling.value) {
    setTimeout(() => {
      logListContainer.value?.scrollTo({
        top: logListContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }, 100)
  }
}

// 处理用户滚动，暂停自动滚动
const handleUserScroll = () => {
  if (!logListContainer.value) return
  
  const container = logListContainer.value
  const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50
  
  // 如果用户滚动到底部，恢复自动滚动
  if (isAtBottom) {
    isAutoScrolling.value = true
  } else {
    isAutoScrolling.value = false
  }
}

// 生命周期
onMounted(() => {
  loadFilterState()
  
  // 记录访问日志
  dataStore.addLog('打开 API 日志页面', 'info')
  
  // 监听日志变化
  const unwatch = watch(() => logEntries.value.length, scrollToBottom)
  
  onUnmounted(() => {
    unwatch()
  })
})
</script>

<style scoped>
.api-log-view {
  height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.custom-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.back-button:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.back-icon {
  font-size: 18px;
  line-height: 1;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
  flex: 1;
}

.nav-spacer {
  width: 80px;
  visibility: hidden;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.log-filter-section {
  padding: 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-align: center;
}

.filter-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.filter-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.filter-button:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.filter-button.selected {
  border-color: currentColor;
  color: white;
  font-weight: 500;
}

.filter-button.info.selected {
  background: linear-gradient(135deg, #ff9a00, #ff5e00);
  border-color: #ff5e00;
}

.filter-button.success.selected {
  background: linear-gradient(135deg, #00b09b, #96c93d);
  border-color: #00b09b;
}

.filter-button.error.selected {
  background: linear-gradient(135deg, #ff416c, #ff4b2b);
  border-color: #ff416c;
}

.filter-button.warning.selected {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  border-color: #ffa500;
}

.filter-button.network.selected {
  background: linear-gradient(135deg, #2196f3, #21cbf3);
  border-color: #2196f3;
}

.filter-button.cache.selected {
  background: linear-gradient(135deg, #9c27b0, #673ab7);
  border-color: #9c27b0;
}

.filter-button-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.check-icon {
  font-weight: bold;
}

.filter-button-text {
  flex: 1;
  text-align: center;
}

.filter-count {
  font-size: 10px;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--accent-color), #2196f3);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.danger {
  background: linear-gradient(135deg, #ff416c, #ff4b2b);
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 0 16px;
  position: relative;
  flex-shrink: 0;
}

.divider::before {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  top: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 5px,
    var(--border-color) 5px,
    var(--border-color) 10px
  );
}

.log-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-secondary);
  padding: 40px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.empty-subtext {
  font-size: 14px;
  opacity: 0.7;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log-type-group {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

:root.dark .log-type-group {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.log-type-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--bg-hover);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.log-type-header:hover {
  background: var(--bg-hover);
  opacity: 0.9;
}

.type-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.type-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-dot.info {
  background: linear-gradient(135deg, #ff9a00, #ff5e00);
}

.type-dot.success {
  background: linear-gradient(135deg, #00b09b, #96c93d);
}

.type-dot.error {
  background: linear-gradient(135deg, #ff416c, #ff4b2b);
}

.type-dot.warning {
  background: linear-gradient(135deg, #ffd700, #ffa500);
}

.type-dot.network {
  background: linear-gradient(135deg, #2196f3, #21cbf3);
}

.type-dot.cache {
  background: linear-gradient(135deg, #9c27b0, #673ab7);
}

.type-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.type-count {
  font-size: 14px;
  color: var(--text-secondary);
  margin-left: 4px;
}

.expand-icon {
  font-size: 12px;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.log-type-header:hover .expand-icon {
  color: var(--accent-color);
}

.log-items {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.log-item {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: var(--bg-hover);
  border-left: 4px solid;
  transition: all 0.2s ease;
}

.log-item:hover {
  transform: translateX(4px);
  background: var(--bg-hover);
}

.log-item.info {
  border-left-color: #ff9a00;
}

.log-item.success {
  border-left-color: #00b09b;
}

.log-item.error {
  border-left-color: #ff416c;
}

.log-item.warning {
  border-left-color: #ffd700;
}

.log-item.network {
  border-left-color: #2196f3;
}

.log-item.cache {
  border-left-color: #9c27b0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.log-timestamp {
  color: var(--text-secondary);
  font-family: monospace;
}

.log-id {
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 10px;
}

.log-message {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.toast-message {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  max-width: 320px;
  width: auto;
  text-align: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.08);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-message.info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(30, 64, 175, 0.9));
  color: white;
  border-color: rgba(59, 130, 246, 0.3);
}

.toast-message.success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(21, 128, 61, 0.9));
  color: white;
  border-color: rgba(34, 197, 94, 0.3);
}

.toast-message.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(185, 28, 28, 0.9));
  color: white;
  border-color: rgba(239, 68, 68, 0.3);
}

.toast-message.warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(180, 83, 9, 0.9));
  color: white;
  border-color: rgba(245, 158, 11, 0.3);
}

:root.dark .toast-message {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.25),
    0 4px 16px rgba(0, 0, 0, 0.2);
}

:root.dark .toast-message.info {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(59, 130, 246, 0.9));
}

:root.dark .toast-message.success {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.9), rgba(34, 197, 94, 0.9));
}

:root.dark .toast-message.error {
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.9), rgba(239, 68, 68, 0.9));
}

:root.dark .toast-message.warning {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.9), rgba(245, 158, 11, 0.9));
}

/* 移动端优化 */
@media (max-width: 768px) {
  .filter-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .log-items {
    max-height: 300px;
  }
  
  .log-timestamp {
    font-size: 10px;
  }
  
  .toast-message {
    bottom: 80px;
    max-width: 280px;
    font-size: 13px;
  }
}

/* 滚动条样式 */
.log-list-container::-webkit-scrollbar,
.log-items::-webkit-scrollbar {
  width: 6px;
}

.log-list-container::-webkit-scrollbar-track,
.log-items::-webkit-scrollbar-track {
  background: var(--bg-hover);
  border-radius: 3px;
}

.log-list-container::-webkit-scrollbar-thumb,
.log-items::-webkit-scrollbar-thumb {
  background: var(--text-secondary);
  border-radius: 3px;
}

.log-list-container::-webkit-scrollbar-thumb:hover,
.log-items::-webkit-scrollbar-thumb:hover {
  background: var(--accent-color);
}
</style>
