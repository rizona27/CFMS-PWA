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
                      'has-error': errors.password,
                      'has-success': form.password && !errors.password,
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
                        @focus="() => { isPasswordFocused = true; handleInputFocus() }"
                        @blur="() => { isPasswordFocused = false; handleInputBlur() }"
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
                      'has-error': errors.confirmPassword,
                      'has-success': form.confirmPassword && !errors.confirmPassword,
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
                        @focus="() => { isConfirmPasswordFocused = true; handleInputFocus() }"
                        @blur="() => { isConfirmPasswordFocused = false; handleInputBlur() }"
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
            
            <div class="hint-area">
              <div class="mode-switch">
                <p>
                  记起密码了？
                  <a href="#" @click.prevent="goToAuth">返回登录</a>
                </p>
              </div>
            </div>
          </div>
          
          <div v-else-if="success" class="success-state">
            <div class="success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="success-text">
              <h3>密码重置成功</h3>
              <p>您的密码已成功重置</p>
              <p class="tips">即将跳转到登录页面...</p>
            </div>
            <div class="form-actions">
              <button class="auth-button gradient-button" @click="goToAuth">
                立即登录
              </button>
            </div>
          </div>
          
          <div v-else-if="validationError" class="error-state">
            <div class="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="error-text">
              <h3>重置链接无效</h3>
              <p>{{ validationError }}</p>
              <div class="form-actions">
                <button class="auth-button gradient-button" @click="goToAuth">
                  返回登录页面
                </button>
              </div>
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
import { ref, reactive, computed, onMounted } from 'vue'
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

const form = reactive({
  password: '',
  confirmPassword: ''
})

const errors = reactive({
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
         form.confirmPassword === form.password
})

const copyrightInfo = ref(getCopyright())

const handleInputFocus = (event?: Event) => {
  if (event) {
    const input = event.target as HTMLElement
    input.parentElement?.classList.add('focused')
  }
}

const handleInputBlur = (event?: Event) => {
  if (event) {
    const input = event.target as HTMLElement
    input.parentElement?.classList.remove('focused')
  }
}

const validatePassword = () => {
  const password = form.password
  if (!password) {
    errors.password = ''
  } else if (password.length < 6) {
    errors.password = ''
  } else if (password.length > 20) {
    errors.password = ''
  } else {
    errors.password = ''
  }
  globalError.value = ''
}

const validateConfirmPassword = () => {
  const confirm = form.confirmPassword
  const password = form.password
  if (!confirm) {
    errors.confirmPassword = ''
  } else if (password !== confirm) {
    errors.confirmPassword = ''
  } else {
    errors.confirmPassword = ''
  }
  globalError.value = ''
}

const goToAuth = () => {
  router.push('/auth')
}

const handleReset = async () => {
  validatePassword()
  validateConfirmPassword()
  
  if (errors.password || errors.confirmPassword) {
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
      globalSuccess.value = '密码重置成功！正在跳转到登录页面...'
      setTimeout(() => {
        router.push('/auth')
      }, 2000)
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

/* 成功和错误状态页面 */
.success-state,
.error-state,
.loading-state {
  text-align: center;
  padding: 32px 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.success-icon {
  margin-bottom: 20px;
  color: var(--success-color);
}

.success-icon svg {
  width: 48px;
  height: 48px;
  display: block;
  margin: 0 auto;
}

.success-text h3 {
  margin: 0 0 12px 0;
  color: var(--success-color);
  font-size: 18px;
  font-weight: 600;
}

.success-text p {
  margin: 6px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.4;
}

.success-text .tips {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-primary);
}

.error-state .error-icon {
  margin-bottom: 20px;
  color: var(--error-color);
}

.error-icon svg {
  width: 48px;
  height: 48px;
  display: block;
  margin: 0 auto;
}

.error-text h3 {
  margin: 0 0 12px 0;
  color: var(--error-color);
  font-size: 18px;
  font-weight: 600;
}

.error-text p {
  margin: 0 0 20px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.4;
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
    padding: 24px 16px;
  }
  
  .success-icon svg,
  .error-icon svg {
    width: 40px;
    height: 40px;
  }
  
  .success-text h3,
  .error-text h3 {
    font-size: 16px;
  }
  
  .success-text p,
  .error-text p {
    font-size: 13px;
  }
  
  .success-text .tips {
    font-size: 12px;
    margin-top: 14px;
    padding-top: 10px;
  }
  
  .loading-state .loading-spinner.large {
    width: 32px;
    height: 32px;
    margin-bottom: 14px;
  }
  
  .loading-state p {
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
    padding: 28px 24px;
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

.theme-dark .success-text .tips,
.theme-dark .loading-state .loading-spinner.large {
  border-top-color: var(--border-primary);
  border-color: var(--border-primary);
}

/* 统一状态提示区域 */
.form-error-area-simple {
  height: 20px;
  margin: 4px 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.error-text-simple {
  color: var(--error-color);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.success-text-simple {
  color: var(--success-color);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.error-text-simple svg,
.success-text-simple svg {
  flex-shrink: 0;
}

/* 统一按钮区域 */
.form-actions {
  margin-top: 12px;
  width: 100%;
}

.auth-button {
  height: 44px;
  width: 100%;
}

.button-group.two-buttons {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 12px;
  width: 100%;
}

/* 链接区域 */
.hint-area {
  margin-top: 20px;
  text-align: center;
}

.mode-switch {
  font-size: 13px;
  color: var(--text-secondary);
}

.mode-switch a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
  position: relative;
}

.mode-switch a:hover {
  color: var(--secondary-color);
}

/* 页脚样式 */
.auth-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-primary);
  text-align: center;
}

.version-info {
  font-size: 11px;
  color: var(--text-tertiary);
  opacity: 0.7;
}

/* 加载动画 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<style scoped src="./styles/auth-styles.css"></style>
