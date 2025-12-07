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

const userCardStyles = computed(() => {
  switch (authStore.userType) {
    case 'vip':
      return {
        cardBg: 'linear-gradient(135deg, rgba(255, 223, 0, 0.1), rgba(255, 165, 0, 0.15))',
        nameGradient: 'linear-gradient(135deg, #FFD700, #FFA500, #FFCC33)',
        badgeBg: 'linear-gradient(135deg, #ffd700, #ff8c00)',
        badgeColor: '#5d3d00',
        borderColor: 'rgba(255, 192, 0, 0.5)',
      }
    case 'subscribed':
      return {
        cardBg: 'linear-gradient(135deg, rgba(240, 240, 240, 0.1), rgba(200, 200, 200, 0.15))',
        nameGradient: 'linear-gradient(135deg, #a0a0a0, #c0c0c0, #f0f0f0)',
        badgeBg: '#e0e0e0',
        badgeColor: '#424242',
        borderColor: 'rgba(200, 200, 200, 0.5)',
      }
    case 'free':
    default:
      return {
        cardBg: 'var(--bg-card)',
        nameGradient: 'var(--text-primary)',
        badgeBg: '#bbb',
        badgeColor: '#555',
        borderColor: 'var(--border-color)',
      }
  }
})

const fundAPIs = [
  { name: '天天基金', value: 'eastmoney', color: '#8B7B66', bgColor: 'rgba(139, 123, 102, 0.15)' },
  { name: '同花顺', value: 'ths', color: '#8B7D7B', bgColor: 'rgba(139, 125, 123, 0.15)' },
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

          <section class="section-container user-section">
            <div class="user-card-wrapper">
              <div class="user-card-compact">
                <div
                  class="user-badge"
                  :style="{
                    'background': userCardStyles.badgeBg,
                    'color': userCardStyles.badgeColor
                  }"
                >
                  {{ userTypeDisplay }}
                </div>

                <div class="user-info-detail-compact">
                  <div class="avatar-box">
                    <span class="avatar-char">{{ displayName.charAt(0) }}</span>
                  </div>
                  <div class="name-status">
                    <p
                      class="user-display-name"
                      :style="{
                        'background': authStore.userType !== 'free' ? userCardStyles.nameGradient : 'unset',
                        'font-style': authStore.userType !== 'free' ? 'italic' : 'normal',
                        'color': authStore.userType === 'free' ? 'var(--text-primary)' : 'transparent',
                        '-webkit-background-clip': authStore.userType !== 'free' ? 'text' : 'unset',
                        '-webkit-text-fill-color': authStore.userType !== 'free' ? 'transparent' : 'unset',
                        'background-clip': authStore.userType !== 'free' ? 'text' : 'unset',
                      }"
                    >
                      {{ displayName }}
                    </p>
                    <p class="user-email">{{ authStore.currentUser?.email || '未设置邮箱' }}</p>
                  </div>
                </div>

                <div class="user-card-buttons">
                  <a href="#" class="upgrade-link" @click.prevent="handleUpgrade">升级</a>
                  <button class="action-btn-secondary logout-btn-compact" @click="handleLogout">退出</button>
                </div>
              </div>
            </div>
          </section>

          <section class="section-container features-section">
            <div class="features-grid">
              <div class="feature-item cloud-sync-card" :class="{ 'vip-restricted': authStore.userType === 'free' }" @click="handleFeature('CloudSync')">
                <div class="feature-icon">☁️</div>
                <div class="feature-content">
                  <div class="feature-title">
                    云端同步
                    <span v-if="authStore.userType === 'free'" class="vip-tag">VIP</span>
                  </div>
                  <div class="feature-desc">持仓数据上传与下载</div>
                </div>
              </div>
              
              <div class="feature-item manage-holdings-card" @click="handleFeature('ManageHoldings')">
                <div class="feature-icon">📁</div>
                <div class="feature-content">
                  <div class="feature-title">管理持仓</div>
                  <div class="feature-desc">新增、编辑或清空持仓数据</div>
                </div>
              </div>
              
              <div class="feature-item api-log-card" @click="handleFeature('APILog')">
                <div class="feature-icon">📜</div>
                <div class="feature-content">
                  <div class="feature-title">日志查询</div>
                  <div class="feature-desc">API请求与响应日志</div>
                </div>
              </div>
              
              <div class="feature-item api-selector-card">
                <div class="feature-icon">🌐</div>
                <div class="feature-content">
                  <div class="feature-title">数据接口</div>
                  <div class="feature-desc">切换基金数据源</div>
                  <div class="setting-control">
                    <div class="api-selector-mini">
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
                            'border-color': api.color,
                            'color': selectedAPI === api.value ? '#fff' : api.color,
                            'background': selectedAPI === api.value ? api.color : api.bgColor
                          }"
                          @click.stop="selectedAPI = api.value; if (!(api.value !== 'eastmoney' && authStore.userType === 'free')) handleAPIChange()"
                          :disabled="api.value !== 'eastmoney' && authStore.userType === 'free'"
                          :title="api.name + (api.value !== 'eastmoney' && authStore.userType === 'free' ? ' (VIP)' : '')"
                        >
                          {{ api.name }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="feature-item privacy-card">
                <div class="feature-icon">🔒</div>
                <div class="feature-content">
                  <div class="feature-title">隐私模式</div>
                  <div class="feature-desc">客户信息脱敏保护</div>
                  <div class="setting-control">
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
                          <span class="toggle-text">{{ dataStore.isPrivacyMode ? '关闭' : '开启' }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="feature-item about-card" @click="handleFeature('About')">
                <div class="feature-icon">ℹ️</div>
                <div class="feature-content">
                  <div class="feature-title">关于 CFMS</div>
                  <div class="feature-desc">程序版本信息和说明</div>
                </div>
              </div>
            </div>
          </section>

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
.config-view {
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.config-scroll-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  padding-top: 0;
  overflow-x: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.config-scroll-area::-webkit-scrollbar {
  display: none;
}

.config-content-wrapper {
  max-width: 768px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
}

.config-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: calc(80px + 16px);
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
}

.section-container {
  width: 100%;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
}

.user-card-wrapper {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
}

.user-card-compact {
  position: relative;
  padding: 16px;
  background: #F5F1E9;
  border-radius: 16px;
  border: 1px solid #E8E2D5;
  box-shadow: 0 4px 12px rgba(139, 123, 102, 0.08);
  transition: all 0.3s ease;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}

.user-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  line-height: 1;
}

.user-info-detail-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  margin-bottom: 12px;
  padding-right: 40px;
}

