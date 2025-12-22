<template>
  <div class="auth-view" :class="themeClass">
    <div class="background-fx">
      <div class="geometric-grid"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
      <div class="gradient-overlay"></div>
    </div>
    
    <div class="auth-scroll-container">
      <div class="auth-container">
        <div class="auth-card fade-in-down">
          <div class="logo-header">
            <h1 class="auth-title">CFMS · 重置密码</h1>
          </div>
          
          <!-- 统一状态提示区域 -->
          <div class="form-error-area-simple">
            <div v-if="globalError" class="error-text-simple">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ globalError }}</span>
            </div>
            <div v-if="globalSuccess" class="success-text-simple">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ globalSuccess }}</span>
            </div>
          </div>
          
          <div v-if="!isValidating && !validationError && !success">
            <div class="auth-form">
              <div class="form-content" style="min-height: 240px">
                <div class="auth-steps-container single-step-active">
                  <div class="auth-step single-step">
                    <div v-if="username" class="user-info">
                      <div class="user-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <div class="user-details">
                        <div class="username">{{ username }}</div>
                        <div class="hint">请输入您的新密码</div>
                      </div>
                    </div>
                    
                    <div class="form-group with-icon password-group" :class="{
                      'has-error': passwordError,
                      'has-success': form.password && !passwordError,
                      'focused': isPasswordFocused
                    }">
                      <div class="icon-container">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <input
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="新密码"
                        required
                        autocomplete="new-password"
                        class="icon-input password-input"
                        maxlength="20"
                        @input="validatePassword"
                        @focus="() => { isPasswordFocused = true; }"
                        @blur="() => { isPasswordFocused = false; }"
                      />
                      <div class="input-actions">
                        <button
                          v-if="form.password"
                          type="button"
                          class="clear-button"
                          @click="form.password = ''; validatePassword()"
                          title="清除"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          class="password-toggle"
                          @click="showPassword = !showPassword"
                          :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                        >
                          <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div class="form-group with-icon password-group" :class="{
                      'has-error': confirmPasswordError,
                      'has-success': form.confirmPassword && !confirmPasswordError,
                      'focused': isConfirmPasswordFocused
                    }">
                      <div class="icon-container">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <input
                        v-model="form.confirmPassword"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        placeholder="确认新密码"
                        required
                        autocomplete="new-password"
                        class="icon-input password-input"
                        maxlength="20"
                        @input="validateConfirmPassword"
                        @focus="() => { isConfirmPasswordFocused = true; }"
                        @blur="() => { isConfirmPasswordFocused = false; }"
                      />
                      <div class="input-actions">
                        <button
                          v-if="form.confirmPassword"
                          type="button"
                          class="clear-button"
                          @click="form.confirmPassword = ''; validateConfirmPassword()"
                          title="清除"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          class="password-toggle"
                          @click="showConfirmPassword = !showConfirmPassword"
                          :aria-label="showConfirmPassword ? '隐藏密码' : '显示密码'"
                        >
                          <svg v-if="showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 统一按钮区域 -->
              <div class="form-actions">
                <div class="button-group two-buttons">
                  <button
                    type="button"
                    class="auth-button back-button"
                    @click="goToAuth"
                  >
                    <span class="button-text">返回</span>
                  </button>
                  <button
                    type="button"
                    class="auth-button gradient-button"
                    @click="handleReset"
                    :disabled="isLoading || !isFormValid"
                  >
                    <span class="button-text">{{ isLoading ? '重置中...' : '重置密码' }}</span>
                    <div v-if="isLoading" class="button-loading">
                      <div class="loading-spinner"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else-if="success" class="success-state">
            <div class="success-text">
              <div class="success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3 class="success-title">密码重置成功</h3>
              <p class="success-message">您的密码已成功重置</p>
              <div class="tips">
                <p>将在 <span class="countdown-number">{{ countdown }}</span> 秒后自动跳转到登录页面</p>
              </div>
            </div>
            
            <div class="form-actions">
              <button class="auth-button gradient-button single-button" @click="goToAuth">
                立即登录
              </button>
            </div>
          </div>
          
          <div v-else-if="validationError" class="error-state">
            <div class="error-text">
              <div class="error-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                  <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <p>{{ validationError }}</p>
            </div>
            
            <div class="form-actions">
              <button class="auth-button gradient-button single-button" @click="goToAuth">
                返回登录页面
              </button>
            </div>
          </div>
          
          <div v-else class="loading-state">
            <div class="loading-spinner large"></div>
            <p>验证重置链接...</p>
          </div>
          
          <div class="auth-footer">
            <p class="version-info">{{ copyrightInfo }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { getCopyright } from '../../Version'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const token = ref('')
const username = ref('')
const isValidating = ref(true)
const validationError = ref('')
const success = ref(false)
const isLoading = ref(false)
const globalError = ref('')
const globalSuccess = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isPasswordFocused = ref(false)
const isConfirmPasswordFocused = ref(false)
const passwordError = ref(false)
const confirmPasswordError = ref(false)
const countdown = ref(5)
const countdownTimer = ref<number | null>(null)

const form = reactive({
  password: '',
  confirmPassword: ''
})

const themeMode = ref('system')
const systemTheme = ref('light')
const themeClass = computed(() => {
  let effectiveTheme = themeMode.value
  if (effectiveTheme === 'system') {
    effectiveTheme = systemTheme.value
  }
  if (effectiveTheme === 'dark') return 'theme-dark'
  if (effectiveTheme === 'light') return 'theme-light'
  return 'theme-system'
})

const isFormValid = computed(() => {
  return form.password.length >= 6 &&
         form.confirmPassword === form.password &&
         !passwordError.value &&
         !confirmPasswordError.value
})

const copyrightInfo = ref(getCopyright())

const validatePassword = () => {
  const password = form.password
  if (!password) {
    passwordError.value = false
  } else if (password.length < 6) {
    passwordError.value = true
  } else if (password.length > 20) {
    passwordError.value = true
  } else {
    passwordError.value = false
  }
  globalError.value = ''
}

const validateConfirmPassword = () => {
  const confirm = form.confirmPassword
  const password = form.password
  if (!confirm) {
    confirmPasswordError.value = false
  } else if (password !== confirm) {
    confirmPasswordError.value = true
  } else {
    confirmPasswordError.value = false
  }
  globalError.value = ''
}

const goToAuth = () => {
  router.push('/auth')
}

const startCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
  
  countdownTimer.value = window.setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--
    } else {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value)
        countdownTimer.value = null
      }
      goToAuth()
    }
  }, 1000)
}

