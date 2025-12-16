<!-- ActivationView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import CustomNavbar from '../components/layout/NavBar.vue'

const router = useRouter()
const authStore = useAuthStore()
const dataStore = useDataStore()

// 状态管理
const redemptionCode = ref('')
const isLoading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error' | 'info' | 'warning'>('info')
const showSuccessAnimation = ref(false)

// 动画状态
const animationStates = ref({
  input: { opacity: 0, y: 20 },
  button: { opacity: 0, y: 10 },
  features: { opacity: 0, y: 10 }
})

// 功能列表
const vipFeatures = [
  '收益报告查看、导出',
  '数据库备份、下载',
  '解锁用户、产品上限',
  '优先体验其他新功能'
]

// 处理兑换码输入
const handleCodeInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.toUpperCase()
  
  // 只允许字母和数字，最多8位
  value = value.replace(/[^A-Z0-9]/g, '')
  if (value.length > 8) {
    value = value.substring(0, 8)
  }
  
  redemptionCode.value = value
}

// 显示消息
const showMessage = (msg: string, type: 'success' | 'error' | 'info' | 'warning') => {
  message.value = msg
  messageType.value = type
  
  // 3秒后自动清除消息
  setTimeout(() => {
    if (message.value === msg) {
      message.value = ''
    }
  }, 3000)
}

// 验证兑换码格式
const isValidCode = computed(() => {
  return redemptionCode.value.length === 8 && /^[A-Z0-9]+$/.test(redemptionCode.value)
})

// 获取认证token
const getAuthToken = () => {
  return authStore.token || localStorage.getItem('auth_token') || ''
}

// 获取API基础URL - 更新为新的域名
const getBaseURL = () => {
  return import.meta.env.PROD
    ? 'https://cfms.crnas.uk/api'
    : '/api'
}

// 执行兑换
const redeemCode = async () => {
  if (!isValidCode.value || isLoading.value) return
  
  // 收起键盘
  const activeElement = document.activeElement as HTMLElement
  if (activeElement && activeElement.blur) {
    activeElement.blur()
  }
  
  isLoading.value = true
  message.value = ''
  
  try {
    // 记录开始兑换
    dataStore.safeAddLog(`开始兑换激活码: ${redemptionCode.value}`, 'info', false)
    
    // 第一步：验证兑换码
    const validateResponse = await validateRedemptionCode()
    
    if (!validateResponse.success) {
      showMessage(validateResponse.message || '兑换码验证失败', 'error')
      dataStore.safeAddLog(`兑换码验证失败: ${validateResponse.message}`, 'error', false)
      return
    }
    
    // 第二步：执行兑换
    const redeemResponse = await redeemRedemptionCode()
    
    if (!redeemResponse.success) {
      showMessage(redeemResponse.message || '兑换失败', 'error')
      dataStore.safeAddLog(`兑换失败: ${redeemResponse.message}`, 'error', false)
      return
    }
    
    // 兑换成功，提示重新登录
    showMessage('兑换成功，请重新登录', 'success')
    dataStore.safeAddLog(`权益兑换成功: ${redeemResponse.message}`, 'success', false)
    
    // 更新用户信息
    if (redeemResponse.userInfo) {
      await updateUserInfo(redeemResponse.userInfo)
    }
    
    // 显示成功动画
    showSuccessAnimation.value = true
    
    // 2秒后返回
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '未知错误'
    showMessage(`兑换失败: ${errorMsg}`, 'error')
    dataStore.safeAddLog(`兑换过程异常: ${errorMsg}`, 'error', false)
  } finally {
    isLoading.value = false
  }
}

