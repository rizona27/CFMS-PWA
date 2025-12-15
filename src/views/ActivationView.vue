<!-- ActivationView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'

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
  header: { opacity: 0, y: 30 },
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
}

// 清除消息
const clearMessage = () => {
  message.value = ''
}

// 验证兑换码格式
const isValidCode = computed(() => {
  return redemptionCode.value.length === 8 && /^[A-Z0-9]+$/.test(redemptionCode.value)
})

// 获取认证token（从authStore获取）
const getAuthToken = () => {
  return authStore.token || localStorage.getItem('auth_token') || ''
}

// 获取API基础URL（使用与authStore相同的逻辑）
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
  clearMessage()
  
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
    
    // 兑换成功
    showMessage(redeemResponse.message || '兑换成功！', 'success')
    dataStore.safeAddLog(`权益兑换成功: ${redeemResponse.message}`, 'success', false)
    
    // 更新用户信息
    if (redeemResponse.userInfo) {
      await updateUserInfo(redeemResponse.userInfo)
    }
    
    // 显示成功动画
    showSuccessAnimation.value = true
    
    // 2秒后返回
    setTimeout(() => {
      router.back()
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
const validateRedemptionCode = async (): Promise<{ success: boolean; message?: string }> => {
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
      return { success: true }
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
    
    // 更新用户类型
    if (userInfo.user_type) {
      // 从 localStorage 获取当前用户信息
      const userDataStr = localStorage.getItem('auth_user')
      if (userDataStr) {
        try {
          const currentUser = JSON.parse(userDataStr)
          
          // 更新用户信息
          const updatedUser = {
            ...currentUser,
            user_type: userInfo.user_type,
            ...(userInfo.subscription_start && { subscription_start: userInfo.subscription_start }),
            ...(userInfo.subscription_end && { subscription_end: userInfo.subscription_end })
          }
          
          // 保存回 localStorage
          localStorage.setItem('auth_user', JSON.stringify(updatedUser))
          
          // 更新 authStore 中的用户信息
          if (authStore.currentUser) {
            authStore.currentUser = {
              ...authStore.currentUser,
              user_type: userInfo.user_type,
              ...(userInfo.subscription_start && { subscription_start: userInfo.subscription_start }),
              ...(userInfo.subscription_end && { subscription_end: userInfo.subscription_end })
            }
          }
          
          // 触发用户信息更新事件
          window.dispatchEvent(new CustomEvent('user-updated', {
            detail: { user: updatedUser }
          }))
          
          dataStore.safeAddLog(`用户类型更新为: ${userInfo.user_type}`, 'success', false)
        } catch (parseError) {
          dataStore.safeAddLog(`解析用户数据失败: ${parseError}`, 'error', false)
        }
      }
    }
  } catch (error) {
    dataStore.safeAddLog(`用户信息更新失败: ${error}`, 'error', false)
  }
}

// 开始动画
const startAnimations = () => {
  setTimeout(() => {
    animationStates.value.header = { opacity: 1, y: 0 }
  }, 100)
  
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
      </div>
    </div>
  `
}

// 生命周期
onMounted(() => {
  startAnimations()
  dataStore.safeAddLog('访问激活码兑换页面', 'info', false)
})

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="activation-view">
    <!-- 成功动画 -->
    <component
      v-if="showSuccessAnimation"
      :is="SuccessAnimation"
    />
    
    <!-- 头部 -->
    <div class="activation-header">
      <button class="back-button" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="header-title">权益兑换</div>
      <div class="header-placeholder"></div>
    </div>
    
    <!-- 内容区域 -->
    <div class="activation-content">
      <!-- 欢迎区域 -->
      <div
        class="welcome-section"
        :style="{
          opacity: animationStates.header.opacity,
          transform: `translateY(${animationStates.header.y}px)`,
          transition: 'all 0.6s ease-out'
        }"
      >
        <div class="gift-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 12V22H4V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 7H2V12H22V7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 22V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="welcome-title">尊享权益兑换</h1>
        <p class="welcome-subtitle">输入激活码解锁高级功能</p>
      </div>
      
      <!-- 兑换码输入区域 -->
      <div
        class="code-input-section"
        :style="{
          opacity: animationStates.input.opacity,
          transform: `translateY(${animationStates.input.y}px)`,
          transition: 'all 0.6s ease-out 0.1s'
        }"
      >
        <label class="input-label">激活码</label>
        <div class="input-container">
          <div class="input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 2L19 4M11 12L13 14M5 20L3 22M3 10L7 6M21 10L17 6M3 14L7 18M21 14L17 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <input
            type="text"
            v-model="redemptionCode"
            @input="handleCodeInput"
            placeholder="请输入8位激活码"
            maxlength="8"
            class="code-input"
            :disabled="isLoading"
          />
          <div class="input-length">{{ redemptionCode.length }}/8</div>
        </div>
        <div class="input-hint">激活码为8位大写字母和数字</div>
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
        class="vip-features-section"
        :style="{
          opacity: animationStates.features.opacity,
          transform: `translateY(${animationStates.features.y}px)`,
          transition: 'all 0.6s ease-out 0.3s'
        }"
      >
        <h3 class="features-title">尊享特权</h3>
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
      
      <!-- 提示信息 -->
      <div class="hint-section">
        <p class="hint-text">
          💡 提示：激活码通过官方渠道获取，激活后即可享受所有VIP特权
        </p>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

:root.dark .activation-view {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.activation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top) + 16px) 20px 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:root.dark .activation-header {
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.back-button {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.back-button:active {
  transform: translateY(0);
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  letter-spacing: 1px;
}

.header-placeholder {
  width: 44px;
  height: 44px;
}

.activation-content {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.gift-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  font-family: serif;
}

.welcome-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 300;
}

.code-input-section {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.input-container {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 0 16px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.input-container:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
}

.input-icon {
  margin-right: 12px;
  color: white;
  opacity: 0.7;
}

.code-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 18px 0;
  font-size: 18px;
  color: white;
  letter-spacing: 2px;
  text-transform: uppercase;
  outline: none;
  font-family: monospace;
}

.code-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: normal;
}

.input-length {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  margin-left: 12px;
}

.input-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
  padding-left: 4px;
}

.message-container {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
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
}

.message-text {
  font-size: 15px;
  font-weight: 500;
}

.redeem-button {
  width: 100%;
  padding: 20px;
  border-radius: 16px;
  border: none;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  color: white;
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
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.button-enabled:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.button-disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.button-loading {
  background: rgba(255, 255, 255, 0.1);
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
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

.vip-features-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.features-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0 0 20px 0;
  text-align: center;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
}

.feature-text {
  font-size: 15px;
  color: white;
  line-height: 1.5;
  flex: 1;
}

.hint-section {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hint-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.5;
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
  padding: 40px;
  border-radius: 24px;
  text-align: center;
  animation: scaleIn 0.5s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
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
  .activation-content {
    padding: 16px;
  }
  
  .gift-icon {
    width: 80px;
    height: 80px;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .welcome-subtitle {
    font-size: 14px;
  }
  
  .code-input {
    font-size: 16px;
    padding: 16px 0;
  }
  
  .redeem-button {
    padding: 18px;
    font-size: 16px;
  }
  
  .features-title {
    font-size: 18px;
  }
  
  .feature-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .activation-header {
    padding: calc(env(safe-area-inset-top) + 12px) 16px 12px;
  }
  
  .back-button {
    width: 40px;
    height: 40px;
  }
  
  .header-placeholder {
    width: 40px;
    height: 40px;
  }
  
  .gift-icon {
    width: 70px;
    height: 70px;
  }
  
  .welcome-title {
    font-size: 22px;
  }
  
  .vip-features-section {
    padding: 20px;
  }
  
  .animation-content {
    padding: 30px;
    margin: 0 16px;
  }
}

/* 深色模式适配 */
:root.dark .code-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

:root.dark .input-container {
  background: rgba(255, 255, 255, 0.05);
}

:root.dark .vip-features-section {
  background: rgba(255, 255, 255, 0.05);
}

:root.dark .button-enabled {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}
</style>