const handleReset = async () => {
  validatePassword()
  validateConfirmPassword()
  
  if (passwordError.value || confirmPasswordError.value) {
    globalError.value = '请填写正确的密码信息'
    return
  }
  
  if (form.password.length < 6) {
    globalError.value = '密码至少需要6个字符'
    return
  }
  
  if (form.password !== form.confirmPassword) {
    globalError.value = '两次输入的密码不一致'
    return
  }
  
  isLoading.value = true
  globalError.value = ''
  globalSuccess.value = ''
  
  try {
    const successResult = await authStore.resetPassword(token.value, form.password)
    
    if (successResult) {
      success.value = true
      globalSuccess.value = '密码重置成功！'
      startCountdown()
    } else {
      globalError.value = authStore.error || '密码重置失败'
    }
  } catch (err: any) {
    globalError.value = err.message || '密码重置失败'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // 检测系统主题
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemTheme.value = darkModeMediaQuery.matches ? 'dark' : 'light'
  
  darkModeMediaQuery.addEventListener('change', (e) => {
    systemTheme.value = e.matches ? 'dark' : 'light'
  })
  
  token.value = route.query.token as string || ''
  
  if (!token.value) {
    validationError.value = '无效的重置链接'
    isValidating.value = false
    return
  }
  
  try {
    const result = await authStore.validateResetToken(token.value)
    
    if (result.valid && result.username) {
      username.value = result.username
      isValidating.value = false
    } else {
      validationError.value = result.message || '重置链接已过期或无效'
      isValidating.value = false
    }
  } catch (err: any) {
    validationError.value = '验证失败：' + (err.message || '未知错误')
    isValidating.value = false
  }
})

onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
})
</script>

<style scoped>
/* 重置密码页面特殊样式 */
.form-content {
  min-height: 240px !important;
}

