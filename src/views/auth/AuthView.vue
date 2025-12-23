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
            <h1 class="auth-title">CFMS · 一基暴富</h1>
          </div>
          
          <div class="auth-form">
            <div class="form-content">
              <div class="form-group with-icon" :class="{
                'has-error': usernameError,
                'has-success': form.username && !usernameError,
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
                  :autocomplete="isRegisterMode ? 'username' : 'username'"
                  class="icon-input"
                  maxlength="10"
                  @input="validateUsername"
                  @focus="() => { isUsernameFocused = true; }"
                  @blur="() => { isUsernameFocused = false; handleUsernameBlur() }"
                />
                <div class="input-actions">
                  <div v-if="isRegisterMode && usernameCheckStatus === 'available'" class="username-status-indicator available">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div v-else-if="isRegisterMode && usernameCheckStatus === 'taken'" class="username-status-indicator taken">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <button
                    v-if="form.username"
                    type="button"
                    class="clear-button"
                    @click="form.username = ''; validateUsername(); usernameCheckStatus = ''"
                    title="清除"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div v-if="isRegisterMode" class="form-group with-icon" :class="{
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
                  :placeholder="isRegisterMode ? '密码' : '密码'"
                  required
                  :autocomplete="isRegisterMode ? 'new-password' : 'current-password'"
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
              
              <div v-if="isRegisterMode"
                   class="form-group with-icon password-group" :class="{
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
                    <div class="captcha-image" @click="refreshCaptcha">
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
            
            <div class="form-error-area" :class="{
              'has-error': (attempts > 0 && hasValidAccountForAttempt) || showUserMissingMessage || (isRegisterMode && attempts > 0),
              'has-locked-error': attempts >= 5 && hasValidAccountForAttempt,
              'has-cooldown': showCooldownMessage
            }">
              <div v-if="attempts > 0 && hasValidAccountForAttempt" class="error-text">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span v-if="attempts < 5">
                  用户名或密码错误，剩余尝试次数: {{ 5 - attempts }}
                  <span v-if="attempts >= 3">，请输入验证码</span>
                </span>
                <span v-else class="locked-message">
                  账户已锁定，请管理员解锁！
                </span>
              </div>
              
              <div v-if="showUserMissingMessage && !hasValidAccountForAttempt" class="error-text">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span v-if="attempts < 5">
                  用户名不存在，剩余尝试次数: {{ 5 - attempts }}
                </span>
                <span v-else>
                  尝试次数过多，请10分钟后再试
                </span>
                <a href="#" @click.prevent="switchToRegister" style="margin-left: 4px;">注册新账号</a>
              </div>
              
              <div v-if="showCooldownMessage" class="error-text">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                尝试次数过多，请{{ remainingCooldownMinutes }}分钟{{ remainingCooldownSeconds }}秒后再试
              </div>
              
              <div v-if="isRegisterMode && confirmPasswordError && form.confirmPassword && form.password !== form.confirmPassword" class="error-text">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                两次输入的密码不一致
              </div>
              
              <div v-if="isRegisterMode && attempts > 0 && attempts < 3" class="error-text">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                注册失败 {{ attempts }} 次，{{ 3 - attempts }} 次后将需要验证码
              </div>
            </div>
            
            <div class="form-actions">
              <button
                type="button"
                class="auth-button gradient-button single-button"
                @click="handleSubmit"
                :disabled="isLoading || !isFormValid || isCooldownActive"
              >
                <span class="button-text">
                  {{ isLoading ? (isRegisterMode ? '注册中...' : '登录中...') : (isRegisterMode ? '注册' : '登录') }}
                </span>
                <div v-if="isLoading" class="button-loading">
                  <div class="loading-spinner"></div>
                </div>
              </button>
            </div>
          </div>
          
          <div class="hint-area">
            <div class="mode-switch">
              <p v-if="!isRegisterMode">
                还没有账户？
                <a href="#" @click.prevent="switchToRegister">立即注册</a>
                <span style="margin: 0 8px">|</span>
                <a href="#" @click.prevent="switchToForgotPassword">忘记密码？</a>
              </p>
              <p v-else>
                已有账户？
                <a href="#" @click.prevent="switchToLogin">立即登录</a>
              </p>
            </div>
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
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { getCopyright } from '../../Version'

