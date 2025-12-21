<template>
  <div class="auth-form register-form">
    <div class="form-content">
      <div class="auth-steps-container" :class="{ 'two-steps-active': step === 2 }">
        <div class="auth-step step-one" :class="{ 'slide-left': step === 2 }">
          <div class="form-group with-icon" :class="{
            'has-error': errors.username,
            'has-success': form.username && !errors.username && usernameStatus !== 'taken',
            'focused': isUsernameFocused
          }">
            <div class="icon-container">
              <span class="input-icon">👤</span>
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
              @focus="() => { isUsernameFocused = true; handleInputFocus() }"
              @blur="() => { isUsernameFocused = false; handleInputBlur() }"
            />
            <div class="input-actions">
              <div v-if="usernameStatus === 'available'" class="username-status-indicator available">
                ✓
              </div>
              <div v-else-if="usernameStatus === 'taken'" class="username-status-indicator taken">
                ✕
              </div>
              <button
                v-if="form.username"
                type="button"
                class="clear-button"
                @click="form.username = ''; validateUsername(); usernameStatus = ''"
                title="清除"
              >
                ✕
              </button>
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
              placeholder="密码"
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
        </div>
        
        <div class="auth-step step-two" :class="{ 'slide-in': step === 2, 'active': step === 2 }">
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
              placeholder="确认密码"
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
          
          <div class="form-group with-icon" :class="{
            'has-error': errors.email,
            'has-success': form.email && !errors.email && emailStatus !== 'taken',
            'focused': isEmailFocused
          }">
            <div class="icon-container">
              <span class="input-icon">📧</span>
            </div>
            <input
              v-model="form.email"
              type="email"
              placeholder="邮箱，用于找回密码"
              required
              autocomplete="email"
              class="icon-input"
              @input="validateEmail"
              @focus="() => { isEmailFocused = true; handleInputFocus() }"
              @blur="() => { isEmailFocused = false; handleInputBlur() }"
            />
            <div class="input-actions">
              <div v-if="emailStatus === 'available'" class="email-status-indicator available">
                ✓
              </div>
              <div v-else-if="emailStatus === 'taken'" class="email-status-indicator taken">
                ✕
              </div>
              <button
                v-if="form.email"
                type="button"
                class="clear-button"
                @click="form.email = ''; validateEmail(); emailStatus = ''"
                title="清除"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div v-if="showCaptcha && attempts >= 3" class="form-group captcha-group">
            <div class="captcha-row">
              <div class="captcha-input-group">
                <div class="icon-container">
                  <span class="input-icon">🖼️</span>
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
                    ✕
                  </button>
                </div>
              </div>
              <div class="captcha-image-container">
                <div class="captcha-image" @click="$emit('refresh-captcha')">
                  <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                  <div v-else class="captcha-placeholder">刷新</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-error-area" :class="{ 'has-error': attempts > 0 && attempts < 3 }">
        <div v-if="attempts > 0 && attempts < 3" class="attempt-hint">
          <span class="hint-text">注册失败 {{ attempts }} 次，{{ 3 - attempts }} 次后将需要验证码</span>
        </div>
      </div>
    </div>
    
    <div class="auth-button-area">
      <div v-if="step === 1" class="button-container">
        <div class="button-group single-button">
          <button
            type="button"
            class="auth-button gradient-button"
            @click="handleNextStep"
            :disabled="isLoading || hasStep1Errors || !isStep1Valid || usernameStatus === 'taken'"
          >
            <span class="button-text">下一步</span>
          </button>
        </div>
      </div>
      
      <div v-else class="button-container">
        <div class="button-group two-buttons">
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
            :disabled="isLoading || hasStep2Errors || !isStep2Valid || emailStatus === 'taken'"
          >
            <span class="button-text">{{ isLoading ? '注册中...' : '注册' }}</span>
            <div v-if="isLoading" class="button-loading">
              <div class="loading-spinner"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './styles/auth-styles.css'
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
  (e: 'check-email', email: string): void
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
const emailStatus = ref('')

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  captcha_code: '',
  captcha_id: ''
})

const errors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

const hasStep1Errors = computed(() => {
  return !!errors.username || !!errors.password
})

const hasStep2Errors = computed(() => {
  return !!errors.confirmPassword || !!errors.email
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
    errors.username = ''
    usernameStatus.value = ''
  } else if (username.length < 3) {
    errors.username = ''
    usernameStatus.value = ''
  } else if (username.length > 10) {
    errors.username = ''
    usernameStatus.value = ''
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = ''
    usernameStatus.value = ''
  } else {
    errors.username = ''
  }
  emit('clear-global-error')
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
  emit('clear-global-error')
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
  emit('clear-global-error')
}

const validateEmail = () => {
  const email = form.email
  if (!email) {
    errors.email = ''
    emailStatus.value = ''
  } else if (!validateEmailFormat(email)) {
    errors.email = ''
    emailStatus.value = ''
  } else {
    errors.email = ''
  }
  emit('clear-global-error')
}

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

const handleNextStep = () => {
  validateUsername()
  validatePassword()
  
  if (errors.username || errors.password) {
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

watch(() => form.email, (newEmail) => {
  if (newEmail && validateEmailFormat(newEmail)) {
    const timer = setTimeout(() => {
      emit('check-email', newEmail)
    }, 500)
    return () => clearTimeout(timer)
  } else {
    emailStatus.value = ''
  }
  emit('clear-global-error')
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

const handleEmailCheckResult = (result: {exists?: boolean, message?: string}) => {
  if (result.exists === true) {
    emailStatus.value = 'taken'
  } else if (result.exists === false) {
    emailStatus.value = 'available'
  } else {
    emailStatus.value = ''
  }
}

defineExpose({
  handleUsernameCheckResult,
  handleEmailCheckResult
})
</script>

<style scoped>
/* 移除所有内部样式，使用统一的 auth-styles.css */
</style>