/* 用户信息卡片 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--primary-light);
  border-radius: var(--border-radius);
  margin-bottom: var(--form-spacing);
  border: 1px solid rgba(99, 102, 241, 0.1);
  backdrop-filter: blur(8px);
}

.user-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50%;
  color: var(--primary-color);
  flex-shrink: 0;
}

.user-icon svg {
  width: 18px;
  height: 18px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.username {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hint {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 成功和错误状态页面 - 重新设计 */
.success-state,
.error-state,
.loading-state {
  text-align: center;
  padding: 32px 20px 24px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.success-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.success-icon {
  margin-bottom: 16px;
  color: var(--success-color);
}

.success-icon svg {
  width: 48px;
  height: 48px;
  display: block;
  margin: 0 auto;
}

.success-title {
  margin: 0 0 8px 0;
  color: var(--success-color);
  font-size: 18px;
  font-weight: 600;
}

.success-message {
  margin: 0 0 20px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.4;
}

.success-text .tips {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-primary);
}

.success-text .tips p {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 6px 0;
}

.countdown-number {
  font-weight: 600;
  color: var(--primary-color);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* 修改后的错误状态样式 - 增加红色图标 */
.error-state {
  text-align: center;
  padding: 32px 20px 24px;
  animation: fadeIn 0.3s ease;
}

.error-icon {
  margin-bottom: 16px;
  color: var(--error-color);
}

.error-icon svg {
  width: 48px;
  height: 48px;
  display: block;
  margin: 0 auto;
}

.error-state .error-text p {
  margin: 0 0 24px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.loading-state .loading-spinner.large {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 2px solid var(--border-primary);
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
}

.loading-state p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 14px;
}

/* 按钮组样式 */
.button-group.two-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
}

.button-group.two-buttons .auth-button {
  flex: 1;
  height: 44px;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .form-content {
    min-height: 220px !important;
  }
  
  .user-info {
    padding: 10px;
    gap: 10px;
  }
  
  .user-icon {
    width: 32px;
    height: 32px;
  }
  
  .user-icon svg {
    width: 16px;
    height: 16px;
  }
  
  .username {
    font-size: 13px;
  }
  
  .hint {
    font-size: 11px;
  }
  
  .success-state,
  .error-state,
  .loading-state {
    padding: 20px 16px 16px;
  }
  
  .success-icon svg,
  .error-icon svg {
    width: 40px;
    height: 40px;
  }
  
  .success-title {
    font-size: 16px;
  }
  
  .success-message,
  .error-state .error-text p {
    font-size: 13px;
  }
  
  .success-text .tips p {
    font-size: 12px;
  }
  
  .loading-state .loading-spinner.large {
    width: 32px;
    height: 32px;
    margin-bottom: 14px;
  }
  
  .loading-state p {
    font-size: 13px;
  }
  
  .button-group.two-buttons {
    gap: 8px;
  }
  
  .button-group.two-buttons .auth-button {
    height: 44px;
    font-size: 13px;
  }
  
  /* 修复移动端输入框光标位置 */
  .icon-input {
    line-height: 1.2;
    height: 100%;
    padding-top: 0;
    padding-bottom: 0;
    -webkit-appearance: none;
    appearance: none;
  }
  
  .form-group.with-icon {
    align-items: center;
  }
}

/* 平板适配 */
@media (min-width: 768px) and (max-width: 1024px) {
  .success-state,
  .error-state,
  .loading-state {
    padding: 28px 24px 20px;
  }
}

/* 深色模式优化 */
.theme-dark .user-info {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(129, 140, 248, 0.1);
}

.theme-dark .user-icon {
  background: rgba(99, 102, 241, 0.15);
}

.theme-dark .loading-state .loading-spinner.large {
  border-color: var(--border-primary);
}

.theme-dark .success-text {
  color: var(--text-secondary);
}

.theme-dark .success-text .tips {
  border-top-color: var(--border-primary);
}

.theme-dark .success-text .tips p {
  color: var(--text-tertiary);
}
</style>

