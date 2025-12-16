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
            <!-- 绶带式用户类型标签 - 右上角 -->
            <div
              class="ribbon-tag-top"
              :class="{
                'ribbon-vip': authStore.userType === 'vip',
                'ribbon-subscribed': authStore.userType === 'subscribed',
                'ribbon-free': authStore.userType === 'free'
              }"
              :style="{ animation: showRibbonAnimation ? 'ribbonGlow 1s ease-in-out' : 'none' }"
              @animationend="ribbonAnimationEnd"
            >
              <span class="ribbon-content">
                {{ userTypeDisplay }}
              </span>
              <div class="ribbon-tail"></div>
            </div>
            
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
                
                <!-- 仅对体验用户显示订阅信息 -->
                <div v-if="authStore.userType === 'subscribed' && subscriptionEndDate" class="subscription-info-section">
                  <div class="subscription-info">
                    <div class="subscription-item">
                      <span class="subscription-label">到期日:</span>
                      <span class="subscription-value">{{ subscriptionEndDate.date }}</span>
                    </div>
                    <div class="subscription-item">
                      <span class="subscription-label">状态:</span>
                      <span class="subscription-status" :class="{ 'expired': subscriptionEndDate.isExpired }">
                        {{ subscriptionEndDate.isExpired ? '已过期' : `剩余${subscriptionEndDate.daysLeft}天` }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="user-info-footer">
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

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import ToastMessage from '../components/common/ToastMessage.vue'

const router = useRouter()
const authStore = useAuthStore()
const dataStore = useDataStore()

// 添加绶带动画控制
const showRibbonAnimation = ref(true)

const ribbonAnimationEnd = () => {
  showRibbonAnimation.value = false
}

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
  
  dataStore.safeAddLog(`系统提示: ${message}`, type, false)
}

