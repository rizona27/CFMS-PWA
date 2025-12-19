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
          
          <div class="mode-tabs">
            <button
              class="mode-tab"
              :class="{ active: !isRegistering }"
              @click="switchToLogin"
            >
              登录
            </button>
            <button
              class="mode-tab"
              :class="{ active: isRegistering }"
              @click="switchToRegister"
            >
              注册
            </button>
          </div>
          
          <form v-if="!isRegistering" @submit.prevent="handleLogin" class="auth-form">
            <div class="form-content">
              <div class="form-group with-icon" :class="{
                'has-error': loginErrors.username,
                'has-success': loginForm.username && !loginErrors.username
              }">
                <div class="icon-container">
                  <span class="input-icon">👤</span>
                </div>
                <input
                  v-model="loginForm.username"
                  type="text"
                  placeholder="用户名"
                  required
                  autocomplete="username"
                  class="icon-input"
                  maxlength="10"
                  @input="validateLoginUsername"
                  @blur="handleUsernameBlur"
                />
                <div class="input-actions">
                  <button
                    v-if="loginForm.username"
                    type="button"
                    class="clear-button"
                    @click="loginForm.username = ''; validateLoginUsername()"
                    title="清除"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div class="form-group with-icon password-group" :class="{
                'has-error': loginErrors.password,
                'has-success': loginForm.password && !loginErrors.password
              }">
                <div class="icon-container">
                  <span class="input-icon">🔒</span>
                </div>
                <input
                  v-model="loginForm.password"
                  :type="showLoginPassword ? 'text' : 'password'"
                  placeholder="密码"
                  required
                  autocomplete="current-password"
                  class="icon-input password-input"
                  maxlength="20"
                  @input="validateLoginPassword"
                />
                <div class="input-actions">
                  <button
                    v-if="loginForm.password"
                    type="button"
                    class="clear-button"
                    @click="loginForm.password = ''; validateLoginPassword()"
                    title="清除"
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    class="password-toggle"
                    @click="showLoginPassword = !showLoginPassword"
                    :aria-label="showLoginPassword ? '隐藏密码' : '显示密码'"
                  >
                    <svg v-if="showLoginPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              
              <div v-if="showLoginCaptcha && loginAttempts >= 3" class="form-group captcha-group">
                <div class="captcha-row">
                  <div class="captcha-input-group">
                    <div class="icon-container">
                      <span class="input-icon">🖼️</span>
                    </div>
                    <input
                      v-model="loginForm.captcha_code"
                      type="text"
                      placeholder="验证码"
                      required
                      class="icon-input captcha-input"
                      maxlength="4"
                      @input="handleCaptchaInput('login')"
                    />
                    <div class="input-actions">
                      <button
                        v-if="loginForm.captcha_code"
                        type="button"
                        class="clear-button"
                        @click="loginForm.captcha_code = ''"
                        title="清除"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div class="captcha-image-container">
                    <div class="captcha-image" @click="refreshCaptcha">
                      <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                      <div v-else class="captcha-placeholder">刷新</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="auth-button-area">
                <button type="submit" class="auth-button gradient-button" :disabled="isLoading || hasLoginErrors || !isLoginFormValid">
                  <span class="button-text">
                    {{ isLoading ? '登录中...' : '登录' }}
                  </span>
                  <div v-if="isLoading" class="button-loading">
                    <div class="loading-spinner"></div>
                  </div>
                </button>
              </div>
              
              <div v-if="!isRegistering && loginAttempts > 0 && hasValidAccountForLoginAttempt" class="auth-alerts">
                <div class="attempt-hint">
                  <span class="hint-text">
                    <span v-if="loginAttempts < 5">
                      密码错误{{ loginAttempts }}次，还剩{{ 5 - loginAttempts }}次锁定
                      <span v-if="loginAttempts >= 3">，请输入验证码</span>
                    </span>
                    <span v-else class="locked-message">
                      账户已锁定，请管理员解锁！
                    </span>
                  </span>
                </div>
              </div>
              
              <div class="errors-container" :class="{ 'has-errors': hasLoginErrors }">
                <div v-if="loginErrors.username" class="error-message">
                  {{ loginErrors.username }}
                </div>
                <div v-if="loginErrors.password" class="error-message">
                  {{ loginErrors.password }}
                </div>
              </div>
            </div>
          </form>
          
          <div v-else class="auth-form">
            <div class="form-content">
              <div class="register-steps-container" :class="{ 'step-two-active': registerStep === 2 }">
                <div class="register-step step-one" :class="{ 'slide-left': registerStep === 2 }">
                  <div class="form-group with-icon" :class="{
                    'has-error': registerErrors.username,
                    'has-success': registerForm.username && !registerErrors.username
                  }">
                    <div class="icon-container">
                      <span class="input-icon">👤</span>
                    </div>
                    <input
                      v-model="registerForm.username"
                      type="text"
                      placeholder="用户名"
                      required
                      autocomplete="username"
                      class="icon-input"
                      maxlength="10"
                      @input="validateRegisterUsername"
                    />
                    <div class="input-actions">
                      <button
                        v-if="registerForm.username"
                        type="button"
                        class="clear-button"
                        @click="registerForm.username = ''; validateRegisterUsername()"
                        title="清除"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div class="form-group with-icon password-group" :class="{
                    'has-error': registerErrors.password,
                    'has-success': registerForm.password && !registerErrors.password
                  }">
                    <div class="icon-container">
                      <span class="input-icon">🔒</span>
                    </div>
                    <input
                      v-model="registerForm.password"
                      :type="showRegisterPassword ? 'text' : 'password'"
                      placeholder="密码"
                      required
                      autocomplete="new-password"
                      class="icon-input password-input"
                      maxlength="20"
                      @input="validateRegisterPassword"
                    />
                    <div class="input-actions">
                      <button
                        v-if="registerForm.password"
                        type="button"
                        class="clear-button"
                        @click="registerForm.password = ''; validateRegisterPassword()"
                        title="清除"
                      >
                        ✕
                      </button>
                      <button
                        type="button"
                        class="password-toggle"
                        @click="showRegisterPassword = !showRegisterPassword"
                        :aria-label="showRegisterPassword ? '隐藏密码' : '显示密码'"
                      >
                        <svg v-if="showRegisterPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                
                <div class="register-step step-two" :class="{ 'slide-in': registerStep === 2 }">
                  <div class="form-group with-icon password-group" :class="{
                    'has-error': registerErrors.confirmPassword,
                    'has-success': registerForm.confirmPassword && !registerErrors.confirmPassword
                  }">
                    <div class="icon-container">
                      <span class="input-icon">🔒</span>
                    </div>
                    <input
                      v-model="registerForm.confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      placeholder="确认密码"
                      required
                      autocomplete="new-password"
                      class="icon-input password-input"
                      maxlength="20"
                      @input="validateConfirmPassword"
                    />
                    <div class="input-actions">
                      <button
                        v-if="registerForm.confirmPassword"
                        type="button"
                        class="clear-button"
                        @click="registerForm.confirmPassword = ''; validateConfirmPassword()"
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
                    'has-error': registerErrors.email,
                    'has-success': registerForm.email && !registerErrors.email
                  }">
                    <div class="icon-container">
                      <span class="input-icon">📧</span>
                    </div>
                    <input
                      v-model="registerForm.email"
                      type="email"
                      placeholder="邮箱(选填)"
                      autocomplete="email"
                      class="icon-input"
                      @input="validateRegisterEmail"
                    />
                    <div class="input-actions">
                      <button
                        v-if="registerForm.email"
                        type="button"
                        class="clear-button"
                        @click="registerForm.email = ''; validateRegisterEmail()"
                        title="清除"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div v-if="showRegisterCaptcha && registerAttempts >= 3" class="form-group captcha-group">
                    <div class="captcha-row">
                      <div class="captcha-input-group">
                        <div class="icon-container">
                          <span class="input-icon">🖼️</span>
                        </div>
                        <input
                          v-model="registerForm.captcha_code"
                          type="text"
                          placeholder="验证码"
                          required
                          class="icon-input captcha-input"
                          maxlength="4"
                          @input="handleCaptchaInput('register')"
                        />
                        <div class="input-actions">
                          <button
                            v-if="registerForm.captcha_code"
                            type="button"
                            class="clear-button"
                            @click="registerForm.captcha_code = ''"
                            title="清除"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div class="captcha-image-container">
                        <div class="captcha-image" @click="refreshCaptcha">
                          <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                          <div v-else class="captcha-placeholder">刷新</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="auth-button-area">
                <div v-if="registerStep === 1" class="button-container">
                  <button
                    type="button"
                    class="auth-button gradient-button"
                    @click="handleNextStep"
                    :disabled="isLoading || hasRegisterStep1Errors || !isRegisterStep1Valid"
                  >
                    <span class="button-text">下一步</span>
                  </button>
                </div>
                
                <div v-else class="button-container">
                  <div class="button-group">
                    <button
                      type="button"
                      class="auth-button back-button"
                      @click="registerStep = 1"
                      :disabled="isLoading"
                    >
                      <span class="button-text">返回</span>
                    </button>
                    <button
                      type="button"
                      class="auth-button gradient-button"
                      @click="handleRegister"
                      :disabled="isLoading || hasRegisterStep2Errors || !isRegisterStep2Valid"
                    >
                      <span class="button-text">{{ isLoading ? '注册中...' : '注册' }}</span>
                      <div v-if="isLoading" class="button-loading">
                        <div class="loading-spinner"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-if="isRegistering && registerAttempts > 0 && registerAttempts < 3" class="auth-alerts">
                <div class="attempt-hint">
                  <span class="hint-text">注册失败 {{ registerAttempts }} 次，{{ 3 - registerAttempts }} 次后将需要验证码</span>
                </div>
              </div>
              
              <div class="errors-container" :class="{ 'has-errors': hasRegisterStepErrors }">
                <div v-if="registerStep === 1 && registerErrors.username" class="error-message">
                  {{ registerErrors.username }}
                </div>
                <div v-if="registerStep === 1 && registerErrors.password" class="error-message">
                  {{ registerErrors.password }}
                </div>
                <div v-if="registerStep === 2 && registerErrors.confirmPassword" class="error-message">
                  {{ registerErrors.confirmPassword }}
                </div>
                <div v-if="registerStep === 2 && registerErrors.email" class="error-message">
                  {{ registerErrors.email }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="hint-area">
            <div class="mode-switch">
              <p v-if="!isRegistering">
                还没有账号？
                <a href="#" @click.prevent="switchToRegister">立即注册</a>
              </p>
              <p v-else>
                已有账号？
                <a href="#" @click.prevent="switchToLogin">立即登录</a>
              </p>
            </div>
          </div>
          
          <div class="auth-footer">
            <p class="version-info">CFMS v3.0.0 © 2025 rizona</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const particlesContainer = ref<HTMLElement | null>(null)

const isRegistering = ref(false)
const registerStep = ref(1)
const showLoginCaptcha = ref(false)
const showRegisterCaptcha = ref(false)
const loginAttempts = ref(0)
const registerAttempts = ref(0)
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)
const isAccountLocked = ref(false)
const hasValidAccountForLoginAttempt = ref(false)