<style scoped>
/* 添加基础主题样式 */
.auth-view {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 主题颜色定义 */
.theme-light {
  --primary-color: #6366f1;
  --primary-light: rgba(99, 102, 241, 0.1);
  --secondary-color: #8b5cf6;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --input-bg: rgba(255, 255, 255, 0.8);
  --border-primary: #e5e7eb;
  --border-focus: #6366f1;
  --error-color: #ef4444;
  --error-light: rgba(239, 68, 68, 0.1);
  --success-color: #10b981;
  --success-light: rgba(16, 185, 129, 0.1);
  --warning-color: #f59e0b;
  --info-color: #3b82f6;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.theme-dark {
  --primary-color: #8b5cf6;
  --primary-light: rgba(139, 92, 246, 0.15);
  --secondary-color: #a78bfa;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-tertiary: #9ca3af;
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --input-bg: rgba(31, 41, 55, 0.8);
  --border-primary: #374151;
  --border-focus: #8b5cf6;
  --error-color: #f87171;
  --error-light: rgba(248, 113, 113, 0.15);
  --success-color: #34d399;
  --success-light: rgba(52, 211, 153, 0.15);
  --warning-color: #fbbf24;
  --info-color: #60a5fa;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

/* 背景效果 */
.background-fx {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.geometric-grid {
  position: absolute;
  width: 200%;
  height: 200%;
  background-image:
    linear-gradient(var(--border-primary) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-primary) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.1;
  transform: rotate(15deg) translate(-25%, -25%);
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: rotate(15deg) translate(-25%, -25%); }
  100% { transform: rotate(15deg) translate(-15%, -15%); }
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  opacity: 0.1;
  filter: blur(20px);
  animation: float 15s infinite ease-in-out;
}

.shape-1 { width: 200px; height: 200px; top: 10%; left: 5%; animation-delay: 0s; }
.shape-2 { width: 150px; height: 150px; top: 20%; right: 10%; animation-delay: -3s; }
.shape-3 { width: 250px; height: 250px; bottom: 15%; left: 15%; animation-delay: -6s; }
.shape-4 { width: 100px; height: 100px; bottom: 30%; right: 20%; animation-delay: -9s; }
.shape-5 { width: 180px; height: 180px; top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: -12s; }

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.gradient-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    rgba(99, 102, 241, 0.05) 0%,
    rgba(139, 92, 246, 0.05) 50%,
    rgba(16, 185, 129, 0.05) 100%);
}

.auth-scroll-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.auth-card {
  background: rgba(var(--bg-primary), 0.8);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(var(--border-primary), 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.fade-in-down {
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 表单通用样式 */
.form-group {
  position: relative;
  width: 100%;
  margin-bottom: 0;
}

.form-group.with-icon {
  display: flex;
  align-items: center;
  height: 48px;
  background: var(--input-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 0 12px;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.form-group.with-icon.focused {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-group.with-icon.has-error {
  border-color: var(--error-color);
}

.form-group.with-icon.has-success {
  border-color: var(--success-color);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.form-group.with-icon.focused .icon-container {
  color: var(--primary-color);
}

.form-group.with-icon.has-error .icon-container {
  color: var(--error-color);
}

.form-group.with-icon.has-success .icon-container {
  color: var(--success-color);
}

.icon-input {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  outline: none;
  padding: 0;
  min-width: 0;
}

.icon-input::placeholder {
  color: var(--text-tertiary);
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 4px;
  padding: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.clear-button:hover {
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.05);
}

.password-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 4px;
  padding: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.password-toggle:hover {
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.05);
}

/* 按钮样式 */
.auth-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  outline: none;
}

.auth-button.gradient-button {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.auth-button.gradient-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.auth-button.gradient-button:active:not(:disabled) {
  transform: translateY(0);
}

.auth-button.gradient-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* 单一按钮样式 */
.auth-button.single-button {
  width: 100%;
  height: 48px;
}

.back-button {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
}

.back-button:hover:not(:disabled) {
  background: var(--border-primary);
  color: var(--text-primary);
}

.button-text {
  position: relative;
  z-index: 1;
}

.button-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: inherit;
  border-radius: inherit;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 表单操作区域 */
.form-actions {
  margin-top: 12px;
  width: 100%;
}

/* 页脚 */
.auth-footer {
  margin-top: 24px;
  text-align: center;
}

.version-info {
  font-size: 11px;
  color: var(--text-tertiary);
  margin: 0;
}

/* 成功/错误文本 */
.success-text-simple {
  font-size: 12px;
  font-weight: 500;
  color: var(--success-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.error-text-simple {
  font-size: 12px;
  font-weight: 500;
  color: var(--error-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
