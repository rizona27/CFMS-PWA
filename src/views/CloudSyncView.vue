<!-- CloudSyncView.vue -->
<template>
  <div class="cloud-sync-view">
    <!-- 使用统一的 NavBar 组件 -->
    <NavBar title="云端同步" backText="返回" backRoute="/config" />
    
    <!-- 可滚动的内容区域 -->
    <div class="scrollable-content-section">
      <div class="content-scroll">
        <div class="content-wrapper">
          <div class="sync-content">
            <!-- 同步卡片区域 -->
            <div class="sync-cards-section">
              <!-- 上传到云端卡片 -->
              <div
                class="sync-card upload-card"
                :class="{ 'disabled': !authStore.isLoggedIn }"
                @click="handleUploadToCloud"
              >
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16V8M9 11L12 8L15 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 17V18C7 19.1046 7.89543 20 9 20H15C16.1046 20 17 19.1046 17 18V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M4 12H3C2.46957 12 1.96086 12.2107 1.58579 12.5858C1.21071 12.9609 1 13.4696 1 14V20C1 20.5304 1.21071 21.0391 1.58579 21.4142C1.96086 21.7893 2.46957 22 3 22H21C21.5304 22 22.0391 21.7893 22.4142 21.4142C22.7893 21.0391 23 20.5304 23 20V14C23 13.4696 22.7893 12.9609 22.4142 12.5858C22.0391 12.2107 21.5304 12 21 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18 6C18 3.79086 16.2091 2 14 2C11.7909 2 10 3.79086 10 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M4 12V6C4 3.79086 5.79086 2 8 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">上传到云端</h4>
                      <p class="card-subtitle">将本地持仓数据备份到云端服务器</p>
                    </div>
                  </div>
                  
                  <div class="card-stats">
                    <div class="stat-item">
                      <span class="stat-label">本地持仓数量:</span>
                      <span class="stat-value">{{ dataStore.holdingsCount }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">数据更新时间:</span>
                      <span class="stat-value">{{ getLastUpdateTime() }}</span>
                    </div>
                  </div>
                  
                  <div class="card-footer">
                    <div class="warning-note">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53216 19 5.07183 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      云端数据将被覆盖
                    </div>
                  </div>
                </div>
                
                <!-- 悬停效果层 -->
                <div class="card-hover-layer">
                  <span class="hover-text">点击上传</span>
                </div>
              </div>
              
              <!-- 从云端下载卡片 -->
              <div
                class="sync-card download-card"
                :class="{ 'disabled': !authStore.isLoggedIn || !hasDownloadPermission }"
                @click="handleDownloadFromCloud"
              >
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V16M9 13L12 16L15 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 17V18C7 19.1046 7.89543 20 9 20H15C16.1046 20 17 19.1046 17 18V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M4 12H3C2.46957 12 1.96086 12.2107 1.58579 12.5858C1.21071 12.9609 1 13.4696 1 14V20C1 20.5304 1.21071 21.0391 1.58579 21.4142C1.96086 21.7893 2.46957 22 3 22H21C21.5304 22 22.0391 21.7893 22.4142 21.4142C22.7893 21.0391 23 20.5304 23 20V14C23 13.4696 22.7893 12.9609 22.4142 12.5858C22.0391 12.2107 21.5304 12 21 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18 6C18 3.79086 16.2091 2 14 2C11.7909 2 10 3.79086 10 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M4 12V6C4 3.79086 5.79086 2 8 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">从云端下载</h4>
                      <p class="card-subtitle">将云端持仓数据同步到本地</p>
                    </div>
                  </div>
                  
                  <div class="card-stats">
                    <div class="stat-item">
                      <span class="stat-label">云端数据状态:</span>
                      <span class="stat-value">{{ getCloudDataStatus() }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">最后同步时间:</span>
                      <span class="stat-value">{{ getLastSyncTime() }}</span>
                    </div>
                  </div>
                  
                  <div class="card-footer">
                    <div class="warning-note error">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53216 19 5.07183 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      本地数据将被覆盖（不可撤销）
                    </div>
                  </div>
                </div>
                
                <!-- 悬停效果层 -->
                <div class="card-hover-layer">
                  <span class="hover-text">点击下载</span>
                </div>
              </div>
            </div>
            
            <!-- 同步历史记录 -->
            <div v-if="syncHistory.length > 0" class="sync-history-section">
              <h4 class="section-title">同步历史</h4>
              <div class="history-list">
                <div
                  v-for="record in syncHistory"
                  :key="record.id"
                  class="history-item"
                  :class="{ 'success': record.status === 'success', 'error': record.status === 'error' }"
                >
                  <div class="history-header">
                    <span class="history-type">{{ record.type === 'upload' ? '上传' : '下载' }}</span>
                    <span class="history-time">{{ formatTime(record.timestamp) }}</span>
                  </div>
                  <div class="history-content">
                    <span class="history-message">{{ record.message }}</span>
                    <span class="history-count" v-if="record.count">({{ record.count }}条)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 底部区域 -->
            <div class="footer-section">
              <div class="footer-text">
                <span class="gradient-text">Sync once, manage everywhere.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加载遮罩层 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p class="loading-text">{{ loadingMessage }}</p>
      </div>
    </div>
    
    <!-- 确认对话框 -->
    <div v-if="showConfirmDialog" class="confirm-dialog-overlay">
      <div class="confirm-dialog">
        <h4 class="dialog-title">{{ confirmTitle }}</h4>
        <p class="dialog-message">{{ confirmMessage }}</p>
        <div class="dialog-actions">
          <button class="dialog-btn cancel" @click="cancelConfirm">取消</button>
          <button
            class="dialog-btn confirm"
            :class="{ 'danger': confirmType === 'download' }"
            @click="executeConfirm"
          >
            {{ confirmType === 'upload' ? '上传' : '下载' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Toast提示 -->
    <ToastMessage
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import NavBar from '@/components/layout/NavBar.vue'
import ToastMessage from '@/components/common/ToastMessage.vue'

const router = useRouter()
const authStore = useAuthStore()
const dataStore = useDataStore()

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cfms.crnas.uk'

// 状态
const isLoading = ref(false)
const loadingMessage = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

// 确认对话框状态
const showConfirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmType = ref<'upload' | 'download'>('upload')

// 云端数据更新时间
const cloudUpdateTime = ref<string>('')

// 同步历史
const syncHistory = ref<Array<{
  id: number
  type: 'upload' | 'download'
  status: 'success' | 'error'
  message: string
  timestamp: Date
  count?: number
}>>([])

// 权限检查
const hasDownloadPermission = computed(() => {
  return authStore.isLoggedIn && authStore.userType !== 'free'
})

// 获取表名（基于用户名）
const getTableName = () => {
  if (!authStore.currentUser?.username) return 'unknown'
  // 将用户名转换为小写，并移除特殊字符
  return authStore.currentUser.username.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// 获取最后更新时间（从云端获取）
const getLastUpdateTime = () => {
  if (cloudUpdateTime.value) {
    return cloudUpdateTime.value
  }
  
  try {
    const lastUpdate = localStorage.getItem('last_data_update')
    if (lastUpdate) {
      const date = new Date(lastUpdate)
      return date.toLocaleDateString('zh-CN')
    }
  } catch (error) {
    console.error('获取最后更新时间失败:', error)
  }
  return '从未更新'
}

// 获取云端数据状态
const getCloudDataStatus = () => {
  if (cloudUpdateTime.value) {
    return '已更新'
  }
  return '未检查'
}

// 获取最后同步时间
const getLastSyncTime = () => {
  try {
    const lastSync = localStorage.getItem('last_cloud_sync')
    if (lastSync) {
      const date = new Date(lastSync)
      return date.toLocaleDateString('zh-CN')
    }
  } catch (error) {
    console.error('获取最后同步时间失败:', error)
  }
  return '从未同步'
}

// 格式化时间
const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 显示通知
const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// 添加同步历史记录
const addSyncHistory = (type: 'upload' | 'download', status: 'success' | 'error', message: string, count?: number) => {
  syncHistory.value.unshift({
    id: Date.now(),
    type,
    status,
    message,
    timestamp: new Date(),
    count
  })
  
  // 限制历史记录数量
  if (syncHistory.value.length > 10) {
    syncHistory.value = syncHistory.value.slice(0, 10)
  }
  
  // 保存到本地存储
  try {
    localStorage.setItem('sync_history', JSON.stringify(syncHistory.value))
  } catch (error) {
    console.error('保存同步历史失败:', error)
  }
}

// 加载同步历史
const loadSyncHistory = () => {
  try {
    const savedHistory = localStorage.getItem('sync_history')
    if (savedHistory) {
      const history = JSON.parse(savedHistory)
      syncHistory.value = history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }))
    }
  } catch (error) {
    console.error('加载同步历史失败:', error)
  }
}

// 检查云端数据更新时间
const checkCloudUpdateTime = async () => {
  try {
    const token = authStore.token || localStorage.getItem('auth_token')
    if (!token) {
      return
    }
    
    const response = await fetch(`${API_BASE_URL}/api/holdings/last-update`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.lastUpdate) {
        const date = new Date(result.lastUpdate)
        cloudUpdateTime.value = date.toLocaleDateString('zh-CN')
      }
    }
  } catch (error) {
    console.error('检查云端数据更新时间失败:', error)
  }
}

// 处理上传到云端
const handleUploadToCloud = () => {
  if (!authStore.isLoggedIn) {
    showNotification('请先登录账户', 'warning')
    return
  }
  
  if (dataStore.holdingsCount === 0) {
    showNotification('本地没有持仓数据可上传', 'warning')
    return
  }
  
  confirmTitle.value = '确认上传'
  confirmMessage.value = `这将把 ${dataStore.holdingsCount} 条本地持仓记录上传到云端，如有重复数据将被覆盖。`
  confirmType.value = 'upload'
  showConfirmDialog.value = true
}

// 处理从云端下载
const handleDownloadFromCloud = () => {
  if (!authStore.isLoggedIn) {
    showNotification('请先登录账户', 'warning')
    return
  }
  
  if (!hasDownloadPermission.value) {
    showNotification('没有下载权限，请联系管理员或确认订阅状态', 'warning')
    return
  }
  
  confirmTitle.value = '确认下载'
  confirmMessage.value = `这将从云端下载持仓数据并覆盖本地所有持仓记录，此操作不可撤销。`
  confirmType.value = 'download'
  showConfirmDialog.value = true
}

// 取消确认
const cancelConfirm = () => {
  showConfirmDialog.value = false
}

// 执行确认操作
const executeConfirm = async () => {
  showConfirmDialog.value = false
  
  if (confirmType.value === 'upload') {
    await uploadHoldingsToCloud()
  } else {
    await downloadHoldingsFromCloud()
  }
}

// 上传持仓到云端
const uploadHoldingsToCloud = async () => {
  isLoading.value = true
  loadingMessage.value = '正在上传持仓数据...'
  
  try {
    const token = authStore.token || localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('请先登录')
    }
    
    const username = authStore.currentUser?.username
    if (!username) {
      throw new Error('用户信息不完整')
    }
    
    // 准备上传数据
    const holdings = dataStore.holdings.map(holding => ({
      id: holding.id,
      clientName: holding.clientName,
      clientID: holding.clientID,
      fundCode: holding.fundCode,
      fundName: holding.fundName,
      purchaseDate: holding.purchaseDate.toISOString().split('T')[0],
      purchaseAmount: holding.purchaseAmount,
      purchaseShares: holding.purchaseShares,
      currentNav: holding.currentNav,
      navDate: holding.navDate.toISOString().split('T')[0],
      isPinned: holding.isPinned ? 1 : 0,
      pinnedTimestamp: holding.pinnedTimestamp?.toISOString() || null,
      remarks: holding.remarks || '',
      navReturn1m: holding.navReturn1m || null,
      navReturn3m: holding.navReturn3m || null,
      navReturn6m: holding.navReturn6m || null,
      navReturn1y: holding.navReturn1y || null
    }))
    
    const requestData = {
      holdings: holdings,
      username: username
    }
    
    const response = await fetch(`${API_BASE_URL}/api/holdings/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `上传失败: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success) {
      const uploadedCount = result.uploaded_count || holdings.length
      
      // 更新最后同步时间
      const now = new Date()
      localStorage.setItem('last_cloud_sync', now.toISOString())
      
      // 更新云端更新时间显示
      cloudUpdateTime.value = now.toLocaleDateString('zh-CN')
      
      // 添加历史记录
      addSyncHistory('upload', 'success', '上传到云端成功', uploadedCount)
      
      showNotification(`上传成功！共上传 ${uploadedCount} 条持仓记录`, 'success')
      dataStore.safeAddLog(`云端同步: 上传 ${uploadedCount} 条持仓到云端`, 'success', false)
    } else {
      throw new Error(result.error || '上传失败')
    }
    
  } catch (error: any) {
    console.error('上传持仓失败:', error)
    addSyncHistory('upload', 'error', `上传失败: ${error.message}`)
    showNotification(`上传失败: ${error.message}`, 'error')
    dataStore.safeAddLog(`云端同步: 上传失败 - ${error.message}`, 'error', false)
  } finally {
    isLoading.value = false
  }
}

