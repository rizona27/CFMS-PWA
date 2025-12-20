<template>
  <div class="auth-form">
    <div class="form-content">
      <div class="auth-steps-container" :class="{ 'two-steps-active': step === 2 }">
        <div class="auth-step step-one" :class="{ 'slide-left': step === 2 }">
          <div class="form-group with-icon" :class="{
            'has-error': errors.username,
            'has-success': form.username && !errors.username,
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
              <button
                v-if="form.username"
                type="button"
                class="clear-button"
                @click="form.username = ''; validateUsername()"
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
            'has-success': form.email && !errors.email,
            'focused': isEmailFocused
          }">
            <div class="icon-container">
              <span class="input-icon">📧</span>
            </div>
            <input
              v-model="form.email"
              type="email"
              placeholder="邮箱"
              required
              autocomplete="email"
              class="icon-input"
              @input="validateEmail"
              @focus="() => { isEmailFocused = true; handleInputFocus() }"
              @blur="() => { isEmailFocused = false; handleInputBlur() }"
            />
            <div class="input-actions">
              <button
                v-if="form.email"
                type="button"
                class="clear-button"
                @click="form.email = ''; validateEmail()"
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
      
      <div v-if="attempts > 0 && attempts < 3" class="auth-alerts">
        <div class="attempt-hint">
          <span class="hint-text">注册失败 {{ attempts }} 次，{{ 3 - attempts }} 次后将需要验证码</span>
        </div>
      </div>
      
      <div class="errors-container" :class="{ 'has-errors': hasStepErrors }">
        <div v-if="step === 1 && errors.username" class="error-message">
          {{ errors.username }}
        </div>
        <div v-if="step === 1 && errors.password" class="error-message">
          {{ errors.password }}
        </div>
        <div v-if="step === 2 && errors.confirmPassword" class="error-message">
          {{ errors.confirmPassword }}
        </div>
        <div v-if="step === 2 && errors.email" class="error-message">
          {{ errors.email }}
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
            :disabled="isLoading || hasStep1Errors || !isStep1Valid"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

interface Props {
  isLoading?: boolean
  attempts?: number
  showCaptcha?: boolean
  captchaImage?: string
}

interface Emits {
  (e: 'submit', form: any): void
  (e: 'refresh-captcha'): void
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

const hasStepErrors = computed(() => {
  if (step.value === 1) {
    return hasStep1Errors.value
  } else {
    return hasStep2Errors.value
  }
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
    errors.username = '请输入用户名'
  } else if (username.length < 3) {
    errors.username = '用户名至少需要3个字符'
  } else if (username.length > 10) {
    errors.username = '用户名不能超过10个字符'
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = '用户名只能包含字母、数字和下划线'
  } else {
    errors.username = ''
  }
}

const validatePassword = () => {
  const password = form.password
  if (!password) {
    errors.password = '请输入密码'
  } else if (password.length < 6) {
    errors.password = '密码至少需要6个字符'
  } else if (password.length > 20) {
    errors.password = '密码不能超过20个字符'
  } else {
    errors.password = ''
  }
}

const validateConfirmPassword = () => {
  const confirm = form.confirmPassword
  const password = form.password
  if (!confirm) {
    errors.confirmPassword = '请确认密码'
  } else if (password !== confirm) {
    errors.confirmPassword = '两次输入的密码不一致'
  } else {
    errors.confirmPassword = ''
  }
}

const validateEmail = () => {
  const email = form.email
  if (!email) {
    errors.email = '请输入邮箱'
  } else if (!validateEmailFormat(email)) {
    errors.email = '邮箱格式不正确'
  } else {
    errors.email = ''
  }
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
}
</script>

<style scoped>
.form-group.with-icon {
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.form-group.with-icon.focused {
  z-index: 10;
  position: relative;
  transform: translateZ(0);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.auth-step.step-two {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.auth-step.step-two.active {
  display: block;
  visibility: visible;
  opacity: 1;
}

.auth-step.step-two.slide-in {
  display: block;
}

.auth-step.step-one.slide-left {
  transform: translateX(-100%);
  opacity: 0;
}

.auth-step {
  transition: all 0.3s ease;
}

.auth-steps-container {
  position: relative;
  min-height: 160px;
}

/* 保持原始间距 */
.auth-button-area {
  margin-top: 24px;
}

.auth-form .form-content {
  margin-bottom: 0;
}
</style>

<style scoped src="./styles/auth-styles.css"></style>