const router = useRouter()
const authStore = useAuthStore()

const isRegisterMode = ref(false)
const isLoading = ref(false)
const globalError = ref('')
const globalSuccess = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const attempts = ref(0)
const showCaptcha = ref(false)
const captchaImage = ref('')
const captchaId = ref('')
const hasValidAccountForAttempt = ref(false)
const showUserMissingMessage = ref(false)
const cooldownTimer = ref(0)
const showCooldownMessage = ref(false)
const cooldownInterval = ref<ReturnType<typeof setInterval> | null>(null)

const isUsernameFocused = ref(false)
const isEmailFocused = ref(false)
const isPasswordFocused = ref(false)
const isConfirmPasswordFocused = ref(false)
const usernameCheckStatus = ref('')
const usernameError = ref(false)
const emailError = ref(false)
const passwordError = ref(false)
const confirmPasswordError = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  captcha_code: '',
  captcha_id: ''
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

const copyrightInfo = ref(getCopyright())

const isCooldownActive = computed(() => {
  return cooldownTimer.value > 0
})

const remainingCooldownMinutes = computed(() => {
  return Math.floor(cooldownTimer.value / 60)
})

const remainingCooldownSeconds = computed(() => {
  return cooldownTimer.value % 60
})

const isFormValid = computed(() => {
  if (isRegisterMode.value) {
    return form.username.length >= 3 &&
           form.email && validateEmailFormat(form.email) &&
           usernameCheckStatus.value === 'available' &&
           form.password.length >= 6 &&
           form.confirmPassword === form.password &&
           (!showCaptcha.value || form.captcha_code.length >= 4)
  } else {
    return form.username.length >= 3 &&
           form.password.length >= 6 &&
           (!showCaptcha.value || form.captcha_code.length >= 4)
  }
})

const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateUsername = () => {
  const username = form.username
  if (!username) {
    usernameError.value = false
    if (isRegisterMode.value) {
      usernameCheckStatus.value = ''
    }
  } else if (username.length < 3) {
    usernameError.value = true
    if (isRegisterMode.value) {
      usernameCheckStatus.value = ''
    }
  } else if (username.length > 10) {
    usernameError.value = true
    if (isRegisterMode.value) {
      usernameCheckStatus.value = ''
    }
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    usernameError.value = true
    if (isRegisterMode.value) {
      usernameCheckStatus.value = ''
    }
  } else {
    usernameError.value = false
  }
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
}

const validateConfirmPassword = () => {
  if (!form.confirmPassword) {
    confirmPasswordError.value = false
  } else if (form.password !== form.confirmPassword) {
    confirmPasswordError.value = true
  } else {
    confirmPasswordError.value = false
  }
}

const checkUsernameAvailability = async () => {
  if (!isRegisterMode.value || form.username.length < 3) return
  
  try {
    const response = await fetch('https://cfms.crnas.uk/api/check_user_exists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username }),
      credentials: 'include'
    })
    
    const data = await response.json()
    if (data.success) {
      usernameCheckStatus.value = data.exists ? 'taken' : 'available'
      hasValidAccountForAttempt.value = data.exists
      
      if (data.exists && data.is_locked) {
        attempts.value = 5
        showCaptcha.value = true
      }
    }
  } catch (error) {
    console.error('检查用户名失败:', error)
    usernameCheckStatus.value = ''
  }
}

const handleUsernameBlur = () => {
  if (form.username && isRegisterMode.value) {
    checkUsernameAvailability()
  }
}

const handleCaptchaInput = () => {
  if (form.captcha_code.length > 4) {
    form.captcha_code = form.captcha_code.slice(0, 4)
  }
}

const refreshCaptcha = async () => {
  try {
    const response = await fetch('https://cfms.crnas.uk/api/captcha', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    
    const data = await response.json()
    if (data.success) {
      captchaImage.value = `data:image/png;base64,${data.image_base64}`
      captchaId.value = data.captcha_id
      form.captcha_id = data.captcha_id
    }
  } catch (error) {
    console.error('刷新验证码失败:', error)
  }
}

const startCooldown = () => {
  cooldownTimer.value = 600
  showCooldownMessage.value = true
  
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
  }
  
  cooldownInterval.value = setInterval(() => {
    cooldownTimer.value--
    
    if (cooldownTimer.value <= 0) {
      stopCooldown()
    }
  }, 1000)
}

