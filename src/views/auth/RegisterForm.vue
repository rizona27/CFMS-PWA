<template>
  <div class="auth-form register-form">
    <div class="form-content">
      <div class="auth-steps-container" :class="{ 'two-steps-active': step === 2, 'has-captcha': showCaptcha && attempts >= 3 }">
        <!-- 第一步：用户名和密码 -->
        <div class="auth-step step-one" :class="{ 'slide-left': step === 2 }">
          <div class="form-group with-icon" :class="{
            'has-error': usernameError || usernameStatus === 'taken',
            'has-success': form.username && usernameStatus === 'available',
            'focused': isUsernameFocused
          }">
            <div class="icon-container">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <input
              v-model="form.username"
              type="text"
              placeholder="用户名"
              required
              autocomplete="username"
              class="icon-input"
              maxlength="10"
              @input="validateUsername"
              @focus="() => { isUsernameFocused = true; }"
              @blur="() => { isUsernameFocused = false; }"
            />
            <div class="input-actions">
              <div v-if="usernameStatus === 'available'" class="username-status-indicator available">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div v-else-if="usernameStatus === 'taken'" class="username-status-indicator taken">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <button
                v-if="form.username"
                type="button"
                class="clear-button"
                @click="form.username = ''; validateUsername(); usernameStatus = ''"
                title="清除"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
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
              placeholder="密码"
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
        </div>
        
        <!-- 第二步：确认密码和邮箱 -->
        <div class="auth-step step-two" :class="{ 'slide-in': step === 2, 'active': step === 2 }">
          <div class="form-group with-icon password-group" :class="{
            'has-error': confirmPasswordError || (form.confirmPassword && form.password !== form.confirmPassword),
            'has-success': form.confirmPassword && form.password === form.confirmPassword,
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
              placeholder="确认密码"
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
          
          <div class="form-group with-icon" :class="{
            'has-error': emailError,
            'has-success': form.email && !emailError,
            'focused': isEmailFocused
          }">
            <div class="icon-container">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <input
              v-model="form.email"
              type="email"
              placeholder="邮箱，用于找回密码"
              required
              autocomplete="email"
              class="icon-input"
              @input="validateEmail"
              @focus="() => { isEmailFocused = true; }"
              @blur="() => { isEmailFocused = false; }"
            />
            <div class="input-actions">
              <button
                v-if="form.email"
                type="button"
                class="clear-button"
                @click="form.email = ''; validateEmail();"
                title="清除"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div v-if="showCaptcha && attempts >= 3" class="form-group captcha-group">
            <div class="captcha-row">
              <div class="captcha-input-group">
                <div class="icon-container">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 9h.01M15 9h.01M9 15h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <input
                  v-model="form.captcha_code"
                  type="text"
                  placeholder="验证码"
                  required
                  class="icon-input captcha-input"
                  maxlength="4"
                  @input="handleCaptchaInput"
                />
                <div class="input-actions">
                  <button
                    v-if="form.captcha_code"
                    type="button"
                    class="clear-button"
                    @click="form.captcha_code = ''"
                    title="清除"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="captcha-image-container">
                <div class="captcha-image" @click="$emit('refresh-captcha')">
                  <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                  <div v-else class="captcha-placeholder">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23 4L23 10 17 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M1 20L1 14 7 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 统一错误提示区域 -->
      <div class="form-error-area-simple" :class="{ 'has-attempts': attempts > 0 && attempts < 3 }">
        <div v-if="attempts > 0 && attempts < 3" class="error-text-simple">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          注册失败 {{ attempts }} 次，{{ 3 - attempts }} 次后将需要验证码
        </div>
        <div v-if="confirmPasswordError && form.confirmPassword && form.password !== form.confirmPassword" class="error-text-simple">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          两次输入的密码不一致
        </div>
      </div>
    </div>
    
    <!-- 统一按钮区域 -->
    <div class="form-actions">
      <div v-if="step === 1">
        <button
          type="button"
          class="auth-button gradient-button"
          @click="handleNextStep"
          :disabled="isLoading || hasStep1Errors || !isStep1Valid || usernameStatus === 'taken'"
        >
          <span class="button-text">下一步</span>
        </button>
      </div>
      
      <div v-else class="button-group two-buttons">
        <button
          type="button"
          class="auth-button back-button"
          @click="step = 1"
          :disabled="isLoading"
        >
          <span class="button-text">返回</span>
        </button>
        <button
          type="button"
          class="auth-button gradient-button"
          @click="$emit('submit', form)"
          :disabled="isLoading || hasStep2Errors || !isStep2Valid"
        >
          <span class="button-text">{{ isLoading ? '注册中...' : '注册' }}</span>
          <div v-if="isLoading" class="button-loading">
            <div class="loading-spinner"></div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'

