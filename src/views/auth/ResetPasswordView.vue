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
          
          <!-- 全局状态提示区域 -->
          <div class="status-hint-area">
            <div v-if="globalError" class="global-error-message">
              {{ globalError }}
            </div>
            <div v-if="globalSuccess" class="global-success-message">
              {{ globalSuccess }}
            </div>
          </div>
          
          <div v-if="!isValidating && !validationError && !success">
            <div class="auth-form">
              <div class="form-content" style="min-height: 280px">
                <div class="auth-steps-container single-step-active">
                  <div class="auth-step single-step">
                    <div v-if="username" class="user-info">
                      <div class="user-icon">👤</div>
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
                        <span class="input-icon">🔒</span>
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
                          ✕
                        </button>
                        <button
                          type="button"
                          class="password-toggle"
                          @click="showPassword = !showPassword"
                          :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                        >
                          <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
                        <span class="input-icon">🔒</span>
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
                          ✕
                        </button>
                        <button
                          type="button"
                          class="password-toggle"
                          @click="showConfirmPassword = !showConfirmPassword"
                          :aria-label="showConfirmPassword ? '隐藏密码' : '显示密码'"
                        >
                          <svg v-if="showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="auth-button-area">
                <div class="button-container">
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
            <div class="success-icon">✅</div>
            <div class="success-text">
              <h3>密码重置成功</h3>
              <p>您的密码已成功重置</p>
              <p class="tips">即将跳转到登录页面...</p>
            </div>
            <div class="actions">
              <button class="auth-button gradient-button" @click="goToAuth">
                立即登录
              </button>
            </div>
          </div>
          
          <div v-else-if="validationError" class="error-state">
            <div class="error-icon">❌</div>
            <div class="error-text">
              <h3>重置链接无效</h3>
              <p>{{ validationError }}</p>
              <div class="actions">
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
  min-height: 280px !important;
}

/* 成功和错误状态页面 */
.success-state,
.error-state,
.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.success-text h3 {
  margin: 0 0 10px 0;
  color: var(--success-color);
}

.success-text p {
  margin: 8px 0;
  color: var(--text-secondary);
}

.success-text .tips {
  font-size: 14px;
  color: var(--text-tertiary);
  margin-top: 15px;
}

.error-state .error-icon {
  font-size: 48px;
  margin-bottom: 20px;
  color: var(--error-color);
}

.error-text h3 {
  margin: 0 0 12px 0;
  color: var(--error-color);
}

.error-text p {
  margin: 0 0 16px 0;
  color: var(--text-secondary);
}

.actions {
  margin-top: 30px;
}

.loading-state .loading-spinner.large {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 3px solid var(--border-primary);
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
}

.loading-state p {
  color: var(--text-secondary);
  margin: 0;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .form-content {
    min-height: 240px !important;
  }
  
  .success-state,
  .error-state,
  .loading-state {
    padding: 30px 16px;
  }
  
  .success-icon,
  .error-icon {
    font-size: 36px;
    margin-bottom: 16px;
  }
  
  .success-text h3,
  .error-text h3 {
    font-size: 16px;
  }
  
  .success-text p,
  .error-text p {
    font-size: 13px;
  }
  
  .actions {
    margin-top: 20px;
  }
  
  .loading-state .loading-spinner.large {
    width: 32px;
    height: 32px;
    margin-bottom: 16px;
  }
}
</style>

<style scoped src="./styles/auth-styles.css"></style>