const loginErrors = reactive({
  username: '',
  password: ''
})

const registerErrors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

const hasLoginErrors = computed(() => {
  return !!loginErrors.username || !!loginErrors.password
})

const hasRegisterStep1Errors = computed(() => {
  return !!registerErrors.username || !!registerErrors.password
})

const hasRegisterStep2Errors = computed(() => {
  return !!registerErrors.confirmPassword || !!registerErrors.email
})

const hasRegisterStepErrors = computed(() => {
  if (registerStep.value === 1) {
    return hasRegisterStep1Errors.value
  } else {
    return hasRegisterStep2Errors.value
  }
})

const isLoginFormValid = computed(() => {
  return loginForm.value.username.length >= 3 &&
         loginForm.value.password.length >= 6 &&
         (!showLoginCaptcha.value || loginForm.value.captcha_code.length >= 4)
})

const isRegisterStep1Valid = computed(() => {
  return registerForm.value.username.length >= 3 &&
         registerForm.value.password.length >= 6
})

const isRegisterStep2Valid = computed(() => {
  return registerForm.value.confirmPassword === registerForm.value.password &&
         (!registerForm.value.email || validateEmailFormat(registerForm.value.email)) &&
         (!showRegisterCaptcha.value || registerForm.value.captcha_code.length >= 4)
})