interface Props {
  isLoading?: boolean
  attempts?: number
  showCaptcha?: boolean
  captchaImage?: string
}

interface Emits {
  (e: 'submit', form: any): void
  (e: 'refresh-captcha'): void
  (e: 'check-username', username: string): void
  (e: 'clear-global-error'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  attempts: 0,
  showCaptcha: false,
  captchaImage: ''
})

const emit = defineEmits<Emits>()

const step = ref(1)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isUsernameFocused = ref(false)
const isPasswordFocused = ref(false)
const isConfirmPasswordFocused = ref(false)
const isEmailFocused = ref(false)
const usernameStatus = ref('')
const usernameError = ref(false)
const passwordError = ref(false)
const confirmPasswordError = ref(false)
const emailError = ref(false)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  captcha_code: '',
  captcha_id: ''
})

const hasStep1Errors = computed(() => {
  return usernameError.value || passwordError.value
})

const hasStep2Errors = computed(() => {
  return confirmPasswordError.value || emailError.value
})

const isStep1Valid = computed(() => {
  return form.username.length >= 3 &&
         form.password.length >= 6
})

const isStep2Valid = computed(() => {
  return form.confirmPassword === form.password &&
         form.email && validateEmailFormat(form.email) &&
         (!props.showCaptcha || form.captcha_code.length >= 4)
})

const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateUsername = () => {
  const username = form.username
  if (!username) {
    usernameError.value = false
    usernameStatus.value = ''
  } else if (username.length < 3) {
    usernameError.value = true
    usernameStatus.value = ''
  } else if (username.length > 10) {
    usernameError.value = true
    usernameStatus.value = ''
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    usernameError.value = true
    usernameStatus.value = ''
  } else {
    usernameError.value = false
  }
  emit('clear-global-error')
}

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
  emit('clear-global-error')
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
  emit('clear-global-error')
}

const validateEmail = () => {
  const email = form.email
  if (!email) {
    emailError.value = false
  } else if (!validateEmailFormat(email)) {
    emailError.value = true
  } else {
    emailError.value = false
  }
  emit('clear-global-error')
}

const handleNextStep = () => {
  validateUsername()
  validatePassword()
  
  if (usernameError.value || passwordError.value) {
    return
  }
  
  if (usernameStatus.value === 'taken') {
    return
  }
  
  step.value = 2
}

const handleCaptchaInput = () => {
  if (form.captcha_code.length > 4) {
    form.captcha_code = form.captcha_code.slice(0, 4)
  }
  emit('clear-global-error')
}

watch(() => form.username, (newUsername) => {
  if (newUsername && newUsername.length >= 3 && newUsername.length <= 10 && /^[a-zA-Z0-9_]+$/.test(newUsername)) {
    const timer = setTimeout(() => {
      emit('check-username', newUsername)
    }, 500)
    return () => clearTimeout(timer)
  } else {
    usernameStatus.value = ''
  }
  emit('clear-global-error')
})

watch(() => form.confirmPassword, (newConfirm) => {
  if (newConfirm && form.password) {
    validateConfirmPassword()
  }
})