// 验证兑换码API
const validateRedemptionCode = async (): Promise<{
  success: boolean;
  message?: string;
  codeInfo?: any
}> => {
  try {
    const token = getAuthToken()
    const baseURL = getBaseURL()
    
    const response = await fetch(`${baseURL}/validate_redemption_code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        redemption_code: redemptionCode.value.trim()
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      return {
        success: true,
        message: data.message || '兑换码有效',
        codeInfo: data.code_info
      }
    } else {
      return {
        success: false,
        message: data.error || '兑换码无效'
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '网络连接失败'
    }
  }
}

// 兑换API
const redeemRedemptionCode = async (): Promise<{
  success: boolean;
  message?: string;
  userInfo?: any
}> => {
  try {
    const token = getAuthToken()
    const baseURL = getBaseURL()
    
    const response = await fetch(`${baseURL}/redeem_code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        redemption_code: redemptionCode.value.trim()
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      return {
        success: true,
        message: data.message || '兑换成功！',
        userInfo: data.user_info
      }
    } else {
      return {
        success: false,
        message: data.error || '兑换失败'
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '网络连接失败'
    }
  }
}

// 更新用户信息
const updateUserInfo = async (userInfo: any) => {
  try {
    dataStore.safeAddLog('开始更新用户VIP信息', 'info', false)
    
    // 从 localStorage 获取当前用户信息
    const userDataStr = localStorage.getItem('auth_user')
    const token = localStorage.getItem('auth_token')
    
    if (userDataStr && token) {
      try {
        const currentUser = JSON.parse(userDataStr)
        
        // 更新用户信息 - 根据后端返回的user_info字段
        const updatedUser = {
          ...currentUser,
          user_type: userInfo.user_type || 'free',
          has_full_access: userInfo.has_full_access || false,
          ...(userInfo.subscription_start && { subscription_start: userInfo.subscription_start }),
          ...(userInfo.subscription_end && { subscription_end: userInfo.subscription_end })
        }
        
        // 保存回 localStorage
        localStorage.setItem('auth_user', JSON.stringify(updatedUser))
        
        // 更新 authStore 中的用户信息
        if (authStore.currentUser) {
          authStore.currentUser = {
            ...authStore.currentUser,
            user_type: userInfo.user_type || 'free',
            ...(userInfo.subscription_start && { subscription_start: userInfo.subscription_start }),
            ...(userInfo.subscription_end && { subscription_end: userInfo.subscription_end })
          }
        }
        
        // 如果用户类型变为vip或subscribed，更新has_full_access
        if (userInfo.user_type === 'vip' || userInfo.user_type === 'subscribed') {
          localStorage.setItem('has_full_access', 'true')
          if (authStore.currentUser) {
            authStore.currentUser.has_full_access = true
          }
        }
        
        // 触发用户信息更新事件
        window.dispatchEvent(new CustomEvent('user-updated', {
          detail: { user: updatedUser }
        }))
        
        dataStore.safeAddLog(`用户类型更新为: ${userInfo.user_type || 'free'}`, 'success', false)
      } catch (parseError) {
        dataStore.safeAddLog(`解析用户数据失败: ${parseError}`, 'error', false)
      }
    }
  } catch (error) {
    dataStore.safeAddLog(`用户信息更新失败: ${error}`, 'error', false)
  }
}

// 开始动画
const startAnimations = () => {
  setTimeout(() => {
    animationStates.value.input = { opacity: 1, y: 0 }
  }, 300)
  
  setTimeout(() => {
    animationStates.value.button = { opacity: 1, y: 0 }
  }, 500)
  
  setTimeout(() => {
    animationStates.value.features = { opacity: 1, y: 0 }
  }, 700)
}

// 成功动画组件
const SuccessAnimation = {
  template: `
    <div class="success-animation">
      <div class="overlay"></div>
      <div class="animation-content">
        <div class="checkmark-circle">
          <div class="checkmark-stem"></div>
          <div class="checkmark-kick"></div>
        </div>
        <div class="success-text">兑换成功!</div>
        <div class="success-subtext">正在更新用户信息...</div>
      </div>
    </div>
  `
}

// 生命周期
onMounted(() => {
  startAnimations()
  dataStore.safeAddLog('访问激活码兑换页面', 'info', false)
})
</script>

<template>
  <div class="activation-view">
    <!-- 导航栏 -->
    <CustomNavbar
      title="权益兑换"
      backText="返回"
      :shadow="false"
    />
    
    <!-- 分隔符 - 类似 ManageHoldingsView -->
    <div class="fixed-top-section">
      <div class="top-container">
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
    
    <!-- 成功动画 -->
    <component
      v-if="showSuccessAnimation"
      :is="SuccessAnimation"
    />
    
    <!-- 内容区域 -->
    <div class="scrollable-content-section">
      <div class="config-content-wrapper">
        <div class="config-content">
          
          <!-- 兑换码输入卡片 -->
          <div
            class="function-card code-input-card"
            :style="{
              opacity: animationStates.input.opacity,
              transform: `translateY(${animationStates.input.y}px)`,
              transition: 'all 0.6s ease-out 0.1s'
            }"
          >
            <div class="card-content">
              <div class="card-header">
                <div class="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 2L19 4M11 12L13 14M5 20L3 22M3 10L7 6M21 10L17 6M3 14L7 18M21 14L17 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="card-title-wrapper">
                  <h4 class="card-title">尊享权益兑换</h4>
                </div>
              </div>
              
              <div class="input-container">
                <input
                  type="text"
                  v-model="redemptionCode"
                  @input="handleCodeInput"
                  placeholder="请输入兑换码"
                  maxlength="8"
                  class="code-input"
                  :disabled="isLoading"
                />
                <div class="input-length">{{ redemptionCode.length }}/8</div>
              </div>
              
              <!-- 消息显示 -->
              <div
                v-if="message"
                class="message-container"
                :class="[`message-${messageType}`]"
              >
                <div class="message-icon">
                  <svg v-if="messageType === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="message-text">{{ message }}</span>
              </div>
            </div>
          </div>
          
          <!-- 兑换按钮 -->
          <button
            class="redeem-button"
            @click="redeemCode"
            :disabled="!isValidCode || isLoading"
            :class="{
              'button-enabled': isValidCode && !isLoading,
              'button-disabled': !isValidCode || isLoading,
              'button-loading': isLoading
            }"
            :style="{
              opacity: animationStates.button.opacity,
              transform: `translateY(${animationStates.button.y}px)`,
              transition: 'all 0.6s ease-out 0.2s'
            }"
          >
            <div v-if="isLoading" class="loading-spinner">
              <div class="spinner"></div>
              <span>兑换中...</span>
            </div>
            <span v-else>立即兑换</span>
          </button>
          
          <!-- VIP特权列表 -->
          <div
            class="function-card vip-features-card"
            :style="{
              opacity: animationStates.features.opacity,
              transform: `translateY(${animationStates.features.y}px)`,
              transition: 'all 0.6s ease-out 0.3s'
            }"
          >
            <div class="card-content">
              <div class="card-header">
                <div class="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19.4 15C19.8 14.1 20 13.1 20 12C20 10.9 19.8 9.9 19.4 9M4.6 15C4.2 14.1 4 13.1 4 12C4 10.9 4.2 9.9 4.6 9M16.2 7.8C16.8 8.4 17.2 9.2 17.4 10M6.6 14C6.8 14.8 7.2 15.6 7.8 16.2M7.8 7.8C7.2 8.4 6.8 9.2 6.6 10M16.2 16.2C15.6 16.8 14.8 17.2 14 17.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="card-title-wrapper">
                  <h4 class="card-title">尊享特权</h4>
                </div>
              </div>
              
              <div class="features-list">
                <div
                  v-for="(feature, index) in vipFeatures"
                  :key="index"
                  class="feature-item"
                >
                  <div class="feature-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <span class="feature-text">{{ feature }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 兑换码类型说明 -->
          <div class="function-card code-types-card">
            <div class="card-content">
              <div class="card-header">
                <div class="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L12 15L21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C13.6569 2 15.1569 2.67331 16.364 3.81802" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="card-title-wrapper">
                  <h4 class="card-title">兑换码类型说明</h4>
                </div>
              </div>
              
              <div class="code-types-list">
                <div class="code-type-item">
                  <div class="code-type-badge trial">体验</div>
                  <div class="code-type-info">
                    <div class="code-type-title">7天体验兑换码</div>
                    <div class="code-type-desc">激活后享受7天VIP完整功能体验</div>
                  </div>
                </div>
                <div class="code-type-item">
                  <div class="code-type-badge vip">VIP</div>
                  <div class="code-type-info">
                    <div class="code-type-title">永久VIP兑换码</div>
                    <div class="code-type-desc">激活后永久享受所有VIP特权</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activation-view {
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

:root.dark .activation-view {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

/* 固定顶部部分 - 类似 ManageHoldingsView 样式 */
.fixed-top-section {
  flex-shrink: 0;
  z-index: 90; /* 低于 NavBar */
  padding-top: 0;
  background: transparent; /* 无底色 */
}

.top-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 分隔符样式 - 与 ManageHoldingsView 一致 */
.stylish-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 0 12px;
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

.scrollable-content-section {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-top: 4px;
}

.config-content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

.config-content {
  padding: 0 0 120px;
}

/* 卡片通用样式 */
.function-card {
  border-radius: 20px;
  border: none;
  padding: 16px;
  cursor: default;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

:root.dark .function-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
}

.code-input-card {
  background: linear-gradient(135deg, rgba(118, 75, 162, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%);
}

.code-input-card .card-icon svg {
  color: #764ba2;
}

.vip-features-card {
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.15) 0%, rgba(250, 112, 154, 0.15) 100%);
}

.vip-features-card .card-icon svg {
  color: #43e97b;
}

.code-types-card {
  background: linear-gradient(135deg, rgba(250, 112, 154, 0.15) 0%, rgba(254, 209, 64, 0.15) 100%);
}

.code-types-card .card-icon svg {
  color: #fa709a;
}

:root.dark .code-input-card {
  background: linear-gradient(135deg, rgba(118, 75, 162, 0.25) 0%, rgba(245, 87, 108, 0.25) 100%);
}

:root.dark .vip-features-card {
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.25) 0%, rgba(250, 112, 154, 0.25) 100%);
}