const LOGIN_ATTEMPTS_KEY = 'cfms_login_attempts'
const REGISTER_ATTEMPTS_KEY = 'cfms_register_attempts'
const ACCOUNT_LOCKED_KEY = 'cfms_account_locked'
const ATTEMPTS_TIMESTAMP_KEY = 'cfms_attempts_timestamp'
const VALID_ACCOUNT_FOR_ATTEMPTS_KEY = 'cfms_valid_account_for_attempts'
const ATTEMPTS_EXPIRY_MS = 30 * 60 * 1000

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  captcha_code: '',
  captcha_id: ''
})

const loginForm = ref({
  username: '',
  password: '',
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

const isLoading = computed(() => authStore.isLoading)
const captchaImage = computed(() => authStore.captchaImage)

const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleCaptchaInput = (type: 'login' | 'register') => {
  if (type === 'login') {
    if (loginForm.value.captcha_code.length > 4) {
      loginForm.value.captcha_code = loginForm.value.captcha_code.slice(0, 4)
    }
  } else {
    if (registerForm.value.captcha_code.length > 4) {
      registerForm.value.captcha_code = registerForm.value.captcha_code.slice(0, 4)
    }
  }
}

const validateLoginUsername = () => {
  const username = loginForm.value.username
  if (!username) {
    loginErrors.username = '请输入用户名'
  } else if (username.length < 3) {
    loginErrors.username = '用户名至少需要3个字符'
  } else if (username.length > 10) {
    loginErrors.username = '用户名不能超过10个字符'
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    loginErrors.username = '用户名只能包含字母、数字和下划线'
  } else {
    loginErrors.username = ''
  }
}

const validateLoginPassword = () => {
  const password = loginForm.value.password
  if (!password) {
    loginErrors.password = '请输入密码'
  } else if (password.length < 6) {
    loginErrors.password = '密码至少需要6个字符'
  } else if (password.length > 20) {
    loginErrors.password = '密码不能超过20个字符'
  } else {
    loginErrors.password = ''
  }
}

const validateRegisterUsername = () => {
  const username = registerForm.value.username
  if (!username) {
    registerErrors.username = '请输入用户名'
  } else if (username.length < 3) {
    registerErrors.username = '用户名至少需要3个字符'
  } else if (username.length > 10) {
    registerErrors.username = '用户名不能超过10个字符'
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    registerErrors.username = '用户名只能包含字母、数字和下划线'
  } else {
    registerErrors.username = ''
  }
}

const validateRegisterPassword = () => {
  const password = registerForm.value.password
  if (!password) {
    registerErrors.password = '请输入密码'
  } else if (password.length < 6) {
    registerErrors.password = '密码至少需要6个字符'
  } else if (password.length > 20) {
    registerErrors.password = '密码不能超过20个字符'
  } else {
    registerErrors.password = ''
  }
}

const validateConfirmPassword = () => {
  const confirm = registerForm.value.confirmPassword
  const password = registerForm.value.password
  if (!confirm) {
    registerErrors.confirmPassword = '请确认密码'
  } else if (password !== confirm) {
    registerErrors.confirmPassword = '两次输入的密码不一致'
  } else {
    registerErrors.confirmPassword = ''
  }
}

const validateRegisterEmail = () => {
  const email = registerForm.value.email
  if (email && !validateEmailFormat(email)) {
    registerErrors.email = '邮箱格式不正确'
  } else {
    registerErrors.email = ''
  }
}

const isAttemptsExpired = (timestamp: number) => {
  return Date.now() - timestamp > ATTEMPTS_EXPIRY_MS
}

const checkAccountLocked = () => {
  try {
    const locked = localStorage.getItem(ACCOUNT_LOCKED_KEY)
    if (locked) {
      const lockData = JSON.parse(locked)
      if (lockData.expiry && Date.now() > lockData.expiry) {
        localStorage.removeItem(ACCOUNT_LOCKED_KEY)
        localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
        localStorage.removeItem(VALID_ACCOUNT_FOR_ATTEMPTS_KEY)
        isAccountLocked.value = false
        loginAttempts.value = 0
        hasValidAccountForLoginAttempt.value = false
        return false
      }
      isAccountLocked.value = true
      return true
    }
    return false
  } catch (error) {
    console.error('检查账户锁定状态失败:', error)
    return false
  }
}

const lockAccount = () => {
  try {
    const lockData = {
      lockedAt: Date.now(),
      expiry: Date.now() + (24 * 60 * 60 * 1000)
    }
    localStorage.setItem(ACCOUNT_LOCKED_KEY, JSON.stringify(lockData))
    isAccountLocked.value = true
  } catch (error) {
    console.error('锁定账户失败:', error)
  }
}

const loadAttempts = () => {
  try {
    checkAccountLocked()
    
    const timestampStr = localStorage.getItem(ATTEMPTS_TIMESTAMP_KEY)
    if (timestampStr) {
      const timestamp = parseInt(timestampStr)
      if (isAttemptsExpired(timestamp)) {
        clearAttempts()
        return
      }
    }
    
    const loginAttemptsStr = localStorage.getItem(LOGIN_ATTEMPTS_KEY)
    if (loginAttemptsStr) {
      loginAttempts.value = parseInt(loginAttemptsStr)
      showLoginCaptcha.value = loginAttempts.value >= 3
    }
    
    const registerAttemptsStr = localStorage.getItem(REGISTER_ATTEMPTS_KEY)
    if (registerAttemptsStr) {
      registerAttempts.value = parseInt(registerAttemptsStr)
      showRegisterCaptcha.value = registerAttempts.value >= 3
    }
    
    const validAccountStr = localStorage.getItem(VALID_ACCOUNT_FOR_ATTEMPTS_KEY)
    if (validAccountStr) {
      hasValidAccountForLoginAttempt.value = validAccountStr === 'true'
    }
  } catch (error) {
    console.error('加载尝试次数失败:', error)
  }
}

const saveAttempts = () => {
  try {
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, loginAttempts.value.toString())
    localStorage.setItem(REGISTER_ATTEMPTS_KEY, registerAttempts.value.toString())
    localStorage.setItem(ATTEMPTS_TIMESTAMP_KEY, Date.now().toString())
    localStorage.setItem(VALID_ACCOUNT_FOR_ATTEMPTS_KEY, hasValidAccountForLoginAttempt.value.toString())
  } catch (error) {
    console.error('保存尝试次数失败:', error)
  }
}

const clearAttempts = () => {
  loginAttempts.value = 0
  registerAttempts.value = 0
  showLoginCaptcha.value = false
  showRegisterCaptcha.value = false
  isAccountLocked.value = false
  hasValidAccountForLoginAttempt.value = false
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
  localStorage.removeItem(REGISTER_ATTEMPTS_KEY)
  localStorage.removeItem(ACCOUNT_LOCKED_KEY)
  localStorage.removeItem(ATTEMPTS_TIMESTAMP_KEY)
  localStorage.removeItem(VALID_ACCOUNT_FOR_ATTEMPTS_KEY)
}

const clearSpecificAttempts = (isRegister: boolean) => {
  if (isRegister) {
    registerAttempts.value = 0
    showRegisterCaptcha.value = false
    localStorage.removeItem(REGISTER_ATTEMPTS_KEY)
  } else {
    loginAttempts.value = 0
    showLoginCaptcha.value = false
    hasValidAccountForLoginAttempt.value = false
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
    localStorage.removeItem(ACCOUNT_LOCKED_KEY)
    localStorage.removeItem(VALID_ACCOUNT_FOR_ATTEMPTS_KEY)
    isAccountLocked.value = false
  }
}

const systemThemeMediaQuery = ref<MediaQueryList | null>(null)
const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  systemTheme.value = e.matches ? 'dark' : 'light'
  if (themeMode.value === 'system') {
    applyTheme('system')
  }
}