const subscriptionEndDate = computed(() => {
  if (authStore.currentUser?.subscription_end) {
    const endDate = new Date(authStore.currentUser.subscription_end)
    const now = new Date()
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft > 0) {
      return {
        date: endDate.toLocaleDateString('zh-CN').replace(/\//g, '/'),
        daysLeft: daysLeft,
        isExpired: false
      }
    } else {
      return {
        date: endDate.toLocaleDateString('zh-CN').replace(/\//g, '/'),
        daysLeft: 0,
        isExpired: true
      }
    }
  }
  return null
})

const userTypeDisplay = computed(() => {
  switch (authStore.userType) {
    case 'vip': return 'VIP用户'
    case 'subscribed':
      if (subscriptionEndDate.value?.isExpired) {
        return '体验用户(已过期)'
      } else {
        return '体验用户'
      }
    case 'free':
    default: return '基础用户'
  }
})

watch(() => dataStore.isPrivacyMode, (newValue, oldValue) => {
  if (isPrivacyInitialized && oldValue !== newValue) {
    showNotification(`隐私模式已${newValue ? '开启' : '关闭'}`, 'info')
  }
  
  const event = new CustomEvent('privacy-mode-changed-global', {
    detail: {
      enabled: newValue,
      oldValue: oldValue,
      timestamp: Date.now(),
      source: 'ConfigView'
    },
    bubbles: true,
    composed: true
  })
  
  window.dispatchEvent(event)
  
  const legacyEvent = new CustomEvent('privacy-mode-changed', {
    detail: {
      enabled: newValue,
      oldValue: oldValue
    },
    bubbles: true,
    composed: true
  })
  
  window.dispatchEvent(legacyEvent)
  
  nextTick(() => {
    window.dispatchEvent(new CustomEvent('force-privacy-sync'))
  })
})

const displayName = computed(() => {
  return authStore.displayName || '用户'
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

const themeModes = [
  { name: '系统', value: 'system', icon: 'system', color: '#6b7280' },
  { name: '浅色', value: 'light', icon: 'light', color: '#f59e0b' },
  { name: '深色', value: 'dark', icon: 'dark', color: '#3b82f6' }
]

const selectedTheme = ref(dataStore.userPreferences.themeMode || 'system')

let isThemeChanging = false

const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
  if (isThemeChanging) {
    console.warn('主题切换正在进行中，跳过本次调用')
    return
  }
  
  const oldMode = dataStore.userPreferences.themeMode
  if (oldMode === mode) return
  
  isThemeChanging = true
  
  try {
    selectedTheme.value = mode
    
    dataStore.updateThemeMode(mode)
    
    const modeName = mode === 'system' ? '系统' : mode === 'light' ? '浅色' : '深色'
    showNotification(`主题已切换为: ${modeName}`, 'success')
    
  } finally {
    setTimeout(() => {
      isThemeChanging = false
    }, 300)
  }
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
  dataStore.safeAddLog(`用户操作: 点击${featureName}功能`, 'info', false)
}

const handleUpgrade = () => {
  router.push('/activation')
  dataStore.safeAddLog('用户点击升级按钮，跳转到激活页面', 'info', false)
}

const handleLogout = async () => {
  try {
    dataStore.safeAddLog('用户执行退出登录操作', 'info', false)
    showNotification('您已成功退出登录', 'success')
    setTimeout(() => {
      authStore.logout()
      dataStore.safeAddLog('用户已成功退出登录', 'success', false)
    }, 800)
  } catch (error) {
    console.error('退出登录失败:', error)
    dataStore.safeAddLog('退出登录失败: ' + (error as Error).message, 'error', false)
    showNotification('退出登录失败，请重试', 'error')
  }
}

const togglePrivacyMode = (value: boolean) => {
  if (dataStore.isPrivacyMode === value) return
  const newValue = value
  dataStore.updateUserPreferences({ isPrivacyMode: newValue })
  localStorage.setItem('privacy_mode', newValue.toString())
  dataStore.safeAddLog(`隐私模式已${newValue ? '开启' : '关闭'}`, 'info', false)
  
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
  // 每次进入页面时重置绶带动画
  showRibbonAnimation.value = true
  
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
  
  dataStore.safeAddLog('用户访问配置页面', 'info', false)
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
  position: sticky;
  top: 0;
  z-index: 50;
  background: transparent;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
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
  overflow: visible;
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
  background: transparent;
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

/* 订阅信息区域 */
.subscription-info-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 120px;
}

.subscription-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subscription-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.subscription-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

:root.dark .subscription-label {
  color: #9ca3af;
}

.subscription-value {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

:root.dark .subscription-value {
  color: #e5e7eb;
}

.subscription-status {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.subscription-status.expired {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
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
  justify-content: flex-end;
  flex-wrap: nowrap;
  gap: 8px;
  margin-top: 4px;
  width: 100%;
}

/* 绶带顶部样式 */
.ribbon-tag-top {
  position: absolute;
  top: 12px;
  right: -8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 18px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: white;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  border-radius: 4px 0 0 4px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 10;
}

.ribbon-tag-top::before {
  content: '';
  position: absolute;
  top: 0;
  left: -8px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 15px 0 15px 8px;
  border-color: transparent transparent transparent currentColor;
}

.ribbon-tag-top::after {
  content: '';
  position: absolute;
  top: 0;
  right: -8px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 15px 8px 15px 0;
  border-color: transparent currentColor transparent transparent;
}

.ribbon-vip {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-left: 2px solid #FF8C00;
}

.ribbon-vip::before {
  border-left-color: #FFD700;
}

.ribbon-vip::after {
  border-right-color: #FFD700;
}

.ribbon-subscribed {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  border-left: 2px solid #1B5E20;
}

.ribbon-subscribed::before {
  border-left-color: #4CAF50;
}

.ribbon-subscribed::after {
  border-right-color: #4CAF50;
}

.ribbon-free {
  background: linear-gradient(135deg, #2196F3 0%, #0D47A1 100%);
  border-left: 2px solid #1565C0;
}

.ribbon-free::before {
  border-left-color: #2196F3;
}

.ribbon-free::after {
  border-right-color: #2196F3;
}

.ribbon-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px;
}

.ribbon-tail {
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 0 6px 6px;
  border-color: transparent transparent transparent rgba(0, 0, 0, 0.3);
}

@keyframes ribbonGlow {
  0% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
    transform: translateX(10px) scale(1);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
    transform: translateX(0) scale(1.05);
  }
  70% {
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
  }
  100% {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
    transform: translateX(0) scale(1);
  }
}

.ribbon-vip {
  animation: ribbonGlow 1s ease-in-out;
}

.ribbon-subscribed {
  animation: ribbonGlow 1s ease-in-out;
}

.ribbon-free {
  animation: ribbonGlow 1s ease-in-out;
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
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
}

.cloud-sync-card .card-icon svg {
  color: #667eea;
}

.manage-holdings-card {
  background: linear-gradient(135deg, rgba(118, 75, 162, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%);
}

.manage-holdings-card .card-icon svg {
  color: #764ba2;
}

.privacy-card {
  background: linear-gradient(135deg, rgba(245, 87, 108, 0.15) 0%, rgba(79, 172, 254, 0.15) 100%);
}

.privacy-card .card-icon svg {
  color: #f5576c;
}

.theme-card {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(67, 233, 123, 0.15) 100%);
}

.theme-card .card-icon svg {
  color: #4facfe;
}

.log-card {
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.15) 0%, rgba(250, 112, 154, 0.15) 100%);
}

.log-card .card-icon svg {
  color: #43e97b;
}

.about-card {
  background: linear-gradient(135deg, rgba(250, 112, 154, 0.15) 0%, rgba(254, 209, 64, 0.15) 100%);
}

.about-card .card-icon svg {
  color: #fa709a;
}

:root.dark .cloud-sync-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%);
}

