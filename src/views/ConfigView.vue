<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import CustomCard from '@/components/common/CustomCard.vue'
import ToastMessage from '@/components/common/ToastMessage.vue'

const router = useRouter()
const authStore = useAuthStore()
const dataStore = useDataStore()

const privacyKey = ref(0)
const refreshKey = ref(0)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

let isPrivacyInitialized = false

const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
  
  dataStore.addLog(`系统提示: ${message}`, type)
}

watch(() => dataStore.isPrivacyMode, (newValue, oldValue) => {
  console.log(`隐私模式变化: ${oldValue} -> ${newValue}`)
  
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
  
  if (isPrivacyInitialized && oldValue !== newValue) {
    showNotification(`隐私模式已${newValue ? '开启' : '关闭'}`, 'info')
  }
  
  const event = new CustomEvent('privacy-mode-changed-global', {
    detail: {
      enabled: newValue,
      oldValue: oldValue,
      timestamp: Date.now(),
      source: 'ConfigView',
      forceUpdate: true
    },
    bubbles: true,
    composed: true
  })
  
  window.dispatchEvent(event)
  document.dispatchEvent(event)
  
  const legacyEvent = new CustomEvent('privacy-mode-changed', {
    detail: {
      enabled: newValue,
      oldValue: oldValue
    },
    bubbles: true,
    composed: true
  })
  
  window.dispatchEvent(legacyEvent)
  document.dispatchEvent(legacyEvent)
  
  nextTick(() => {
    window.dispatchEvent(new CustomEvent('force-privacy-sync'))
  })
})

const displayName = computed(() => {
  return authStore.displayName || '用户'
})

const userTypeDisplay = computed(() => {
  switch (authStore.userType) {
    case 'vip': return 'VIP'
    case 'subscribed': return '体验'
    case 'free':
    default: return '基础'
  }
})

// 根据用户类型获取对应的颜色配置
const getUserColors = () => {
  switch (authStore.userType) {
    case 'vip':
      return {
        cardBg: 'rgba(255, 253, 231, 0.8)',
        textColor: '#B8860B',
        iconColor: '#B8860B'
      }
    case 'subscribed':
      return {
        cardBg: 'rgba(245, 245, 245, 0.9)',
        textColor: '#606060',
        iconColor: '#606060'
      }
    case 'free':
    default:
      return {
        cardBg: 'rgba(0, 123, 255, 0.1)',
        textColor: '#007bff',
        iconColor: '#007bff'
      }
  }
}

const fundAPIs = [
  { name: '天天基金', value: 'eastmoney', color: '#007bff' },
  { name: '同花顺', value: 'ths', color: '#28a745' },
]
const selectedAPI = ref(dataStore.userPreferences.selectedFundAPI || 'eastmoney')

const handleAPIChange = () => {
  const oldAPI = dataStore.userPreferences.selectedFundAPI
  dataStore.updateUserPreferences({ selectedFundAPI: selectedAPI.value })
  
  dataStore.addLog(`数据接口已从${oldAPI}切换至: ${selectedAPI.value}`, 'info')
  
  showNotification(`数据接口已切换至: ${fundAPIs.find(a => a.value === selectedAPI.value)?.name || selectedAPI.value}`, 'success')
}

const handleFeature = (featureName: string) => {
  switch (featureName) {
    case 'About':
      router.push('/about')
      break
    case 'ManageHoldings':
      router.push('/holdings/manage')
      break
    case 'APILog':
      router.push('/logs')
      break
    case 'CloudSync':
      if (authStore.userType === 'free') {
        showNotification('该功能需要升级到VIP用户', 'warning')
      } else {
        showNotification('云端同步功能正在开发中...', 'info')
      }
      break
    default:
      showNotification(`功能 ${featureName} 正在开发中...`, 'info')
  }
  
  dataStore.addLog(`用户操作: 点击${featureName}功能`, 'info')
}

const handleUpgrade = (e: Event) => {
  e.preventDefault()
  showNotification('正在跳转到升级页面...', 'info')
  dataStore.addLog('用户点击升级按钮', 'info')
}

const handleLogout = async () => {
  try {
    dataStore.addLog('用户执行退出登录操作', 'info')
    showNotification('您已成功退出登录', 'success')
    
    setTimeout(() => {
      authStore.logout()
      dataStore.addLog('用户已成功退出登录', 'success')
    }, 800)
    
  } catch (error) {
    console.error('退出登录失败:', error)
    dataStore.addLog('退出登录失败: ' + (error as Error).message, 'error')
    showNotification('退出登录失败，请重试', 'error')
  }
}