const stopCooldown = () => {
  showCooldownMessage.value = false
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
    cooldownInterval.value = null
  }
}

const switchToRegister = () => {
  isRegisterMode.value = true
  resetForm()
  attempts.value = 0
  showCaptcha.value = false
  globalError.value = ''
  globalSuccess.value = ''
  stopCooldown()
}

const switchToLogin = () => {
  isRegisterMode.value = false
  resetForm()
  attempts.value = 0
  showCaptcha.value = false
  globalError.value = ''
  globalSuccess.value = ''
  stopCooldown()
}

const switchToForgotPassword = () => {
  router.push('/forgot-password')
}

const resetForm = () => {
  form.username = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  form.captcha_code = ''
  form.captcha_id = ''
  
  usernameError.value = false
  emailError.value = false
  passwordError.value = false
  confirmPasswordError.value = false
  
  usernameCheckStatus.value = ''
  hasValidAccountForAttempt.value = false
  showUserMissingMessage.value = false
  
  showPassword.value = false
  showConfirmPassword.value = false
}

const handleSubmit = async () => {
  if (isCooldownActive.value) {
    globalError.value = `请${remainingCooldownMinutes.value}分钟${remainingCooldownSeconds.value}秒后再试`
    return
  }
  
  validateUsername()
  validatePassword()
  if (isRegisterMode.value) {
    validateEmail()
    validateConfirmPassword()
  }
  
  if (showCaptcha.value && (!form.captcha_code || form.captcha_code.length < 4)) {
    globalError.value = '请输入验证码'
    return
  }
  
  if (isRegisterMode.value) {
    if (usernameCheckStatus.value !== 'available') {
      globalError.value = '请检查用户名是否可用'
      return
    }
    
    if (form.password !== form.confirmPassword) {
      globalError.value = '两次输入的密码不一致'
      return
    }
  }
  
  isLoading.value = true
  globalError.value = ''
  globalSuccess.value = ''
  
  try {
    if (isRegisterMode.value) {
      const success = await authStore.register({
        username: form.username,
        password: form.password,
        email: form.email,
        captcha_code: form.captcha_code,
        captcha_id: form.captcha_id
      })
      
      if (success) {
        globalSuccess.value = '注册成功！正在跳转到主页面...'
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        attempts.value++
        if (attempts.value >= 3) {
          showCaptcha.value = true
          await refreshCaptcha()
        }
        globalError.value = authStore.error || '注册失败'
      }
    } else {
      const result = await authStore.login(
        form.username,
        form.password,
        showCaptcha.value ? form.captcha_code : undefined,
        showCaptcha.value ? captchaId.value : undefined
      )
      
      if (result.success) {
        globalSuccess.value = '登录成功！正在跳转...'
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        if (result.reason === 'user_missing') {
          showUserMissingMessage.value = true
          hasValidAccountForAttempt.value = false
          attempts.value++
          
          if (attempts.value >= 5) {
            startCooldown()
            attempts.value = 0
            globalError.value = '尝试次数过多，请10分钟后再试'
          } else {
            globalError.value = result.message || '登录失败'
          }
        } else if (result.reason === 'password_error') {
          hasValidAccountForAttempt.value = true
          showUserMissingMessage.value = false
          attempts.value++
          
          if (attempts.value >= 3) {
            showCaptcha.value = true
            await refreshCaptcha()
          }
          
          if (attempts.value >= 5) {
            showCaptcha.value = true
            globalError.value = '账户已锁定，请联系管理员解锁'
          } else {
            globalError.value = result.message || '登录失败'
          }
        } else if (result.reason === 'captcha_error') {
          showCaptcha.value = true
          await refreshCaptcha()
          globalError.value = result.message || '验证码错误'
        } else {
          globalError.value = result.message || '登录失败'
        }
      }
    }
  } catch (err: any) {
    console.error('表单提交错误:', err)
    globalError.value = err.message || '操作失败，请重试'
  } finally {
    isLoading.value = false
  }
}