watch(() => form.password, () => {
  if (form.confirmPassword) {
    validateConfirmPassword()
  }
})

const handleUsernameCheckResult = (result: {exists?: boolean, message?: string}) => {
  if (result.exists === true) {
    usernameStatus.value = 'taken'
  } else if (result.exists === false) {
    usernameStatus.value = 'available'
  } else {
    usernameStatus.value = ''
  }
}

defineExpose({
  handleUsernameCheckResult
})
</script>

<style scoped>
/* 注册表单特殊样式 */
.register-form .form-content {
  display: flex;
  flex-direction: column;
  min-height: 240px;
  position: relative;
  width: 100%;
  flex: 1;
}

/* 统一注册页步进容器高度 */
.register-form .auth-steps-container {
  position: relative;
  height: 176px;
  margin-bottom: 4px;
  transition: height 0.3s ease;
  overflow: visible;
  flex-shrink: 0;
}

.register-form .auth-steps-container.two-steps-active {
  height: 176px;
}

.register-form .auth-steps-container.two-steps-active.has-captcha {
  height: 240px;
}

/* 步骤容器统一定位 */
.auth-step {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--form-spacing, 16px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 第一步初始状态 */
.auth-step.step-one {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
  z-index: 2;
  display: flex;
  justify-content: center;
}

/* 第一步离开动画 */
.auth-step.step-one.slide-left {
  transform: translateX(-100%);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 1;
}

/* 第二步初始状态 */
.auth-step.step-two {
  display: flex;
  opacity: 0;
  visibility: hidden;
  transform: translateX(100%);
  z-index: 1;
  justify-content: center;
}

/* 第二步进入动画 */
.auth-step.step-two.slide-in {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
  z-index: 2;
}

/* 状态指示器样式 */
.username-status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin-right: 4px;
  box-sizing: border-box;
}

.username-status-indicator.available {
  background: var(--success-light);
  color: var(--success-color);
}

.username-status-indicator.taken {
  background: var(--error-light);
  color: var(--error-color);
}

.username-status-indicator svg {
  width: 10px;
  height: 10px;
}

/* 统一错误提示 */
.form-error-area-simple {
  height: 24px;
  margin: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: all 0.2s ease;
  overflow: hidden;
  flex-shrink: 0;
  animation: fadeIn 0.2s ease;
}

.form-error-area-simple.has-attempts {
  height: 24px;
}

.error-text-simple {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  text-align: center;
  padding: 2px 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.form-error-area-simple.has-attempts .error-text-simple {
  color: var(--warning-color);
}

.error-text-simple {
  color: var(--error-color);
}

.error-text-simple svg {
  flex-shrink: 0;
}

/* 统一按钮区域 */
.form-actions {
  margin-top: auto;
  padding-top: 0;
  width: 100%;
  flex-shrink: 0;
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
  height: 44px;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .register-form .auth-steps-container {
    height: 176px;
    margin-bottom: 4px;
  }
  
  .register-form .auth-steps-container.two-steps-active {
    height: 176px;
  }
  
  .register-form .auth-steps-container.two-steps-active.has-captcha {
    height: 240px;
  }
  
  .auth-step {
    gap: 12px;
  }
  
  .register-form .button-group.two-buttons {
    grid-template-columns: 1fr 1.5fr;
    gap: 10px;
    height: 44px;
  }
  
  .username-status-indicator {
    width: 16px;
    height: 16px;
  }
  
  .username-status-indicator svg {
    width: 8px;
    height: 8px;
  }
  
  .error-text-simple {
    font-size: 11px;
  }
  
  .error-text-simple svg {
    width: 10px;
    height: 10px;
    margin-right: 3px;
  }
  
  .form-error-area-simple {
    height: 20px;
    margin: 4px 0;
  }
  
  .form-error-area-simple.has-attempts {
    height: 20px;
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
  
  .form-actions {
    padding-top: 0;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>