const togglePrivacyMode = () => {
  const newValue = !dataStore.isPrivacyMode
  const oldValue = dataStore.isPrivacyMode
  console.log(`切换隐私模式: ${oldValue} -> ${newValue}`)
  
  dataStore.updateUserPreferences({ isPrivacyMode: newValue })
  
  localStorage.setItem('privacy_mode', newValue.toString())
  
  dataStore.isPrivacyMode = newValue
  
  dataStore.addLog(`隐私模式已${newValue ? '开启' : '关闭'}`, 'info')
  
  nextTick(() => {
    privacyKey.value = Date.now()
    refreshKey.value = Date.now()
  })
}

onMounted(() => {
  dataStore.loadData()
  
  const disableZoom = () => {
    let metaViewport = document.querySelector('meta[name="viewport"]')
    if (!metaViewport) {
      metaViewport = document.createElement('meta')
      metaViewport.setAttribute('name', 'viewport')
      document.head.appendChild(metaViewport)
    }
    metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
    
    let lastTouchEnd = 0
    document.addEventListener('touchstart', (event) => {
      if (event.touches.length > 1) {
        event.preventDefault()
      }
    }, { passive: false })
    
    document.addEventListener('touchend', (event) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }, false)
    
    document.addEventListener('gesturestart', (event) => {
      event.preventDefault()
    })
    
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey === true || event.metaKey === true) &&
          (event.keyCode === 107 || event.keyCode === 109 || event.keyCode === 187 || event.keyCode === 189)) {
        event.preventDefault()
      }
    })
  }
  
  disableZoom()
  
  nextTick(() => {
    const savedPrivacyMode = localStorage.getItem('privacy_mode')
    
    if (savedPrivacyMode !== null) {
      const isPrivacyEnabled = savedPrivacyMode === 'true'
      dataStore.updateUserPreferences({ isPrivacyMode: isPrivacyEnabled })
      dataStore.isPrivacyMode = isPrivacyEnabled
    } else {
      dataStore.updateUserPreferences({ isPrivacyMode: true })
      dataStore.isPrivacyMode = true
      localStorage.setItem('privacy_mode', 'true')
    }
    
    setTimeout(() => {
      isPrivacyInitialized = true
    }, 100)
  })
  
  dataStore.addLog('用户访问配置页面', 'info')
  
  window.addEventListener('force-privacy-sync', handleForcePrivacySync)
})

const handleForcePrivacySync = () => {
  const privacyMode = dataStore.isPrivacyMode
  console.log('强制同步隐私模式:', privacyMode)
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
}

onUnmounted(() => {
  window.removeEventListener('force-privacy-sync', handleForcePrivacySync)
})
</script>