watch(() => form.username, (newUsername) => {
  if (newUsername && newUsername.length >= 3 && isRegisterMode.value) {
    checkUsernameAvailability()
  }
})

onUnmounted(() => {
  stopCooldown()
})

onMounted(() => {
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemTheme.value = darkModeMediaQuery.matches ? 'dark' : 'light'
  
  darkModeMediaQuery.addEventListener('change', (e) => {
    systemTheme.value = e.matches ? 'dark' : 'light'
  })
  
  refreshCaptcha()
})
</script>

<style scoped>
.auth-view {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

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

.auth-form {
  width: 100%;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

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

.captcha-image-container {
  flex-shrink: 0;
  width: 120px;
}

.captcha-image {
  width: 120px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--border-primary);
  background: var(--input-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.captcha-image:hover {
  border-color: var(--border-focus);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.captcha-placeholder {
  color: var(--text-tertiary);
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-placeholder svg {
  width: 14px;
  height: 14px;
}

.captcha-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  height: 48px;
  background: var(--input-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 0 12px;
  backdrop-filter: blur(8px);
  min-width: 0;
}

.captcha-input-group .icon-input {
  flex: 1;
  min-width: 0;
}

.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-group {
  margin-top: 4px;
}

.form-error-area {
  min-height: 20px;
  margin: 8px 0 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: all 0.2s ease;
  overflow: hidden;
}

.form-error-area.has-error,
.form-error-area.has-cooldown {
  min-height: 20px;
}

.form-error-area.has-locked-error {
  min-height: 20px;
}

.error-text {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  text-align: center;
  padding: 4px 8px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  color: var(--error-color);
  background: var(--error-light);
  border-radius: 8px;
  border-left: 3px solid var(--error-color);
}

.form-error-area.has-error .error-text {
  color: var(--error-color);
  background: var(--error-light);
  border-left-color: var(--error-color);
}

.form-error-area.has-locked-error .error-text {
  color: var(--error-color);
  background: var(--error-light);
  border-left-color: var(--error-color);
}

.form-error-area.has-cooldown .error-text {
  color: var(--info-color);
  background: var(--primary-light);
  border-left-color: var(--info-color);
}

.error-text a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}

.error-text a:hover {
  text-decoration: underline;
}

.error-text svg {
  flex-shrink: 0;
}

.locked-message {
  color: var(--error-color);
  font-weight: 600;
}

.form-actions {
  margin-top: 16px;
  width: 100%;
}

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

.auth-button.single-button {
  width: 100%;
  height: 48px;
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

.auth-footer {
  margin-top: 24px;
  text-align: center;
}

.version-info {
  font-size: 11px;
  color: var(--text-tertiary);
  margin: 0;
}

@media (max-width: 480px) {
  .auth-scroll-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    min-height: calc(100vh - 32px);
  }
  
  .auth-card {
    margin: 0;
    width: 100%;
    padding: 24px 20px;
    transform: translateY(0);
  }
  
  .auth-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
  }
  
  .captcha-image {
    width: 100px;
    height: 44px;
  }
  
  .captcha-image-container {
    width: 100px;
  }
  
  .captcha-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .captcha-input-group {
    width: 100%;
  }
  
  .error-text {
    font-size: 12px;
    padding: 6px;
  }
  
  .form-error-area {
    min-height: 20px;
    margin: 6px 0 12px 0;
  }
  
  .form-error-area.has-error,
  .form-error-area.has-cooldown,
  .form-error-area.has-locked-error {
    min-height: 40px;
  }
  
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
  
  .auth-form .form-content {
    min-height: 180px;
  }
  
  .mode-switch {
    font-size: 12px;
  }
  
  .auth-button.single-button {
    height: 44px;
  }
}

.theme-dark .captcha-image {
  border-color: var(--border-primary);
  background: var(--input-bg);
}

.theme-dark .captcha-placeholder {
  color: var(--text-tertiary);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { max-height: 0; opacity: 0; }
  to { max-height: 60px; opacity: 1; }
}
</style>