// 检查用户名是否存在
const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/check_user_exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    })
    
    if (!response.ok) {
      console.error('检查用户名存在性失败:', response.statusText)
      return false
    }
    
    const data = await response.json()
    return data.success && data.exists
  } catch (error) {
    console.error('检查用户名存在性异常:', error)
    return false
  }
}

// 处理用户名失焦事件
const handleUsernameBlur = async () => {
  if (!loginForm.value.username) return
  
  validateLoginUsername()
  if (loginErrors.username) return
  
  const exists = await checkUsernameExists(loginForm.value.username)
  if (!exists) {
    loginErrors.username = '用户名不存在'
  }
}

onMounted(() => {
  if (window.location.pathname === '/404' || window.location.pathname === '/auth') {
    if (window.location.pathname !== '/auth') {
      history.replaceState(null, '', '/auth')
    }
  }
  
  loadAttempts()
  initTheme()
  
  window.addEventListener('storage', handleThemeChange)
  
  systemThemeMediaQuery.value = window.matchMedia('(prefers-color-scheme: dark)')
  systemTheme.value = systemThemeMediaQuery.value.matches ? 'dark' : 'light'
  systemThemeMediaQuery.value.addEventListener('change', handleSystemThemeChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleThemeChange)
  if (systemThemeMediaQuery.value) {
    systemThemeMediaQuery.value.removeEventListener('change', handleSystemThemeChange)
  }
})