<template>
  <div class="config-view" :key="`${refreshKey}-${privacyKey}`">
    <div class="config-scroll-area">
      <div class="config-content-wrapper">
        <div class="config-content">
          
          <!-- 用户信息卡片 -->
          <div class="user-info-section">
            <div class="user-card-wrapper">
              <div 
                class="user-info-card"
                :style="{
                  backgroundColor: getUserColors().cardBg,
                  borderColor: authStore.userType === 'vip' ? 'rgba(255, 215, 0, 0.3)' : 
                               authStore.userType === 'subscribed' ? 'rgba(224, 224, 224, 0.3)' : 
                               'rgba(0, 123, 255, 0.2)'
                }"
              >
                <!-- 用户类型徽章 -->
                <div 
                  class="user-type-ribbon"
                  :class="authStore.userType"
                  :style="{
                    background: authStore.userType === 'vip' ? 
                              'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)' :
                              authStore.userType === 'subscribed' ? 
                              'linear-gradient(135deg, #E0E0E0, #B0B0B0, #909090)' :
                              'linear-gradient(135deg, #9E9E9E, #757575, #616161)',
                    color: authStore.userType === 'subscribed' ? '#424242' : 'white'
                  }"
                >
                  {{ userTypeDisplay }}
                </div>

                <div class="user-content">
                  <div class="avatar-section">
                    <div 
                      class="avatar-icon"
                      :style="{ color: getUserColors().iconColor }"
                    >
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                        <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </div>
                    <div class="user-details">
                      <h3 
                        class="user-name"
                        :style="{ color: getUserColors().textColor }"
                      >
                        {{ displayName }}
                      </h3>
                      <p class="user-email">{{ authStore.currentUser?.email || '未设置邮箱' }}</p>
                      <div class="user-type-info" v-if="authStore.userType === 'subscribed' || authStore.userType === 'vip'">
                        <span 
                          class="type-tag"
                          :style="{
                            backgroundColor: authStore.userType === 'vip' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                            color: authStore.userType === 'vip' ? '#B8860B' : '#f57c00'
                          }"
                        >
                          {{ authStore.userType === 'vip' ? '永久有效' : '体验用户' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="user-actions">
                    <button 
                      class="upgrade-btn"
                      @click="handleUpgrade"
                      v-if="authStore.userType !== 'vip'"
                      :style="{
                        backgroundColor: getUserColors().textColor + '1A',
                        color: getUserColors().textColor
                      }"
                    >
                      升级
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      class="logout-btn"
                      @click="handleLogout"
                      :style="{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                      }"
                    >
                      退出
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 功能菜单区域 -->
          <div class="functions-section">
            <h3 class="section-title">功能菜单</h3>
            <div class="function-grid">
              <!-- 云端同步 -->
              <div 
                class="function-card"
                :class="{ 'disabled': authStore.userType === 'free' }"
                @click="handleFeature('CloudSync')"
              >
                <div class="card-icon" style="background: rgba(147, 51, 234, 0.1);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 19L12 13L18 19" stroke="#9333EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 13V1" stroke="#9333EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 12L8 16" stroke="#9333EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M20 12L16 16" stroke="#9333EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="card-content">
                  <h4 class="card-title">
                    云端同步
                    <span v-if="authStore.userType === 'free'" class="vip-badge">VIP</span>
                  </h4>
                  <p class="card-desc">上传或下载持仓数据到云端</p>
                </div>
              </div>
              
              <!-- 管理持仓 -->
              <div class="function-card" @click="handleFeature('ManageHoldings')">
                <div class="card-icon" style="background: rgba(59, 130, 246, 0.1);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="card-content">
                  <h4 class="card-title">管理持仓</h4>
                  <p class="card-desc">新增、编辑或清空持仓数据</p>
                </div>
              </div>
              
              <!-- 日志查询 -->
              <div class="function-card" @click="handleFeature('APILog')">
                <div class="card-icon" style="background: rgba(6, 182, 212, 0.1);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#06B6D4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="card-content">
                  <h4 class="card-title">日志查询</h4>
                  <p class="card-desc">API请求与响应日志</p>
                </div>
              </div>
              
              <!-- 数据接口 -->
              <div class="function-card">
                <div class="card-icon" style="background: rgba(245, 158, 11, 0.1);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 12L17 12" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 17L12 7" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="10" stroke="#F59E0B" stroke-width="2"/>
                  </svg>
                </div>
                <div class="card-content">
                  <h4 class="card-title">数据接口</h4>
                  <p class="card-desc">选择基金数据源</p>
                  <div class="api-selector">
                    <div class="api-options">
                      <button
                        v-for="api in fundAPIs"
                        :key="api.value"
                        :class="[
                          'api-option',
                          { 'active': selectedAPI === api.value },
                          { 'disabled': api.value !== 'eastmoney' && authStore.userType === 'free' }
                        ]"
                        :style="{
                          borderColor: api.color,
                          color: selectedAPI === api.value ? '#fff' : api.color,
                          backgroundColor: selectedAPI === api.value ? api.color : 'transparent'
                        }"
                        @click.stop="selectedAPI = api.value; if (!(api.value !== 'eastmoney' && authStore.userType === 'free')) handleAPIChange()"
                        :disabled="api.value !== 'eastmoney' && authStore.userType === 'free'"
                        :title="api.name + (api.value !== 'eastmoney' && authStore.userType === 'free' ? ' (VIP)' : '')"
                      >
                        {{ api.name }}
                        <svg v-if="api.value !== 'eastmoney' && authStore.userType === 'free'" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15V12M12 9H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 设置区域 -->
          <div class="settings-section">
            <h3 class="section-title">设置</h3>
            <div class="settings-grid">
              <!-- 隐私模式 -->
              <div class="setting-card">
                <div class="card-icon" style="background: rgba(20, 184, 166, 0.1);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15V17M6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V13C20 12.4696 19.7893 11.9609 19.4142 11.5858C19.0391 11.2107 18.5304 11 18 11H6C5.46957 11 4.96086 11.2107 4.58579 11.5858C4.21071 11.9609 4 12.4696 4 13V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21Z" stroke="#14B8A6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" stroke="#14B8A6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="card-content">
                  <h4 class="card-title">隐私模式</h4>
                  <div class="privacy-toggle">
                    <div class="toggle-switch">
                      <input
                        type="checkbox"
                        :id="'privacy-toggle'"
                        :checked="dataStore.isPrivacyMode"
                        @change="togglePrivacyMode"
                        hidden
                      />
                      <label :for="'privacy-toggle'" class="toggle-slider">
                        <span class="toggle-text">{{ dataStore.isPrivacyMode ? '开启' : '关闭' }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 关于 -->
              <div class="setting-card" @click="handleFeature('About')">
                <div class="card-icon" style="background: rgba(59, 130, 246, 0.1);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 16V12" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="8" r="1" fill="#3B82F6"/>
                  </svg>
                </div>
                <div class="card-content">
                  <h4 class="card-title">关于 CFMS</h4>
                  <p class="card-desc">程序版本信息和说明</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部装饰文本 -->
          <div class="footer-section">
            <div class="footer-text">
              <span class="gradient-text">Happiness around the corner.</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <ToastMessage
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      @update:show="showToast = $event"
    />
  </div>
</template>

<style scoped>
/* 全局样式 - 与SwiftUI风格保持一致 */
.config-view {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
}

.config-scroll-area {
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.config-content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

.config-content {
  padding: 20px 0 100px;
}

/* 用户信息卡片样式 */
.user-info-section {
  margin-bottom: 24px;
}

.user-card-wrapper {
  position: relative;
}

.user-info-card {
  position: relative;
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.user-type-ribbon {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.user-type-ribbon.vip {
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.user-content {
  padding: 20px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.avatar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid currentColor;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.user-email {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px 0;
  opacity: 0.8;
}

.user-type-info {
  display: flex;
  gap: 8px;
}

.type-tag {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.user-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.upgrade-btn, .logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
  -webkit-tap-highlight-color: transparent;
}

.upgrade-btn:hover, .logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.upgrade-btn:active, .logout-btn:active {
  transform: translateY(0);
}

.logout-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  width: 75px;
}

/* 功能区样式 */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 16px;
  letter-spacing: -0.3px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  padding: 0 8px;
}

.function-card {
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.function-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.function-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.function-card.disabled:hover {
  transform: none;
  box-shadow: none;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.card-content {
  min-height: 80px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.vip-badge {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.card-desc {
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.4;
  opacity: 0.8;
}

.api-selector {
  margin-top: 12px;
}

.api-options {
  display: flex;
  gap: 8px;
}

.api-option {
  flex: 1;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 32px;
}

.api-option:hover:not(.disabled):not(.active) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.api-option.active {
  cursor: default;
}

.api-option.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  position: relative;
}

/* 设置区样式 */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 8px;
}

.setting-card {
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.setting-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.privacy-toggle {
  margin-top: 12px;
}

.toggle-switch {
  display: inline-block;
  position: relative;
}

.toggle-slider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 32px;
  background: #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.toggle-switch input:checked + .toggle-slider {
  background: #14b8a6;
}

.toggle-text {
  font-size: 12px;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
}

.toggle-switch input:not(:checked) + .toggle-slider .toggle-text {
  color: #6b7280;
}

/* 底部样式 */
.footer-section {
  margin-top: 40px;
  text-align: center;
  padding: 0 16px;
}

.footer-text {
  padding: 20px 0;
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

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .config-view {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }
  
  .user-info-card,
  .function-card,
  .setting-card {
    background: rgba(30, 30, 46, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .section-title,
  .card-title {
    color: #e5e7eb;
  }
  
  .card-desc,
  .user-email {
    color: #9ca3af;
  }
  
  .avatar-icon {
    background: rgba(45, 45, 65, 0.9);
  }
  
  .user-actions {
    border-top-color: rgba(255, 255, 255, 0.1);
  }
  
  .toggle-slider {
    background: #374151;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .config-content-wrapper {
    padding: 0 12px;
  }
  
  .function-grid,
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .user-name {
    font-size: 18px;
  }
  
  .avatar-icon {
    width: 40px;
    height: 40px;
  }
  
  .card-icon {
    width: 40px;
    height: 40px;
  }
  
  .function-card,
  .setting-card {
    padding: 14px;
  }
  
  .api-options {
    flex-direction: column;
  }
  
  .api-option {
    width: 100%;
  }
  
  .user-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .upgrade-btn,
  .logout-btn {
    width: 100%;
  }
}

/* 小屏幕手机优化 */
@media (max-width: 480px) {
  .config-content {
    padding: 16px 0 80px;
  }
  
  .user-content {
    padding: 16px;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .user-details {
    text-align: center;
  }
  
  .function-card,
  .setting-card {
    padding: 12px;
  }
  
  .card-content {
    min-height: 70px;
  }
}

/* 横屏模式优化 */
@media (orientation: landscape) and (max-height: 500px) {
  .config-scroll-area {
    height: calc(100vh - 60px);
  }
  
  .user-info-card {
    padding: 12px;
  }
  
  .avatar-section {
    margin-bottom: 12px;
  }
  
  .function-card,
  .setting-card {
    min-height: 100px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .function-card:active,
  .setting-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  .api-option:active:not(.disabled):not(.active) {
    transform: scale(0.95);
  }
  
  .toggle-slider:active {
    transform: scale(0.95);
  }
  
  .upgrade-btn:active,
  .logout-btn:active {
    transform: scale(0.95);
  }
}

/* PWA 安装优化 */
@media (display-mode: standalone) {
  .config-content {
    padding-bottom: calc(100px + env(safe-area-inset-bottom));
  }
}
</style>