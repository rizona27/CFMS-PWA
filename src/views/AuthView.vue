<template>
  <div class="auth-view" :class="themeClass">
    <div class="background-fx">
      <div class="grid-overlay"></div>
    </div>
    
    <div class="auth-scroll-container">
      <div class="auth-container">
        <div class="auth-card fade-in-down">
          <h1 class="auth-title">CFMS · 一基暴富</h1>
          
          <div v-if="isDevEnvironment" class="dev-environment-banner">
            <span class="dev-icon">🔧</span>
            <span class="dev-text">开发环境 - 使用模拟登录</span>
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
                    <svg v-if="showLoginPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div v-if="isDevEnvironment" class="dev-accounts">
                <p class="dev-accounts-title">测试账号：</p>
                <p class="dev-account">admin / 任意密码 (VIP权限)</p>
                <p class="dev-account">user / 任意密码 (体验用户)</p>
                <p class="dev-account">guest / 任意密码 (基础用户)</p>
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
              
              <div v-if="!isRegistering && loginAttempts > 0" class="auth-alerts">
                <div class="attempt-hint">
                  <span class="hint-icon">⚠️</span>
                  <span class="hint-text">
                    <span v-if="loginAttempts < 5">
                      密码输入错误 {{ loginAttempts }} 次，{{ 5 - loginAttempts }} 次后账户将被锁定。
                      <span v-if="loginAttempts >= 3">请输入验证码。</span>
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
                        <svg v-if="showRegisterPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                        <svg v-if="showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              
              <div v-if="isRegistering && registerAttempts > 0 && registerAttempts < 3" class="auth-alerts">
                <div class="attempt-hint">
                  <span class="hint-icon">⚠️</span>
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

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

const isDevEnvironment = computed(() => {
  return import.meta.env.DEV || window.location.hostname === 'localhost'
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
        isAccountLocked.value = false
        loginAttempts.value = 0
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
  } catch (error) {
    console.error('加载尝试次数失败:', error)
  }
}

const saveAttempts = () => {
  try {
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, loginAttempts.value.toString())
    localStorage.setItem(REGISTER_ATTEMPTS_KEY, registerAttempts.value.toString())
    localStorage.setItem(ATTEMPTS_TIMESTAMP_KEY, Date.now().toString())
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
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
  localStorage.removeItem(REGISTER_ATTEMPTS_KEY)
  localStorage.removeItem(ACCOUNT_LOCKED_KEY)
  localStorage.removeItem(ATTEMPTS_TIMESTAMP_KEY)
}