const initTheme = () => {
  const savedTheme = localStorage.getItem('theme_mode') || 'system'
  themeMode.value = savedTheme
  applyTheme(savedTheme)
}

const handleThemeChange = (e: StorageEvent) => {
  if (e.key === 'theme_mode') {
    const newTheme = e.newValue || 'system'
    if (themeMode.value !== newTheme) {
      themeMode.value = newTheme
      applyTheme(newTheme)
    }
  }
}

const applyTheme = (theme: string) => {
  const root = document.documentElement
  root.classList.remove('theme-dark', 'theme-light', 'theme-system')
  
  let effectiveTheme = theme
  if (theme === 'system') {
    effectiveTheme = systemTheme.value
  }
  
  if (effectiveTheme === 'dark') {
    root.classList.add('theme-dark')
  } else if (effectiveTheme === 'light') {
    root.classList.add('theme-light')
  } else {
    root.classList.add('theme-system')
  }
}

const resetForm = () => {
  if (isRegistering.value) {
    registerForm.value = {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      captcha_code: '',
      captcha_id: ''
    }
    registerStep.value = 1
    showRegisterPassword.value = false
    showConfirmPassword.value = false
    Object.keys(registerErrors).forEach(key => {
      registerErrors[key as keyof typeof registerErrors] = ''
    })
  } else {
    loginForm.value = {
      username: '',
      password: '',
      captcha_code: '',
      captcha_id: ''
    }
    showLoginPassword.value = false
    Object.keys(loginErrors).forEach(key => {
      loginErrors[key as keyof typeof loginErrors] = ''
    })
  }
}

const refreshCaptcha = async () => {
  await authStore.getCaptcha()
  if (isRegistering.value) {
    registerForm.value.captcha_id = authStore.captchaId
  } else {
    loginForm.value.captcha_id = authStore.captchaId
  }
}

const switchToLogin = () => {
  isRegistering.value = false
  resetForm()
  showLoginCaptcha.value = loginAttempts.value >= 3
  if (showLoginCaptcha.value) {
    refreshCaptcha()
  }
}

const switchToRegister = async () => {
  isRegistering.value = true
  resetForm()
  showRegisterCaptcha.value = registerAttempts.value >= 3
  if (showRegisterCaptcha.value) {
    await authStore.getCaptcha()
    registerForm.value.captcha_id = authStore.captchaId
  }
}

const handleNextStep = () => {
  validateRegisterUsername()
  validateRegisterPassword()
  
  if (registerErrors.username || registerErrors.password) {
    return
  }
  
  registerStep.value = 2
}

const handleLogin = async () => {
  try {
    validateLoginUsername()
    validateLoginPassword()
    
    if (loginErrors.username || loginErrors.password) {
      return
    }
    
    if (checkAccountLocked()) {
      loginErrors.password = '账户已锁定，请管理员解锁！'
      return
    }
    
    const normalizedUsername = loginForm.value.username.toLowerCase()
    const needCaptcha = loginAttempts.value >= 3
    
    // 第一步：检查用户名是否存在
    const usernameExists = await checkUsernameExists(normalizedUsername)
    if (!usernameExists) {
      loginErrors.username = '用户名不存在'
      return
    }
    
    // 第二步：如果有验证码要求，验证验证码
    if (needCaptcha) {
      if (!loginForm.value.captcha_code || loginForm.value.captcha_code.length < 4) {
        loginErrors.password = '请输入4位验证码'
        return
      }
      
      if (!authStore.captchaId) {
        await authStore.getCaptcha()
        loginForm.value.captcha_id = authStore.captchaId
        loginErrors.password = '请重新输入验证码'
        return
      }
    }
    
    const success = await authStore.login(
      normalizedUsername,
      loginForm.value.password,
      needCaptcha ? loginForm.value.captcha_code : '',
      needCaptcha ? loginForm.value.captcha_id : ''
    )
    
    if (success) {
      clearSpecificAttempts(false)
      
      router.replace('/config').catch(() => {
        router.replace('/')
      })
      
    } else {
      // 用户名存在，密码错误，增加尝试次数
      if (!hasValidAccountForLoginAttempt.value) {
        hasValidAccountForLoginAttempt.value = true
      }
      
      loginAttempts.value++
      saveAttempts()
      
      if (loginAttempts.value >= 5) {
        lockAccount()
        loginErrors.password = '账户已锁定，请管理员解锁！'
      } else {
        if (loginAttempts.value >= 3) {
          showLoginCaptcha.value = true
          await authStore.getCaptcha()
          loginForm.value.captcha_id = authStore.captchaId
        }
      }
    }
    
  } catch (error: any) {
    console.error('登录失败:', error)
  }
}