// 从云端下载持仓
const downloadHoldingsFromCloud = async () => {
  isLoading.value = true
  loadingMessage.value = '正在下载持仓数据...'
  
  try {
    const token = authStore.token || localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('请先登录')
    }
    
    const username = authStore.currentUser?.username
    if (!username) {
      throw new Error('用户信息不完整')
    }
    
    const requestData = {
      username: username
    }
    
    const response = await fetch(`${API_BASE_URL}/api/holdings/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `下载失败: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.holdings) {
      // 清空现有持仓
      dataStore.clearAllHoldings()
      
      // 批量添加下载的持仓
      const holdings = result.holdings.map((item: any) => {
        // 转换为本地持仓格式
        return {
          id: item.id || crypto.randomUUID(),
          clientName: item.clientName || '',
          clientID: item.clientID || '',
          fundCode: item.fundCode || '',
          fundName: item.fundName || '',
          purchaseAmount: item.purchaseAmount || 0,
          purchaseShares: item.purchaseShares || 0,
          purchaseDate: new Date(item.purchaseDate || new Date()),
          remarks: item.remarks || '',
          currentNav: item.currentNav || 0,
          navDate: new Date(item.navDate || new Date()),
          isValid: true,
          isPinned: item.isPinned || false,
          pinnedTimestamp: item.pinnedTimestamp ? new Date(item.pinnedTimestamp) : undefined,
          navReturn1m: item.navReturn1m,
          navReturn3m: item.navReturn3m,
          navReturn6m: item.navReturn6m,
          navReturn1y: item.navReturn1y
        }
      })
      
      // 批量添加持仓
      const batchResult = dataStore.batchAddHoldings(holdings)
      
      // 更新最后同步时间
      const now = new Date()
      localStorage.setItem('last_cloud_sync', now.toISOString())
      
      // 更新本地数据更新时间
      localStorage.setItem('last_data_update', now.toISOString())
      
      // 添加历史记录
      addSyncHistory('download', 'success', '从云端下载成功', batchResult.success)
      
      showNotification(`下载成功！共下载 ${batchResult.success} 条持仓记录`, 'success')
      dataStore.safeAddLog(`云端同步: 从云端下载 ${batchResult.success} 条持仓`, 'success', false)
      
    } else {
      throw new Error(result.error || '下载失败')
    }
    
  } catch (error: any) {
    console.error('下载持仓失败:', error)
    addSyncHistory('download', 'error', `下载失败: ${error.message}`)
    showNotification(`下载失败: ${error.message}`, 'error')
    dataStore.safeAddLog(`云端同步: 下载失败 - ${error.message}`, 'error', false)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadSyncHistory()
  checkCloudUpdateTime()
  dataStore.safeAddLog('用户访问云端同步页面', 'info', false)
})
</script>