const clearSpecificAttempts = (isRegister: boolean) => {
  if (isRegister) {
    registerAttempts.value = 0
    showRegisterCaptcha.value = false
    localStorage.removeItem(REGISTER_ATTEMPTS_KEY)
  } else {
    loginAttempts.value = 0
    showLoginCaptcha.value = false
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
    localStorage.removeItem(ACCOUNT_LOCKED_KEY)
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
  if (showLoginCaptcha.value && !isDevEnvironment.value) {
    refreshCaptcha()
  }
}

const switchToRegister = async () => {
  isRegistering.value = true
  resetForm()
  showRegisterCaptcha.value = registerAttempts.value >= 3
  if (showRegisterCaptcha.value && !isDevEnvironment.value) {
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
    
    if (needCaptcha && (!loginForm.value.captcha_code || loginForm.value.captcha_code.length < 4)) {
      loginErrors.password = '请输入4位验证码'
      return
    }
    
    if (needCaptcha && !authStore.captchaId) {
      await authStore.getCaptcha()
      loginForm.value.captcha_id = authStore.captchaId
      loginErrors.password = '请重新输入验证码'
      return
    }
    
    if (isDevEnvironment.value) {
      const success = authStore.mockLogin(normalizedUsername, loginForm.value.password)
      if (success) {
        clearSpecificAttempts(false)
        
        router.replace('/config').catch(() => {
          router.replace('/')
        })
      } else {
        loginAttempts.value++
        saveAttempts()
        
        if (loginAttempts.value >= 5) {
          lockAccount()
          loginErrors.password = '账户已锁定，请管理员解锁！'
        } else {
          if (loginAttempts.value >= 3) {
            showLoginCaptcha.value = true
            if (!isDevEnvironment.value) {
              await authStore.getCaptcha()
              loginForm.value.captcha_id = authStore.captchaId
            }
          }
          
          loginErrors.password = authStore.error || '登录失败，请检查用户名和密码'
          
          if (needCaptcha && authStore.error && authStore.error.includes('验证码')) {
          } else if (needCaptcha) {
            await refreshCaptcha()
            loginForm.value.captcha_code = ''
          }
        }
      }
      return
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
      loginAttempts.value++
      saveAttempts()
      
      if (loginAttempts.value >= 5) {
        lockAccount()
        loginErrors.password = '账户已锁定，请管理员解锁！'
      } else {
        if (loginAttempts.value >= 3) {
          showLoginCaptcha.value = true
          if (!isDevEnvironment.value) {
            await authStore.getCaptcha()
            loginForm.value.captcha_id = authStore.captchaId
          }
        }
        
        loginErrors.password = authStore.error || '登录失败，请检查用户名和密码'
        
        if (needCaptcha) {
          await refreshCaptcha()
          loginForm.value.captcha_code = ''
        }
      }
    }
    
  } catch (error: any) {
    if (isDevEnvironment.value && error.message && error.message.includes('fetch')) {
      const normalizedUsername = loginForm.value.username.toLowerCase()
      const success = authStore.mockLogin(normalizedUsername, loginForm.value.password)
      if (success) {
        clearSpecificAttempts(false)
        router.replace('/config').catch(() => {
          router.replace('/')
        })
      } else {
        loginAttempts.value++
        saveAttempts()
        loginErrors.password = '登录失败，请使用测试账号：admin, user, guest'
      }
    } else {
      loginErrors.password = `登录失败: ${error.message || '请检查网络连接和服务器状态'}`
    }
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
    
    if (isDevEnvironment.value) {
      const success = authStore.mockLogin(registerForm.value.username, registerForm.value.password)
      if (success) {
        clearSpecificAttempts(true)
        router.replace('/config')
        return
      }
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
      
      registerErrors.confirmPassword = authStore.error || '注册失败'
      
      if (needCaptcha) {
        await refreshCaptcha()
        registerForm.value.captcha_code = ''
      }
    }
    
  } catch (error: any) {
    registerErrors.confirmPassword = `注册失败: ${error.message || '请检查网络连接和服务器状态'}`
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
  background-color: #eef5ff;
  transition: background-color 0.5s ease;
  padding-top: env(safe-area-inset-top);
}

.theme-dark .auth-view {
  background-color: #1a2332;
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

.grid-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-image:
    linear-gradient(rgba(150, 180, 220, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(150, 180, 220, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
  mask-image: radial-gradient(circle at center, black 50%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle at center, black 50%, transparent 100%);
  pointer-events: none;
}

.theme-dark .grid-overlay {
  background-image:
    linear-gradient(rgba(100, 140, 200, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 140, 200, 0.03) 1px, transparent 1px);
}

.dev-environment-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 15px;
  background: #5a8dee;
  color: white;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  animation: pulse 2s infinite;
}

.dev-icon {
  font-size: 14px;
}

.dev-text {
  flex: 1;
  text-align: center;
}

@keyframes pulse {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; }
}

.dev-accounts {
  margin: 10px 0 15px;
  padding: 12px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.dev-accounts-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #4caf50;
}

.dev-account {
  font-size: 12px;
  margin: 3px 0;
  color: #666;
  padding-left: 8px;
  position: relative;
}

.theme-dark .dev-account {
  color: #aaa;
}

.dev-account::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #4caf50;
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

.auth-card {
  border-radius: 16px;
  padding: 40px 35px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 520px;
  background-color: rgba(255, 255, 255, 0.9);
}

.theme-dark .auth-card {
  background-color: rgba(30, 38, 54, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.fade-in-down {
  animation: fadeInDown 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translate3d(0, -60px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}

.auth-title {
  text-align: center;
  margin-bottom: 35px;
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #5a8dee, #7baaf7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: inline-block;
}

.theme-dark .auth-title {
  background: linear-gradient(135deg, #7baaf7, #9cc2ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mode-tabs {
  display: flex;
  margin-bottom: 30px;
  border-radius: 0;
  transition: all 0.3s ease;
  border-bottom: 2px solid rgba(90, 141, 238, 0.2);
}

.mode-tab {
  flex: 1;
  padding: 14px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  color: #666;
}

.theme-dark .mode-tab {
  color: #aaa;
}

.mode-tab:hover {
  background: rgba(90, 141, 238, 0.05);
  color: #333;
}

.theme-dark .mode-tab:hover {
  color: #fff;
  background: rgba(123, 170, 247, 0.1);
}

.mode-tab.active {
  font-weight: 700;
  color: #333;
}

.theme-dark .mode-tab.active {
  color: #fff;
}

.mode-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 15%;
  right: 15%;
  height: 3px;
  border-radius: 3px;
  transition: all 0.3s ease;
  background: #5a8dee;
}

.theme-dark .mode-tab.active::after {
  background: #7baaf7;
}

.auth-form {
  margin-bottom: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 320px;
}

.form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.auth-alerts {
  margin-top: 10px;
  margin-bottom: 15px;
  min-height: 40px;
}

.attempt-hint {
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  background: rgba(90, 141, 238, 0.1);
  color: #5a8dee;
  border: 1px solid rgba(90, 141, 238, 0.2);
}

.theme-dark .attempt-hint {
  background: rgba(123, 170, 247, 0.1);
  color: #7baaf7;
  border: 1px solid rgba(123, 170, 247, 0.2);
}

.attempt-hint .locked-message {
  color: #f44336;
  font-weight: 600;
}

.theme-dark .attempt-hint .locked-message {
  color: #ef9a9a;
}

.hint-icon {
  font-size: 16px;
}

.hint-text {
  flex: 1;
}

.errors-container {
  margin: 8px 0 15px;
  transition: all 0.3s ease;
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.errors-container.has-errors {
  opacity: 1;
  max-height: 80px;
}

.error-message {
  font-size: 12px;
  color: #e74c3c;
  margin-bottom: 5px;
  padding: 8px 10px;
  border-radius: 6px;
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.2);
  animation: fadeIn 0.3s ease;
}

.theme-dark .error-message {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.auth-button-area {
  margin-top: auto;
  padding-top: 0;
  position: relative;
  min-height: 60px;
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
}

.form-group {
  margin-bottom: 15px;
  position: relative;
}

.form-group.with-icon {
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding: 0 15px;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  background-color: rgba(255, 255, 255, 0.8);
  border: 2px solid #b8d4fe;
}

.theme-dark .form-group.with-icon {
  background-color: rgba(255, 255, 255, 0.05);
  border: 2px solid #3a4a6b;
}

.form-group.with-icon.has-success {
  border-color: #4caf50;
  box-shadow: 0 0 0 1px rgba(76, 175, 80, 0.2);
}

.theme-dark .form-group.with-icon.has-success {
  border-color: #66bb6a;
  box-shadow: 0 0 0 1px rgba(102, 187, 106, 0.3);
}

.form-group.with-icon.has-error {
  border-color: #f44336;
  box-shadow: 0 0 0 1px rgba(244, 67, 54, 0.2);
}

.theme-dark .form-group.with-icon.has-error {
  border-color: #ef5350;
  box-shadow: 0 0 0 1px rgba(239, 83, 80, 0.3);
}

.form-group.with-icon:focus-within {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05), 0 0 0 1px #5a8dee;
  border-color: #5a8dee;
}

.theme-dark .form-group.with-icon:focus-within {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #7baaf7;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  margin-right: 12px;
  font-size: 18px;
  transition: color 0.3s ease;
  color: #888;
}

.theme-dark .icon-container {
  color: #aaa;
}

.icon-input {
  flex: 1;
  padding: 16px 0;
  border: none;
  background: transparent;
  font-size: 15px;
  outline: none;
  font-weight: 500;
  transition: color 0.3s ease;
  color: #333;
  width: 100%;
}

.theme-dark .icon-input {
  color: #fff;
}

.password-input {
  padding-right: 60px;
}

.icon-input::placeholder {
  font-weight: 400;
  transition: color 0.3s ease;
  color: #999;
}

.theme-dark .icon-input::placeholder {
  color: #777;
}

.input-actions {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
}

.clear-button {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: #999;
  font-size: 16px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-button:hover {
  color: #666;
  background-color: rgba(0, 0, 0, 0.05);
}

.theme-dark .clear-button {
  color: #aaa;
}

.theme-dark .clear-button:hover {
  color: #ccc;
  background-color: rgba(255, 255, 255, 0.05);
}

.password-group .input-actions {
  right: 10px;
  gap: 8px;
}

.password-toggle {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #888;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  margin: 0;
}

.theme-dark .password-toggle {
  color: #aaa;
}

.password-toggle:hover {
  background-color: rgba(90, 141, 238, 0.1);
  color: #5a8dee;
}

.theme-dark .password-toggle:hover {
  background-color: rgba(123, 170, 247, 0.1);
  color: #7baaf7;
}

.password-toggle:active {
  transform: scale(0.95);
}

.button-loading {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.register-steps-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  min-height: 180px;
  flex: 1;
}

.register-step {
  width: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease;
  position: absolute;
  top: 0;
  left: 0;
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
  gap: 12px;
  width: 100%;
}

.button-group .back-button,
.button-group .auth-button {
  flex: 1;
  min-width: 0;
  position: relative;
}

.back-button {
  padding: 16px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  background: #f0f7ff;
  color: #5a8dee;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #b8d4fe;
  width: 100%;
}

.theme-dark .back-button {
  background: #2a3a5a;
  color: #7baaf7;
  border: 1px solid #3a4a6b;
}

.back-button:hover:not(:disabled) {
  background: #e5f0ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.theme-dark .back-button:hover:not(:disabled) {
  background: #34456e;
}

.back-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.back-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.captcha-group {
  margin-top: 10px;
  width: 100%;
}

.captcha-row {
  display: flex;
  gap: 12px;
  align-items: stretch;
  width: 100%;
  box-sizing: border-box;
}

.captcha-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding: 0 15px;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  min-height: 54px;
  min-width: 0;
  background-color: rgba(255, 255, 255, 0.8);
  border: 2px solid #b8d4fe;
}

.theme-dark .captcha-input-group {
  background-color: rgba(255, 255, 255, 0.05);
  border: 2px solid #3a4a6b;
}

.captcha-input-group:focus-within {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 1px #5a8dee, 0 4px 10px rgba(0, 0, 0, 0.05);
  border-color: #5a8dee;
}

.theme-dark .captcha-input-group:focus-within {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #7baaf7;
}

.captcha-input-group .input-actions {
  right: 10px;
}

.captcha-input-group .clear-button {
  width: 20px;
  height: 20px;
}

.captcha-image-container {
  flex: 1;
  min-width: 120px;
  max-width: 140px;
  display: flex;
  align-items: center;
}

.captcha-image {
  width: 100%;
  height: 54px;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  background-color: rgba(255, 255, 255, 0.8);
  border: 2px solid #b8d4fe;
}

.theme-dark .captcha-image {
  background-color: rgba(255, 255, 255, 0.05);
  border: 2px solid #3a4a6b;
}

.captcha-image:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #5a8dee;
}

.theme-dark .captcha-image:hover {
  border-color: #7baaf7;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-placeholder {
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;
  color: #888;
}

.theme-dark .captcha-placeholder {
  color: #aaa;
}

.auth-button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  background: #f0f7ff;
  color: #5a8dee;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #b8d4fe;
}

.gradient-button {
  background: linear-gradient(135deg, #5a8dee, #7baaf7);
  color: white;
  box-shadow: 0 10px 20px rgba(90, 141, 238, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.theme-dark .gradient-button {
  background: linear-gradient(135deg, #7baaf7, #9cc2ff);
  box-shadow: 0 10px 20px rgba(123, 170, 247, 0.3);
}

.gradient-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 15px 30px rgba(90, 141, 238, 0.5);
}

.theme-dark .gradient-button:hover:not(:disabled) {
  box-shadow: 0 15px 30px rgba(123, 170, 247, 0.5);
}

.gradient-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 5px 15px rgba(90, 141, 238, 0.3);
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.auth-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.hint-area {
  min-height: 30px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: 20px;
}

.mode-switch {
  margin-top: 0;
  text-align: center;
  font-size: 14px;
  padding-top: 15px;
  border-top: 1px solid;
  transition: all 0.3s ease;
  color: #666;
  border-top-color: #e0edff;
}

.theme-dark .mode-switch {
  color: #aaa;
  border-top-color: #2a3a5a;
}

.mode-switch a {
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s;
  color: #5a8dee;
}

.theme-dark .mode-switch a {
  color: #7baaf7;
}

.mode-switch a:hover {
  text-decoration: none;
  background: rgba(90, 141, 238, 0.1);
}

.theme-dark .mode-switch a:hover {
  background: rgba(123, 170, 247, 0.1);
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  padding-top: 15px;
  border-top: 1px solid;
  transition: all 0.3s ease;
  color: #666;
  border-top-color: #e0edff;
}

.theme-dark .auth-footer {
  color: #aaa;
  border-top-color: #2a3a5a;
}

@media (max-height: 700px) {
  .auth-card { padding: 30px 25px; min-height: 480px; }
  .auth-title { font-size: 28px; margin-bottom: 25px; }
  .mode-tabs { margin-bottom: 25px; }
  .form-group { margin-bottom: 12px; }
  .form-group.with-icon { padding: 0 12px; }
  .icon-input { padding: 14px 0; font-size: 14px; }
  .password-input { padding-right: 50px; }
  .captcha-input-group, .captcha-image { height: 50px; min-height: 50px; }
  .captcha-image-container { min-width: 110px; }
  .auth-button { padding: 14px; font-size: 15px; }
  .register-steps-container { min-height: 160px; }
  .auth-form { min-height: 280px; }
  .auth-button-area { min-height: 60px; }
  .hint-area { min-height: 25px; margin-top: 15px; }
}

@media (max-height: 600px) {
  .auth-card { padding: 25px 20px; min-height: 450px; }
  .auth-title { font-size: 26px; margin-bottom: 20px; }
  .mode-tab { padding: 12px; font-size: 15px; }
  .password-input { padding-right: 45px; }
  .captcha-input-group, .captcha-image { height: 46px; min-height: 46px; }
  .captcha-image-container { min-width: 100px; }
  .auth-button { padding: 14px; font-size: 15px; }
  .register-steps-container { min-height: 150px; }
  .auth-form { min-height: 250px; }
  .auth-button-area { min-height: 55px; }
  .hint-area { min-height: 20px; margin-top: 12px; }
}

@media (max-width: 480px) {
  .auth-container { padding: 15px; max-width: 100%; }
  .auth-card { padding: 30px 20px; min-height: 480px; }
  .auth-title { font-size: 28px; }
  .mode-tab { font-size: 15px; padding: 12px 10px; }
  .captcha-row { flex-direction: row; gap: 10px; }
  .captcha-input-group { flex: 2; height: 50px; min-height: 50px; }
  .captcha-image-container { flex: 1; min-width: 100px; max-width: 120px; }
  .captcha-image { height: 50px; min-height: 50px; }
  .auth-button { padding: 15px; font-size: 16px; }
  .mode-switch { font-size: 13px; }
  .attempt-hint { font-size: 12px; padding: 10px; }
  .register-steps-container { min-height: 160px; }
  .auth-form { min-height: 280px; }
  .button-group {
    gap: 8px;
  }
  .auth-button-area { min-height: 60px; }
  .hint-area { min-height: 25px; margin-top: 15px; }
}

@media (max-width: 360px) {
  .auth-card { padding: 25px 15px; min-height: 460px; }
  .auth-title { font-size: 24px; }
  .mode-tab { padding: 10px 8px; font-size: 14px; }
  .password-input { padding-right: 40px; }
  .captcha-input-group { height: 48px; min-height: 48px; }
  .captcha-image-container { min-width: 90px; max-width: 100px; }
  .captcha-image { height: 48px; min-height: 48px; }
  .auth-button { padding: 14px; font-size: 15px; }
  .register-steps-container { min-height: 150px; }
  .auth-form { min-height: 250px; }
  .button-group {
    gap: 8px;
  }
  .auth-button-area { min-height: 55px; }
  .hint-area { min-height: 20px; margin-top: 12px; }
}

@media (max-height: 500px) and (orientation: landscape) {
  .auth-scroll-container { align-items: flex-start; padding-top: 10px; }
  .auth-card { min-height: 420px; padding: 20px 25px; }
  .auth-title { font-size: 24px; margin-bottom: 20px; }
  .form-group { margin-bottom: 10px; }
  .form-group.with-icon { padding: 0 10px; min-height: 44px; }
  .icon-input { padding: 10px 0; font-size: 14px; }
  .password-input { padding-right: 40px; }
  .captcha-row { gap: 8px; }
  .captcha-input-group, .captcha-image { height: 44px; min-height: 44px; }
  .register-steps-container { min-height: 130px; }
  .auth-form { min-height: 220px; }
  .button-group {
    gap: 8px;
  }
  .auth-button-area { min-height: 50px; }
  .hint-area { min-height: 20px; margin-top: 8px; }
}
</style>