const handleRegister = async () => {
  try {
    validateConfirmPassword()
    validateRegisterEmail()
    
    if (registerErrors.confirmPassword || registerErrors.email) {
      return
    }
    
    const needCaptcha = registerAttempts.value >= 3
    
    if (needCaptcha && (!registerForm.value.captcha_code || registerForm.value.captcha_code.length < 4)) {
      registerErrors.confirmPassword = '请输入4位验证码'
      return
    }
    
    if (needCaptcha && !authStore.captchaId) {
      await authStore.getCaptcha()
      registerForm.value.captcha_id = authStore.captchaId
      registerErrors.confirmPassword = '请重新输入验证码'
      return
    }
    
    const registerData = {
      username: registerForm.value.username,
      password: registerForm.value.password,
      email: registerForm.value.email || '',
      captcha_code: needCaptcha ? registerForm.value.captcha_code : '',
      captcha_id: needCaptcha ? registerForm.value.captcha_id : ''
    }
    
    const success = await authStore.register(registerData)
    
    if (success) {
      clearSpecificAttempts(true)
      router.replace('/config')
    } else {
      registerAttempts.value++
      saveAttempts()
      
      if (registerAttempts.value >= 3) {
        showRegisterCaptcha.value = true
        await authStore.getCaptcha()
        registerForm.value.captcha_id = authStore.captchaId
      }
    }
    
  } catch (error: any) {
    console.error('注册失败:', error)
  }
}
</script>

<style scoped>
.auth-view {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transition: background 0.5s ease;
  padding-top: env(safe-area-inset-top);
}

.theme-dark .auth-view {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.background-fx {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.geometric-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.4;
  animation: gridMove 60s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(40px, 40px); }
}

.theme-dark .geometric-grid {
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px);
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  filter: blur(20px);
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 5%;
  animation: floatShape 25s ease-in-out infinite;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation: floatShape 30s ease-in-out infinite reverse;
}

.shape-3 {
  width: 120px;
  height: 120px;
  bottom: 20%;
  left: 15%;
  animation: floatShape 35s ease-in-out infinite;
}

.shape-4 {
  width: 180px;
  height: 180px;
  top: 20%;
  right: 15%;
  animation: floatShape 40s ease-in-out infinite reverse;
}

.shape-5 {
  width: 100px;
  height: 100px;
  bottom: 10%;
  right: 20%;
  animation: floatShape 28s ease-in-out infinite;
}

@keyframes floatShape {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(30px, -20px) rotate(90deg); }
  50% { transform: translate(-20px, 30px) rotate(180deg); }
  75% { transform: translate(20px, 20px) rotate(270deg); }
}

.theme-dark .shape {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
}

.gradient-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
  background:
    radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 40%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
  pointer-events: none;
}

.theme-dark .gradient-overlay {
  background:
    radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 40%),
    linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, transparent 100%);
}

.auth-scroll-container {
  width: 100%;
  min-height: calc(100vh - env(safe-area-inset-top));
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  z-index: 10;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.logo-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-title {
  text-align: center;
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.3px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding-bottom: 8px;
}

.theme-dark .auth-title {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.fade-in-down {
  animation: fadeInDown 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translate3d(0, -20px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}

.mode-tabs {
  display: flex;
  margin-bottom: 25px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.theme-dark .mode-tabs {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(51, 65, 85, 0.8);
}

.mode-tab {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border-radius: 10px;
  color: #64748b;
  z-index: 1;
}

.theme-dark .mode-tab {
  color: #94a3b8;
}

.mode-tab:hover {
  color: #6366f1;
}

.theme-dark .mode-tab:hover {
  color: #a78bfa;
}

.mode-tab.active {
  font-weight: 600;
  color: #6366f1;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.theme-dark .mode-tab.active {
  color: #a78bfa;
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(167, 139, 250, 0.3);
}

.auth-card {
  border-radius: 20px;
  padding: 32px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 0 0 1px rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  background: rgba(255, 255, 255, 0.85);
}

.theme-dark .auth-card {
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.auth-form {
  margin-bottom: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 240px;
}

.form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-alerts {
  margin-top: 0;
  margin-bottom: 0;
  min-height: 32px;
  display: flex;
  align-items: center;
}

.attempt-hint {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.15);
  backdrop-filter: blur(4px);
  width: 100%;
  line-height: 1.3;
}

.theme-dark .attempt-hint {
  background: rgba(99, 102, 241, 0.12);
  color: #a78bfa;
  border: 1px solid rgba(167, 139, 250, 0.2);
}

.attempt-hint .locked-message {
  color: #ef4444;
  font-weight: 600;
}

.theme-dark .attempt-hint .locked-message {
  color: #f87171;
}

.hint-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 修复错误容器样式，使用固定高度防止抖动 */
.errors-container {
  margin: 0;
  transition: all 0.3s ease;
  opacity: 0;
  height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
}

.errors-container.has-errors {
  opacity: 1;
  height: auto;
  min-height: 44px;
  margin-top: 4px;
  margin-bottom: 8px;
}

.error-message {
  font-size: 12px;
  color: #dc2626;
  padding: 8px 10px;
  border-radius: 8px;
  background-color: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.15);
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(4px);
  line-height: 1.4;
  min-height: 34px;
  display: flex;
  align-items: center;
}

.theme-dark .error-message {
  color: #f87171;
  background-color: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 修复按钮高度不一致问题 */
.auth-button-area {
  margin-top: 8px;
  margin-bottom: 0;
  padding-top: 0;
  position: relative;
  min-height: 46px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.button-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin: 0;
}

/* 修复注册容器高度问题 */
.register-steps-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  min-height: 120px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  margin-bottom: 0;
  position: relative;
}

.form-group.with-icon {
  display: flex;
  align-items: center;
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  min-height: 46px;
  position: relative;
  z-index: 1;
}

/* 修复注册页面框体边框被截断的问题 */
.register-step .form-group.with-icon {
  z-index: 2;
  position: relative;
}

.theme-dark .form-group.with-icon {
  background-color: rgba(30, 41, 59, 0.9);
  border: 1px solid #475569;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.form-group.with-icon.has-success {
  border-color: #10b981;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
}

.theme-dark .form-group.with-icon.has-success {
  border-color: #34d399;
  box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.3);
}

.form-group.with-icon.has-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.2);
  z-index: 3; /* 提高错误状态的z-index */
}

