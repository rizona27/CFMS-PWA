<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import ToastMessage from '../components/common/ToastMessage.vue'

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

const getUserColors = () => {
  switch (authStore.userType) {
    case 'vip':
      return {
        cardBg: 'linear-gradient(135deg, rgba(255, 253, 231, 0.95) 0%, rgba(255, 248, 200, 0.95) 100%)',
        textColor: '#B8860B',
        iconColor: '#B8860B'
      }
    case 'subscribed':
      return {
        cardBg: 'linear-gradient(135deg, rgba(245, 245, 245, 0.95) 0%, rgba(235, 235, 235, 0.95) 100%)',
        textColor: '#606060',
        iconColor: '#606060'
      }
    case 'free':
    default:
      return {
        cardBg: 'linear-gradient(135deg, rgba(240, 248, 255, 0.95) 0%, rgba(225, 240, 255, 0.95) 100%)',
        textColor: '#007bff',
        iconColor: '#007bff'
      }
  }
}

const fundAPIs = [
  { name: '天天基金', value: 'eastmoney', color: '#007bff' },
  { name: '同花顺', value: 'ths', color: '#dc3545' },
]
const selectedAPI = ref(dataStore.userPreferences.selectedFundAPI || 'eastmoney')

const themeModes = [
  { name: '系统', value: 'system', icon: 'system', color: '#6b7280' },
  { name: '浅色', value: 'light', icon: 'light', color: '#f59e0b' },
  { name: '深色', value: 'dark', icon: 'dark', color: '#3b82f6' }
]

const selectedTheme = ref(dataStore.userPreferences.themeMode || 'system')

const handleAPIChange = () => {
  const oldAPI = dataStore.userPreferences.selectedFundAPI
  dataStore.updateUserPreferences({ selectedFundAPI: selectedAPI.value })
  dataStore.addLog(`数据接口已从${oldAPI}切换至: ${selectedAPI.value}`, 'info')
  showNotification(`数据接口已切换至: ${fundAPIs.find(a => a.value === selectedAPI.value)?.name || selectedAPI.value}`, 'success')
}

const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
  const oldMode = dataStore.userPreferences.themeMode
  if (oldMode === mode) return
  
  dataStore.updateThemeMode(mode)
  selectedTheme.value = mode
  
  const modeName = mode === 'system' ? '系统' : mode === 'light' ? '浅色' : '深色'
  showNotification(`主题已切换为: ${modeName}`, 'success')
  
  const event = new CustomEvent('theme-changed', {
    detail: {
      mode,
      oldMode,
      timestamp: Date.now()
    },
    bubbles: true,
    composed: true
  })
  window.dispatchEvent(event)
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

const togglePrivacyMode = (value: boolean) => {
  if (dataStore.isPrivacyMode === value) return
  const newValue = value
  dataStore.isPrivacyMode = newValue
  dataStore.updateUserPreferences({ isPrivacyMode: newValue })
  localStorage.setItem('privacy_mode', newValue.toString())
  dataStore.addLog(`隐私模式已${newValue ? '开启' : '关闭'}`, 'info')
  
  const event = new CustomEvent('privacy-mode-changed-global', {
    detail: {
      enabled: newValue,
      timestamp: Date.now(),
      source: 'toggle-switch'
    },
    bubbles: true,
    composed: true
  })
  window.dispatchEvent(event)
}