:root.dark .manage-holdings-card {
  background: linear-gradient(135deg, rgba(118, 75, 162, 0.25) 0%, rgba(245, 87, 108, 0.25) 100%);
}

:root.dark .privacy-card {
  background: linear-gradient(135deg, rgba(245, 87, 108, 0.25) 0%, rgba(79, 172, 254, 0.25) 100%);
}

:root.dark .theme-card {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.25) 0%, rgba(67, 233, 123, 0.25) 100%);
}

:root.dark .log-card {
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.25) 0%, rgba(250, 112, 154, 0.25) 100%);
}

:root.dark .about-card {
  background: linear-gradient(135deg, rgba(250, 112, 154, 0.25) 0%, rgba(254, 209, 64, 0.25) 100%);
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
  
  .subscription-info-section {
    min-width: 100px;
  }
  
  .subscription-label {
    font-size: 10px;
  }
  
  .subscription-value {
    font-size: 11px;
  }
  
  .subscription-status {
    font-size: 10px;
    padding: 1px 5px;
  }
  
  .user-info-footer {
    justify-content: space-between;
    gap: 8px;
    margin-top: 0;
  }
  
  .ribbon-tag-top {
    top: 8px;
    right: -6px;
    height: 26px;
    padding: 0 14px;
    font-size: 11px;
  }
  
  .ribbon-tag-top::before {
    border-width: 13px 0 13px 6px;
    left: -6px;
  }
  
  .ribbon-tag-top::after {
    border-width: 13px 6px 13px 0;
    right: -6px;
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
  
  .privacy-options,
  .theme-options {
    flex-direction: row;
    gap: 6px;
  }
  
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
  
  .subscription-info-section {
    min-width: 90px;
  }
  
  .subscription-label {
    font-size: 9px;
  }
  
  .subscription-value {
    font-size: 10px;
  }
  
  .subscription-status {
    font-size: 9px;
    padding: 1px 4px;
  }
  
  .ribbon-tag-top {
    top: 6px;
    right: -5px;
    height: 24px;
    padding: 0 12px;
    font-size: 10px;
  }
  
  .ribbon-tag-top::before {
    border-width: 12px 0 12px 5px;
    left: -5px;
  }
  
  .ribbon-tag-top::after {
    border-width: 12px 5px 12px 0;
    right: -5px;
  }
  
  .function-card {
    padding: 12px;
    min-height: 96px;
  }
  
  .card-header {
    gap: 10px;
    margin-bottom: 8px;
  }
  
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