<style scoped>
.cloud-sync-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:root.dark .cloud-sync-view {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

/* 可滚动的内容区域 */
.scrollable-content-section {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: transparent;
}

.content-scroll {
  height: 100%;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 同步内容区域 */
.sync-content {
  padding: 16px 0 120px;
}

/* 同步卡片区域 */
.sync-cards-section {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .sync-cards-section {
    flex-direction: column;
    gap: 16px;
  }
}

/* 同步卡片通用样式 */
.sync-card {
  flex: 1;
  min-height: 280px;
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.sync-card:hover:not(.disabled) {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
}

.sync-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sync-card.disabled:hover {
  transform: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 上传卡片样式 */
.upload-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  border: 2px solid rgba(16, 185, 129, 0.3);
}

.upload-card .card-icon svg {
  color: #10b981;
}

/* 下载卡片样式 */
.download-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%);
  border: 2px solid rgba(59, 130, 246, 0.3);
}

.download-card .card-icon svg {
  color: #3b82f6;
}

.download-card.disabled {
  border-color: rgba(156, 163, 175, 0.3);
}

.download-card.disabled .card-icon svg {
  color: #9ca3af;
}

/* 卡片内容 */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

:root.dark .card-icon {
  background: rgba(255, 255, 255, 0.1);
}

.card-title-wrapper {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

:root.dark .card-title {
  color: #f1f5f9;
}

.card-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

:root.dark .card-subtitle {
  color: #94a3b8;
}

/* 卡片统计 */
.card-stats {
  margin-top: auto;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
}

:root.dark .card-stats {
  background: rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

:root.dark .stat-label {
  color: #94a3b8;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

:root.dark .stat-value {
  color: #f1f5f9;
}

/* 卡片底部 */
.card-footer {
  margin-top: auto;
}

.warning-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 500;
}

.warning-note.error {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

/* 悬停效果层 */
.card-hover-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 20px;
  z-index: 1;
}

.sync-card:hover:not(.disabled) .card-hover-layer {
  opacity: 1;
}

.hover-text {
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 同步历史区域 */
.sync-history-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

:root.dark .section-title {
  color: #f1f5f9;
}

.history-list {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

:root.dark .history-list {
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.history-item {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

:root.dark .history-item {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

:root.dark .history-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.history-item.success {
  border-left: 4px solid #10b981;
}

.history-item.error {
  border-left: 4px solid #dc2626;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.history-type {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.history-item.success .history-type {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.history-item.error .history-type {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.history-time {
  font-size: 11px;
  color: #64748b;
}

:root.dark .history-time {
  color: #94a3b8;
}

.history-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-message {
  font-size: 13px;
  color: #1e293b;
  flex: 1;
}

:root.dark .history-message {
  color: #f1f5f9;
}

.history-count {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

:root.dark .history-count {
  color: #94a3b8;
}

/* 底部区域 */
.footer-section {
  margin-top: 30px;
  text-align: center;
  padding: 0 16px;
}

.footer-text {
  padding: 16px 0;
}

.gradient-text {
  font-size: 16px;
  font-weight: 300;
  font-style: italic;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientFlow 4s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 加载遮罩层 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.loading-content {
  background: white;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  min-width: 200px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

:root.dark .loading-content {
  background: #1e293b;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

:root.dark .spinner {
  border-color: #334155;
  border-top-color: #3b82f6;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #4b5563;
  margin: 0;
  font-weight: 500;
}

:root.dark .loading-text {
  color: #d1d5db;
}

/* 确认对话框 */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  background: white;
  border-radius: 20px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: dialogSlideIn 0.3s ease-out;
}

:root.dark .confirm-dialog {
  background: #1e293b;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  text-align: center;
}

:root.dark .dialog-title {
  color: #f1f5f9;
}

.dialog-message {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
  line-height: 1.5;
  text-align: center;
}

:root.dark .dialog-message {
  color: #94a3b8;
}

.dialog-actions {
  display: flex;
  gap: 12px;
}

.dialog-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dialog-btn.cancel {
  background: #f3f4f6;
  color: #374151;
}

:root.dark .dialog-btn.cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
}

.dialog-btn.cancel:hover {
  background: #e5e7eb;
}

:root.dark .dialog-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dialog-btn.confirm {
  background: #3b82f6;
  color: white;
}

.dialog-btn.confirm.danger {
  background: #dc2626;
}

.dialog-btn.confirm:hover {
  background: #2563eb;
}

.dialog-btn.confirm.danger:hover {
  background: #b91c1c;
}

/* 滚动条样式 */
.content-scroll::-webkit-scrollbar {
  width: 6px;
}

.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

:root.dark .content-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 12px 80px;
  }
  
  .sync-card {
    padding: 20px;
    min-height: 240px;
  }
  
  .card-header {
    gap: 12px;
  }
  
  .card-icon {
    width: 48px;
    height: 48px;
  }
  
  .card-title {
    font-size: 18px;
  }
  
  .sync-content {
    padding: 12px 0 100px;
  }
  
  .footer-section {
    margin-top: 20px;
  }
  
  .footer-text {
    padding: 12px 0;
  }
  
  .gradient-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .sync-content {
    padding: 10px 0 100px;
  }
  
  .sync-card {
    padding: 16px;
    min-height: 220px;
  }
  
  .card-stats {
    padding: 12px;
  }
  
  .footer-section {
    margin-top: 16px;
  }
  
  .footer-text {
    padding: 10px 0;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .scrollable-content-section {
    height: calc(100vh - 60px);
  }
  
  .sync-content {
    padding: 10px 0 80px;
  }
  
  .sync-card {
    min-height: 200px;
  }
}
</style>