onMounted(() => {
  dataStore.loadData()
  selectedTheme.value = dataStore.userPreferences.themeMode
  
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
  privacyKey.value = Date.now()
}

onUnmounted(() => {
  window.removeEventListener('force-privacy-sync', handleForcePrivacySync)
})
</script>

<template>
  <div class="config-view">
    <div class="fixed-top-section">
      <div class="user-info-container">
        <div class="user-card-wrapper">
          <div
            class="user-info-card"
            :style="{
              background: getUserColors().cardBg,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05)'
            }"
          >
            <div class="user-content">
              <div class="user-header-row">
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
                    <p class="user-email" v-if="authStore.currentUser?.email">{{ authStore.currentUser.email }}</p>
                  </div>
                </div>
                
                <div class="user-header-right">
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
                </div>
              </div>
              
              <div class="user-info-footer">
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
              </div>
            </div>
          </div>
        </div>
        
        <div class="stylish-divider">
          <div class="divider-line"></div>
          <div class="divider-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
              <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
              <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
              <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
            </svg>
          </div>
          <div class="divider-line"></div>
        </div>
      </div>
    </div>
    
    <div class="scrollable-content-section">
      <div class="config-content-wrapper">
        <div class="config-content">
          <div class="functions-section">
            <div class="function-grid">
              
              <div
                class="function-card cloud-sync-card"
                :class="{ 'disabled': authStore.userType === 'free' }"
                @click="handleFeature('CloudSync')"
              >
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <transition name="icon-fade" mode="out-in">
                        <svg v-if="authStore.userType === 'free'" key="cloud-locked" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 10C19.5304 10 20.0391 10.2107 20.4142 10.5858C20.7893 10.9609 21 11.4696 21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H13C12.4696 21 11.9609 20.7893 11.5858 20.4142C11.2107 20.0391 11 19.5304 11 19V12C11 11.4696 11.2107 10.9609 11.5858 10.5858C11.9609 10.2107 12.4696 10 13 10H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M13 10V7C13 5.34315 14.3431 4 16 4C17.6569 4 19 5.34315 19 7V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M8 17H6C5.20435 17 4.44129 16.6839 3.87868 16.1213C3.31607 15.5587 3 14.7956 3 14C3 13.2044 3.31607 12.4413 3.87868 11.8787C4.44129 11.3161 5.20435 11 6 11C6.06 11 6.12 11.01 6.18 11.01C6.27318 9.53982 6.94165 8.16912 8.04683 7.17849C9.15201 6.18787 10.6094 5.65345 12.115 5.68652C13.6206 5.7196 15.0592 6.31761 16.127 7.355" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg v-else key="cloud-vip" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M6 19L12 13L18 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M12 13V1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M4 12L8 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M20 12L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </transition>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">
                        云端同步
                        <span v-if="authStore.userType === 'free'" class="vip-badge">VIP</span>
                      </h4>
                    </div>
                  </div>
                  <p class="card-subtitle-corner">数据上传/下载</p>
                </div>
              </div>
              
              <div class="function-card manage-holdings-card" @click="handleFeature('ManageHoldings')">
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">管理持仓</h4>
                    </div>
                  </div>
                  <p class="card-subtitle-corner">用户数据编辑</p>
                </div>
              </div>
              
              <div class="function-card privacy-card">
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <transition name="icon-fade" mode="out-in">
                        <svg v-if="dataStore.isPrivacyMode" key="locked" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                           <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg v-else key="unlocked" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                          <path d="M7 11V7a5 5 0 019.9-1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </transition>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">隐私模式</h4>
                    </div>
                  </div>
                  <div class="privacy-toggle">
                    <div class="privacy-options">
                      <button
                        class="privacy-option"
                        :class="{ 'active': dataStore.isPrivacyMode === true }"
                        @click="togglePrivacyMode(true)"
                      >
                        开启
                      </button>
                      <button
                        class="privacy-option"
                        :class="{ 'active': dataStore.isPrivacyMode === false }"
                        @click="togglePrivacyMode(false)"
                      >
                        关闭
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="function-card theme-card">
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <transition name="icon-fade" mode="out-in">
                        <svg v-if="selectedTheme === 'system'" key="system" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 16v4" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <svg v-else-if="selectedTheme === 'light'" key="light" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <svg v-else key="dark" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </transition>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">主题设置</h4>
                    </div>
                  </div>
                  <div class="theme-toggle">
                    <div class="theme-options">
                      <button
                        v-for="mode in themeModes"
                        :key="mode.value"
                        class="theme-option"
                        :class="{ 'active': selectedTheme === mode.value }"
                        @click="handleThemeChange(mode.value as any)"
                      >
                        {{ mode.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="function-card api-card">
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                       <transition name="icon-fade" mode="out-in">
                          <svg v-if="selectedAPI === 'eastmoney'" key="eastmoney" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M17 6H23V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <svg v-else key="ths" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 20V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18 20V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 20V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                       </transition>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">数据接口</h4>
                    </div>
                  </div>
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

               <div class="function-card about-card" @click="handleFeature('About')">
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="8" r="1" fill="currentColor"/>
                      </svg>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">关于 CFMS</h4>
                    </div>
                  </div>
                  <p class="card-subtitle-corner">版本及说明</p>
                </div>
              </div>
              
              <div class="function-card log-card" @click="handleFeature('APILog')">
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">日志查询</h4>
                    </div>
                  </div>
                   <p class="card-subtitle-corner">记录系统与操作</p>
                </div>
              </div>

            </div>
          </div>

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
    />
  </div>
</template>

<style scoped>
.config-view {
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

:root.dark .config-view {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.fixed-top-section {
  flex-shrink: 0;
  z-index: 100;
  padding-top: env(safe-area-inset-top, 0px);
}

.scrollable-content-section {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-top: 4px;
}

.config-content-wrapper,
.user-info-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

.config-content {
  padding: 0 0 120px;
}

.user-card-wrapper {
  position: relative;
}

.user-info-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  margin: 12px 0 12px;
}

:root.dark .user-info-card {
  background: rgba(30, 30, 46, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stylish-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 0 8px;
  opacity: 0.6;
}

.divider-line {
  height: 1px;
  width: 40px;
  background: linear-gradient(90deg, transparent, currentColor);
}

.divider-line:last-child {
  background: linear-gradient(90deg, currentColor, transparent);
}

.divider-icon {
  color: currentColor;
  display: flex;
  align-items: center;
}

:root.dark .stylish-divider {
  color: rgba(255, 255, 255, 0.3);
}

.stylish-divider {
  color: rgba(0, 0, 0, 0.2);
}

.user-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.user-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-type-ribbon {
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  margin-left: auto;
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
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  margin-right: 12px;
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
  flex-shrink: 0;
}

:root.dark .avatar-icon {
  background: rgba(45, 45, 65, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.user-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
  line-height: 1.2;
}

:root.dark .user-name {
  color: #e5e7eb;
}

.user-email {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px 0;
  opacity: 0.8;
  line-height: 1.3;
}

:root.dark .user-email {
  color: #9ca3af;
}

.user-info-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 8px;
  margin-top: 4px;
  width: 100%;
}

.type-tag {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 28px;
  -webkit-tap-highlight-color: transparent;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  white-space: nowrap;
  margin-left: auto;
}

:root.dark .logout-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.logout-btn:active {
  transform: translateY(0);
}

.user-actions {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  margin-top: 12px;
}

:root.dark .user-actions {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.upgrade-btn {
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
  min-height: 38px;
  -webkit-tap-highlight-color: transparent;
  width: 100%;
}

.upgrade-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.upgrade-btn:active {
  transform: translateY(0);
}

.functions-section {
  margin-bottom: 20px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.function-card {
  border-radius: 20px;
  border: none;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05);
}

:root.dark .function-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
}

.function-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

:root.dark .function-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.function-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.function-card.disabled:hover {
  transform: none;
  box-shadow: none;
}

.cloud-sync-card {
  background: rgba(147, 51, 234, 0.1);
}

.cloud-sync-card .card-icon svg {
  color: #9333EA;
}

.manage-holdings-card {
  background: rgba(59, 130, 246, 0.1);
}

.manage-holdings-card .card-icon svg {
  color: #3B82F6;
}

.privacy-card {
  background: rgba(20, 184, 166, 0.1);
}

.privacy-card .card-icon svg {
  color: #14B8A6;
}

.theme-card {
  background: rgba(139, 92, 246, 0.1);
}

.theme-card .card-icon svg {
  color: #8B5CF6;
}

.api-card {
  background: rgba(245, 158, 11, 0.1);
}

.api-card .card-icon svg {
  color: #F59E0B;
}

.log-card {
  background: rgba(6, 182, 212, 0.1);
}

.log-card .card-icon svg {
  color: #06B6D4;
}

.about-card {
  background: rgba(59, 130, 246, 0.1);
}

.about-card .card-icon svg {
  color: #3B82F6;
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.card-title-wrapper {
  flex: 1;
  min-width: 0;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.5);
}

:root.dark .card-icon {
  background: rgba(255, 255, 255, 0.1);
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

:root.dark .card-title {
  color: #e5e7eb;
}

.card-subtitle-corner {
  font-size: 11px;
  color: #666;
  margin: 0;
  line-height: 1.3;
  opacity: 0.7;
  position: absolute;
  bottom: 12px;
  right: 14px;
  text-align: right;
  font-weight: 500;
}

:root.dark .card-subtitle-corner {
  color: #9ca3af;
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

.api-selector {
  margin-top: auto;
}

.api-options {
  display: flex;
  gap: 8px;
}

.api-option {
  flex: 1;
  padding: 6px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid #F59E0B;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 36px;
  color: #F59E0B;
}

.api-option.active {
  background: #F59E0B;
  color: white;
  cursor: default;
}

.api-option:hover:not(.disabled):not(.active) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:root.dark .api-option:hover:not(.disabled):not(.active) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.api-option.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  position: relative;
}

.privacy-toggle {
  margin-top: auto;
}

.privacy-options {
  display: flex;
  gap: 8px;
}

.privacy-option {
  flex: 1;
  padding: 6px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid #14B8A6;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  color: #14B8A6;
}

.privacy-option.active {
  background: #14B8A6;
  color: white;
  cursor: default;
}

.privacy-option:hover:not(.active) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:root.dark .privacy-option:hover:not(.active) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.theme-toggle {
  margin-top: auto;
}

.theme-options {
  display: flex;
  gap: 8px;
}

.theme-option {
  flex: 1;
  padding: 6px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid #8B5CF6;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  color: #8B5CF6;
}

.theme-option.active {
  background: #8B5CF6;
  color: white;
  cursor: default;
}

.theme-option:hover:not(.active) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:root.dark .theme-option:hover:not(.active) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

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

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@media (max-width: 768px) {
  .config-content-wrapper {
    padding: 0 12px;
  }
  
  .function-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .user-info-card {
    padding: 0;
    margin: 8px 0 8px;
  }
  
  .user-content {
    padding: 16px;
  }
  
  .user-header-row {
    margin-bottom: 10px;
  }
  
  .avatar-section {
    gap: 12px;
    align-items: flex-start;
  }
  
  .avatar-icon {
    width: 42px;
    height: 42px;
    margin-top: 2px;
  }
  
  .user-name {
    font-size: 17px;
    margin-bottom: 2px;
  }
  
  .user-email {
    font-size: 12px;
    margin-bottom: 6px;
  }
  
  .user-type-ribbon {
    font-size: 10px;
    padding: 3px 8px;
  }
  
  .user-info-footer {
    justify-content: space-between;
    gap: 8px;
    margin-top: 0;
  }
  
  .type-tag {
    font-size: 11px;
    padding: 3px 8px;
  }
  
  .logout-btn {
    padding: 3px 10px;
    font-size: 12px;
    min-height: 26px;
  }
  
  .user-actions {
    padding-top: 12px;
    margin-top: 12px;
  }
  
  .upgrade-btn {
    min-height: 36px;
    font-size: 13px;
  }
  
  .function-card {
    padding: 14px;
    min-height: 100px;
  }
  
  .card-icon {
    width: 36px;
    height: 36px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-subtitle-corner {
    font-size: 10px;
    bottom: 10px;
    right: 12px;
  }
  
  .api-options,
  .privacy-options,
  .theme-options {
    flex-direction: row;
    gap: 6px;
  }
  
  .api-option,
  .privacy-option,
  .theme-option {
    padding: 5px 6px;
    font-size: 11px;
    min-height: 32px;
  }
  
  .config-content {
    padding: 0 0 100px;
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
  .config-content {
    padding: 0 0 100px;
  }
  
  .user-content {
    padding: 14px;
  }
  
  .avatar-icon {
    width: 38px;
    height: 38px;
  }
  
  .user-name {
    font-size: 16px;
  }
  
  .user-email {
    font-size: 11px;
  }
  
  .function-card {
    padding: 12px;
    min-height: 96px;
  }
  
  .card-header {
    gap: 10px;
    margin-bottom: 8px;
  }
  
  .api-option,
  .privacy-option,
  .theme-option {
    padding: 4px 5px;
    font-size: 10px;
    min-height: 30px;
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
  
  .user-info-card {
    padding: 0;
  }
  
  .user-content {
    padding: 12px;
  }
  
  .function-card {
    min-height: 80px;
  }
  
  .config-content {
    padding: 0 0 80px;
  }
}

@media (hover: none) and (pointer: coarse) {
  .function-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  .api-option:active:not(.disabled):not(.active),
  .privacy-option:active:not(.active),
  .theme-option:active:not(.active) {
    transform: scale(0.95);
  }
  
  .logout-btn:active,
  .upgrade-btn:active {
    transform: scale(0.95);
  }
}

@media (display-mode: standalone) {
  .config-content {
    padding-bottom: calc(120px + env(safe-area-inset-bottom));
  }
}
</style>