:root.dark .code-types-card {
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
  margin-bottom: 16px;
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

/* 输入框样式 */
.input-container {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 0 16px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

:root.dark .input-container {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.input-container:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
}

.code-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 18px 0;
  font-size: 18px;
  color: #333;
  letter-spacing: 2px;
  text-transform: uppercase;
  outline: none;
  font-family: monospace;
  font-weight: 500;
  width: 100%;
}

:root.dark .code-input {
  color: #e5e7eb;
}

.code-input::placeholder {
  color: rgba(0, 0, 0, 0.4);
  letter-spacing: normal;
  font-weight: normal;
  text-transform: none;
}

:root.dark .code-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input-length {
  color: rgba(0, 0, 0, 0.5);
  font-size: 14px;
  font-weight: 500;
  margin-left: 12px;
  min-width: 40px;
  text-align: right;
  flex-shrink: 0;
}

:root.dark .input-length {
  color: rgba(255, 255, 255, 0.5);
}

/* 消息显示 */
.message-container {
  padding: 12px 16px;
  border-radius: 12px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-success {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.message-error {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.message-info {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.message-warning {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.message-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.message-text {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  word-break: break-word;
}

/* 兑换按钮 */
.redeem-button {
  width: 100%;
  padding: 18px;
  border-radius: 16px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:root.dark .redeem-button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.redeem-button:disabled {
  cursor: not-allowed;
}

.redeem-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.redeem-button:not(:disabled):active {
  transform: translateY(0);
}

.button-enabled {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.button-enabled:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.button-disabled {
  background: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.4);
}

:root.dark .button-disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
}

.button-loading {
  background: rgba(0, 0, 0, 0.1);
  color: transparent;
}

:root.dark .button-loading {
  background: rgba(255, 255, 255, 0.1);
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* VIP特权列表 */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.feature-icon {
  width: 24px;
  height: 24px;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #10b981;
  padding: 4px;
  margin-top: 1px;
}

.feature-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  flex: 1;
}

:root.dark .feature-text {
  color: #e5e7eb;
}

/* 兑换码类型说明 */
.code-types-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.code-type-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.code-type-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  color: white;
  min-width: 60px;
  text-align: center;
  flex-shrink: 0;
}

.code-type-badge.trial {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.code-type-badge.vip {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
}

.code-type-info {
  flex: 1;
  min-width: 0;
}

.code-type-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

:root.dark .code-type-title {
  color: #e5e7eb;
}

.code-type-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

:root.dark .code-type-desc {
  color: #9ca3af;
}

/* 成功动画样式 */
.success-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.animation-content {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 30px;
  border-radius: 24px;
  text-align: center;
  animation: scaleIn 0.5s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  z-index: 1001;
  max-width: 90%;
  width: 320px;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.checkmark-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  margin: 0 auto 20px;
  position: relative;
  animation: circleAnimation 0.6s ease-out;
}

@keyframes circleAnimation {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.checkmark-stem {
  position: absolute;
  width: 5px;
  height: 30px;
  background: #10b981;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  transform-origin: bottom;
  animation: stemAnimation 0.3s ease-out 0.3s both;
}

.checkmark-kick {
  position: absolute;
  width: 12px;
  height: 5px;
  background: #10b981;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  transform-origin: left;
  animation: kickAnimation 0.3s ease-out 0.6s both;
}

@keyframes stemAnimation {
  from {
    height: 0;
  }
  to {
    height: 30px;
  }
}

@keyframes kickAnimation {
  from {
    width: 0;
  }
  to {
    width: 12px;
  }
}

.success-text {
  font-size: 24px;
  font-weight: 700;
  color: white;
  animation: textFadeIn 0.5s ease-out 0.8s both;
  margin-bottom: 8px;
}

.success-subtext {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  animation: textFadeIn 0.5s ease-out 1s both;
}

@keyframes textFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .config-content-wrapper {
    padding: 0 12px;
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
  
  .code-input {
    font-size: 16px;
    padding: 16px 0;
  }
  
  .redeem-button {
    padding: 16px;
    font-size: 15px;
    margin-bottom: 20px;
  }
  
  .feature-text {
    font-size: 13px;
  }
  
  .code-type-item {
    padding: 10px;
    gap: 10px;
  }
  
  .code-type-badge {
    min-width: 50px;
    padding: 5px 10px;
    font-size: 12px;
  }
  
  .code-type-title {
    font-size: 13px;
  }
  
  .code-type-desc {
    font-size: 12px;
  }
  
  .config-content {
    padding: 0 0 100px;
  }
  
  .animation-content {
    padding: 30px 20px;
    margin: 0 16px;
    width: 280px;
  }
  
  .checkmark-circle {
    width: 70px;
    height: 70px;
  }
  
  .success-text {
    font-size: 22px;
  }
  
  .top-container {
    padding: 0 12px;
  }
}

@media (max-width: 480px) {
  .config-content {
    padding: 0 0 100px;
  }
  
  .function-card {
    padding: 12px;
    min-height: 96px;
  }
  
  .card-header {
    gap: 10px;
    margin-bottom: 14px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .code-input {
    font-size: 15px;
    padding: 14px 0;
  }
  
  .input-length {
    font-size: 13px;
    min-width: 36px;
  }
  
  .message-container {
    padding: 10px 14px;
  }
  
  .message-text {
    font-size: 13px;
  }
  
  .redeem-button {
    padding: 15px;
    font-size: 14px;
  }
  
  .features-list {
    gap: 12px;
  }
  
  .feature-icon {
    width: 22px;
    height: 22px;
  }
  
  .feature-text {
    font-size: 12px;
  }
  
  .code-type-badge {
    min-width: 45px;
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .code-type-title {
    font-size: 12px;
  }
  
  .code-type-desc {
    font-size: 11px;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .scrollable-content-section {
    height: calc(100vh - 60px);
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
  
  .redeem-button:not(:disabled):active {
    transform: scale(0.98);
  }
}

@media (display-mode: standalone) {
  .config-content {
    padding-bottom: calc(120px + env(safe-area-inset-bottom));
  }
}
</style>