.theme-dark .form-group.with-icon.has-error {
  border-color: #f87171;
  box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.3);
}

.form-group.with-icon:focus-within {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1), 0 0 0 2px rgba(99, 102, 241, 0.15);
  border-color: #6366f1;
  transform: translateY(-1px);
  z-index: 4; /* 提高焦点状态的z-index */
}

.theme-dark .form-group.with-icon:focus-within {
  background-color: rgba(40, 51, 69, 0.95);
  border-color: #8b5cf6;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  margin-right: 10px;
  font-size: 16px;
  transition: color 0.3s ease;
  color: #64748b;
}

.theme-dark .icon-container {
  color: #94a3b8;
}

.icon-input {
  flex: 1;
  padding: 12px 0;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
  font-weight: 500;
  transition: color 0.3s ease;
  color: #1e293b;
  width: 100%;
}

.theme-dark .icon-input {
  color: #f8fafc;
}

.password-input {
  padding-right: 50px;
}

.icon-input::placeholder {
  font-weight: 400;
  transition: color 0.3s ease;
  color: #94a3b8;
}

.theme-dark .icon-input::placeholder {
  color: #64748b;
}

.input-actions {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
}

.clear-button {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: #94a3b8;
  font-size: 14px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-button:hover {
  color: #64748b;
  background-color: rgba(99, 102, 241, 0.08);
}

.theme-dark .clear-button {
  color: #94a3b8;
}

.theme-dark .clear-button:hover {
  color: #cbd5e1;
  background-color: rgba(99, 102, 241, 0.12);
}

.password-group .input-actions {
  right: 12px;
  gap: 8px;
}

.password-toggle {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #94a3b8;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  margin: 0;
}

.theme-dark .password-toggle {
  color: #94a3b8;
}

.password-toggle:hover {
  background-color: rgba(99, 102, 241, 0.08);
  color: #6366f1;
}

.theme-dark .password-toggle:hover {
  background-color: rgba(99, 102, 241, 0.12);
  color: #a78bfa;
}

.password-toggle:active {
  transform: scale(0.95);
}

.button-loading {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.register-step {
  width: 100%;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.register-step.step-one {
  transform: translateX(0);
  opacity: 1;
}

.register-step.step-one.slide-left {
  transform: translateX(-100%);
  opacity: 0;
}

.register-step.step-two {
  transform: translateX(100%);
  opacity: 0;
}

.register-step.step-two.slide-in {
  transform: translateX(0);
  opacity: 1;
}

.button-group {
  display: flex;
  gap: 10px;
  width: 100%;
  margin: 0;
}

.button-group .back-button,
.button-group .auth-button {
  flex: 1;
  min-width: 0;
  position: relative;
}

.back-button {
  padding: 11px 16px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
  letter-spacing: 0.3px;
  position: relative;
  overflow: hidden;
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(99, 102, 241, 0.15);
  width: 100%;
  backdrop-filter: blur(4px);
}

.theme-dark .back-button {
  background: rgba(99, 102, 241, 0.12);
  color: #a78bfa;
  border: 1px solid rgba(167, 139, 250, 0.2);
}

.back-button:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.12);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);
}

.theme-dark .back-button:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.16);
}

.back-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.back-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.captcha-group {
  margin-top: 0;
  width: 100%;
}

.captcha-row {
  display: flex;
  gap: 10px;
  align-items: stretch;
  width: 100%;
  box-sizing: border-box;
}

.captcha-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  border-radius: 12px;
  padding: 0 14px;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  min-height: 46px;
  min-width: 0;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
}

.theme-dark .captcha-input-group {
  background-color: rgba(30, 41, 59, 0.9);
  border: 1px solid #475569;
}

.captcha-input-group:focus-within {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15), 0 4px 12px rgba(99, 102, 241, 0.08);
  border-color: #6366f1;
}

.theme-dark .captcha-input-group:focus-within {
  background-color: rgba(40, 51, 69, 0.95);
  border-color: #8b5cf6;
}

.captcha-input-group .input-actions {
  right: 10px;
}

.captcha-input-group .clear-button {
  width: 18px;
  height: 18px;
}

.captcha-image-container {
  flex: 1;
  min-width: 110px;
  max-width: 130px;
  display: flex;
  align-items: center;
}

.captcha-image {
  width: 100%;
  height: 46px;
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
}