.avatar-box {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8B7B66, #A89A86);
  border-radius: 50%;
  font-weight: 600;
  color: white;
  font-size: 18px;
  -webkit-tap-highlight-color: transparent;
}

.name-status {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  min-width: 0;
}

.user-display-name {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #5D5349;
  -webkit-user-select: none;
  user-select: none;
}

.user-email {
  font-size: 11px;
  color: #8B7B66;
  margin: 0;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  -webkit-user-select: none;
  user-select: none;
}

.user-card-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-top: 10px;
  border-top: 1px solid #E8E2D5;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
}

.upgrade-link {
  color: #8B7B66;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(139, 123, 102, 0.1);
  transition: all 0.2s ease;
  box-sizing: border-box;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  display: inline-block;
}

.upgrade-link:hover {
  background: rgba(139, 123, 102, 0.2);
  text-decoration: none;
}

.logout-btn-compact {
  background: rgba(139, 123, 102, 0.1);
  border: 1px solid #E8E2D5;
  color: #8B7B66;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  appearance: none;
}

.logout-btn-compact:hover {
  background: rgba(139, 123, 102, 0.2);
  border-color: #8B7B66;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
}

.feature-item {
  border-radius: 14px;
  border: 1px solid;
  padding: 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 90px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.feature-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.feature-item.vip-restricted {
  opacity: 0.8;
  cursor: default;
}

.cloud-sync-card {
  background: rgba(139, 123, 102, 0.15);
  border-color: rgba(139, 123, 102, 0.3);
}

.manage-holdings-card {
  background: rgba(139, 125, 123, 0.15);
  border-color: rgba(139, 125, 123, 0.3);
}

.api-log-card {
  background: rgba(139, 139, 123, 0.15);
  border-color: rgba(139, 139, 123, 0.3);
}

.api-selector-card {
  background: rgba(123, 139, 139, 0.15);
  border-color: rgba(123, 139, 139, 0.3);
}

.privacy-card {
  background: rgba(123, 123, 139, 0.15);
  border-color: rgba(123, 123, 139, 0.3);
}

.about-card {
  background: rgba(139, 123, 139, 0.15);
  border-color: rgba(139, 123, 139, 0.3);
}

.feature-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feature-title {
  font-size: 14px;
  font-weight: 700;
  color: #5D5349;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.2;
}

.vip-tag {
  font-size: 10px;
  font-weight: 700;
  background: linear-gradient(135deg, #8B7B66, #A89A86);
  color: white;
  padding: 1px 4px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feature-desc {
  font-size: 11px;
  color: #8B7B66;
  line-height: 1.3;
  margin-bottom: 4px;
}

.setting-control {
  margin-top: 4px;
}

.api-selector-mini {
  width: 100%;
}

.api-options {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.api-options::-webkit-scrollbar {
  display: none;
}

.api-option {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  white-space: nowrap;
  min-width: 40px;
  text-align: center;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  appearance: none;
}

.api-option:hover:not(.disabled):not(.active) {
  opacity: 0.8;
  transform: translateY(-1px);
}

.api-option.active {
  cursor: default;
}

.api-option.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.privacy-toggle {
  width: 100%;
}

.toggle-switch {
  display: inline-block;
}

.toggle-slider {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 26px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(139, 123, 102, 0.3);
  -webkit-tap-highlight-color: transparent;
}

.toggle-switch input:checked + .toggle-slider {
  background: #8B7B66;
  border-color: #8B7B66;
}

.toggle-text {
  font-size: 11px;
  font-weight: 600;
  color: #5D5349;
  transition: all 0.3s ease;
}

.toggle-switch input:checked + .toggle-slider .toggle-text {
  color: white;
}

@media (prefers-color-scheme: dark) {
  .dark-mode .user-card-compact {
    background: rgba(45, 45, 45, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .dark-mode .user-display-name {
    color: #E8E2D5;
  }
  
  .dark-mode .user-email {
    color: #B0A89A;
  }
  
  .dark-mode .feature-item {
    background: rgba(60, 60, 60, 0.6);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .dark-mode .feature-title {
    color: #E8E2D5;
  }
  
  .dark-mode .feature-desc {
    color: #B0A89A;
  }
  
  .dark-mode .upgrade-link,
  .dark-mode .logout-btn-compact {
    color: #B0A89A;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .dark-mode .feature-icon {
    background: rgba(255, 255, 255, 0.1);
  }
}

@media (max-width: 768px) {
  .config-content {
    padding: 12px;
    gap: 12px;
    padding-bottom: calc(60px + 12px);
  }
  
  .features-grid {
    gap: 10px;
  }
  
  .feature-item {
    padding: 12px;
    min-height: 85px;
  }
  
  .user-card-compact {
    padding: 14px;
    min-height: 95px;
  }
  
  .avatar-box {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .user-display-name {
    font-size: 15px;
  }
  
  .user-badge {
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    font-size: 11px;
  }
  
  .user-info-detail-compact {
    padding-right: 35px;
  }
  
  .feature-icon {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }
  
  .feature-title {
    font-size: 13px;
  }
  
  .feature-desc {
    font-size: 10px;
  }
  
  .api-option {
    padding: 3px 6px;
    font-size: 9px;
    min-width: 36px;
  }
  
  .toggle-slider {
    width: 56px;
    height: 24px;
  }
  
  .toggle-text {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .config-content {
    gap: 10px;
  }
  
  .features-grid {
    gap: 8px;
  }
  
  .feature-item {
    padding: 10px;
    min-height: 80px;
    gap: 10px;
  }
  
  .feature-icon {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
  
  .user-card-compact {
    min-height: 90px;
  }
  
  .user-badge {
    width: 28px;
    height: 28px;
    font-size: 10px;
    top: 8px;
    right: 8px;
  }
  
  .user-info-detail-compact {
    padding-right: 30px;
  }
  
  .avatar-box {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
  
  .user-display-name {
    font-size: 14px;
  }
  
  .user-email {
    font-size: 10px;
  }
  
  .upgrade-link, .logout-btn-compact {
    padding: 5px 8px;
    font-size: 11px;
  }
  
  @media (max-width: 360px) {
    .features-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    
    .config-content {
      padding: 10px;
    }
  }
}

.config-view {
  position: relative;
  z-index: 1;
}

.api-options {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

@media (hover: none) and (pointer: coarse) {
  .feature-item:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  .api-option:active:not(.disabled):not(.active) {
    transform: scale(0.95);
  }
  
  .toggle-slider:active {
    transform: scale(0.95);
  }
  
  * {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  
  input, textarea {
    -webkit-user-select: text;
    user-select: text;
  }
}

@media (display-mode: standalone) {
  .config-content {
    padding-bottom: calc(80px + env(safe-area-inset-bottom) + 16px);
  }
  
  .user-card-compact {
    border-radius: 16px;
  }
  
  .feature-item {
    border-radius: 14px;
  }
}
</style>