.theme-dark .captcha-image {
  background-color: rgba(30, 41, 59, 0.9);
  border: 1px solid #475569;
}

.captcha-image:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  border-color: #6366f1;
}

.theme-dark .captcha-image:hover {
  border-color: #8b5cf6;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-placeholder {
  font-size: 13px;
  font-weight: 500;
  transition: color 0.3s ease;
  color: #6366f1;
}

.theme-dark .captcha-placeholder {
  color: #a78bfa;
}

.auth-button {
  width: 100%;
  padding: 11px 16px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
  letter-spacing: 0.3px;
  position: relative;
  overflow: hidden;
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.15);
  backdrop-filter: blur(4px);
}

.gradient-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.theme-dark .gradient-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.gradient-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.theme-dark .gradient-button:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.gradient-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(99, 102, 241, 0.25);
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

.auth-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.auth-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.hint-area {
  min-height: 25px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: 8px;
}

.mode-switch {
  margin-top: 0;
  text-align: center;
  font-size: 13px;
  padding-top: 12px;
  border-top: 1px solid;
  transition: all 0.3s ease;
  color: #64748b;
  border-top-color: rgba(99, 102, 241, 0.15);
}

.theme-dark .mode-switch {
  color: #94a3b8;
  border-top-color: rgba(255, 255, 255, 0.08);
}

.mode-switch a {
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
  padding: 3px 8px;
  border-radius: 6px;
  transition: all 0.3s;
  color: #6366f1;
}

.theme-dark .mode-switch a {
  color: #a78bfa;
}

.mode-switch a:hover {
  text-decoration: none;
  background: rgba(99, 102, 241, 0.08);
}

.theme-dark .mode-switch a:hover {
  background: rgba(167, 139, 250, 0.12);
}

.auth-footer {
  margin-top: 12px;
  text-align: center;
  font-size: 11px;
  padding-top: 12px;
  border-top: 1px solid;
  transition: all 0.3s ease;
  color: #94a3b8;
  border-top-color: rgba(99, 102, 241, 0.15);
}

.theme-dark .auth-footer {
  color: #64748b;
  border-top-color: rgba(255, 255, 255, 0.08);
}

.version-info {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.3px;
  opacity: 0.8;
}

@media (max-height: 700px) {
  .auth-card { padding: 28px 24px; min-height: 380px; }
  .auth-title { font-size: 26px; margin-bottom: 24px; }
  .mode-tabs { margin-bottom: 20px; }
  .form-content { gap: 10px; }
  .form-group.with-icon { padding: 0 14px; min-height: 44px; }
  .icon-input { padding: 11px 0; font-size: 13px; }
  .password-input { padding-right: 45px; }
  .captcha-input-group, .captcha-image { height: 44px; min-height: 44px; }
  .captcha-image-container { min-width: 100px; }
  .auth-button, .back-button { padding: 10px 14px; font-size: 13px; }
  .register-steps-container { min-height: 110px; gap: 10px; }
  .auth-form { min-height: 200px; }
  .auth-button-area { min-height: 42px; margin-top: 8px; }
  .hint-area { min-height: 20px; margin-top: 8px; }
  .errors-container.has-errors { min-height: 40px; }
}

@media (max-width: 480px) {
  .auth-container { padding: 16px; max-width: 100%; }
  .auth-card { padding: 28px 24px; min-height: 400px; }
  .auth-title { font-size: 26px; }
  .mode-tab { font-size: 14px; padding: 10px; }
  .form-content { gap: 10px; }
  .captcha-row { flex-direction: row; gap: 8px; }
  .captcha-input-group { flex: 2; height: 44px; min-height: 44px; }
  .captcha-image-container { flex: 1; min-width: 100px; max-width: 120px; }
  .captcha-image { height: 44px; min-height: 44px; }
  .auth-button, .back-button { padding: 10px 14px; font-size: 13px; }
  .mode-switch { font-size: 12px; }
  .attempt-hint { font-size: 12px; padding: 8px 10px; }
  .register-steps-container { min-height: 110px; gap: 10px; }
  .auth-form { min-height: 220px; }
  .button-group {
    gap: 8px;
    margin: 0;
  }
  .auth-button-area { min-height: 44px; margin-top: 8px; }
  .hint-area { min-height: 22px; margin-top: 8px; }
  .errors-container.has-errors { min-height: 40px; }
}

@media (max-height: 500px) and (orientation: landscape) {
  .auth-scroll-container { align-items: flex-start; padding-top: 10px; }
  .auth-card { min-height: 340px; padding: 24px 28px; }
  .auth-title { font-size: 24px; margin-bottom: 20px; }
  .form-content { gap: 8px; }
  .form-group.with-icon { padding: 0 12px; min-height: 42px; }
  .icon-input { padding: 10px 0; font-size: 13px; }
  .password-input { padding-right: 40px; }
  .captcha-row { gap: 6px; }
  .captcha-input-group, .captcha-image { height: 42px; min-height: 42px; }
  .register-steps-container { min-height: 90px; gap: 8px; }
  .auth-form { min-height: 160px; }
  .button-group {
    gap: 6px;
    margin: 0;
  }
  .auth-button-area { min-height: 40px; margin-top: 8px; }
  .hint-area { min-height: 20px; margin-top: 8px; }
  .errors-container.has-errors { min-height: 36px; }
}
</style>
