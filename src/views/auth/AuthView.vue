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
          
          <div v-if="!showForgotPassword" class="mode-tabs">
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
          
          <div class="auth-form-wrapper">
            <AuthForm
              v-if="!isRegistering && !showForgotPassword"
              :isLoading="isLoading"
              :attempts="loginAttempts"
              :showCaptcha="showLoginCaptcha"
              :captchaImage="captchaImage"
              :hasValidAccountForAttempt="hasValidAccountForLoginAttempt"
              @submit="handleLoginSubmit"
              @username-blur="handleUsernameBlur"
              @refresh-captcha="refreshCaptcha"
            />
            
            <RegisterForm
              v-else-if="isRegistering && !showForgotPassword"
              :isLoading="isLoading"
              :attempts="registerAttempts"
              :showCaptcha="showRegisterCaptcha"
              :captchaImage="captchaImage"
              @submit="handleRegisterSubmit"
              @refresh-captcha="refreshCaptcha"
            />
            
            <ForgotPasswordForm
              v-else
              :isLoading="isLoading"
              @submit="handleForgotPasswordSubmit"
              @back="showForgotPassword = false"
            />
          </div>
          
          <div v-if="!showForgotPassword" class="hint-area">
            <div class="mode-switch">
              <p v-if="!isRegistering">
                还没有账号？
                <a href="#" @click.prevent="switchToRegister">立即注册</a>
                <span style="margin: 0 8px">|</span>
                <a href="#" @click.prevent="showForgotPassword = true">忘记密码？</a>
              </p>
              <p v-else>
                已有账号？
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { getCopyright } from '../../Version'
import AuthForm from './AuthForm.vue'
import RegisterForm from './RegisterForm.vue'
import ForgotPasswordForm from './ForgotPasswordForm.vue'

const router = useRouter()
const authStore = useAuthStore()

const isRegistering = ref(false)
const showForgotPassword = ref(false)
const showLoginCaptcha = ref(false)
const showRegisterCaptcha = ref(false)
const loginAttempts = ref(0)
const registerAttempts = ref(0)
const isAccountLocked = ref(false)
const hasValidAccountForLoginAttempt = ref(false)

const isLoading = computed(() => authStore.isLoading)
const captchaImage = computed(() => authStore.captchaImage)

const copyrightInfo = ref(getCopyright())

const LOGIN_ATTEMPTS_KEY = 'cfms_login_attempts'
const REGISTER_ATTEMPTS_KEY = 'cfms_register_attempts'
const ACCOUNT_LOCKED_KEY = 'cfms_account_locked'
const ATTEMPTS_TIMESTAMP_KEY = 'cfms_attempts_timestamp'
const VALID_ACCOUNT_FOR_ATTEMPTS_KEY = 'cfms_valid_account_for_attempts'
const ATTEMPTS_EXPIRY_MS = 30 * 60 * 1000

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

const systemThemeMediaQuery = ref<MediaQueryList | null>(null)
const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  systemTheme.value = e.matches ? 'dark' : 'light'
  if (themeMode.value === 'system') {
    applyTheme('system')
  }
}

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme_mode') || 'system'
  themeMode.value = savedTheme
  applyTheme(savedTheme)
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

const handleThemeChange = (e: StorageEvent) => {
  if (e.key === 'theme_mode') {
    const newTheme = e.newValue || 'system'
    if (themeMode.value !== newTheme) {
      themeMode.value = newTheme
      applyTheme(newTheme)
    }
  }
}

// 尝试次数管理
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

const handleUsernameBlur = async (username: string) => {
  if (!username) return
  
  const exists = await checkUsernameExists(username)
  if (!exists) {
    console.log('用户名不存在')
  }
}

const refreshCaptcha = async () => {
  await authStore.getCaptcha()
}

const switchToLogin = () => {
  isRegistering.value = false
  showForgotPassword.value = false
  showLoginCaptcha.value = loginAttempts.value >= 3
  if (showLoginCaptcha.value) {
    refreshCaptcha()
  }
}

const switchToRegister = async () => {
  isRegistering.value = true
  showForgotPassword.value = false
  showRegisterCaptcha.value = registerAttempts.value >= 3
  if (showRegisterCaptcha.value) {
    await authStore.getCaptcha()
  }
}

const handleLoginSubmit = async (form: any) => {
  try {
    if (checkAccountLocked()) {
      return
    }
    
    const normalizedUsername = form.username.toLowerCase()
    const needCaptcha = loginAttempts.value >= 3
    
    // 第一步：检查用户名是否存在
    const usernameExists = await checkUsernameExists(normalizedUsername)
    if (!usernameExists) {
      return
    }
    
    const success = await authStore.login(
      normalizedUsername,
      form.password,
      needCaptcha ? form.captcha_code : '',
      needCaptcha ? form.captcha_id : ''
    )
    
    if (success) {
      clearSpecificAttempts(false)
      router.replace('/config').catch(() => {
        router.replace('/')
      })
    } else {
      if (!hasValidAccountForLoginAttempt.value) {
        hasValidAccountForLoginAttempt.value = true
      }
      
      loginAttempts.value++
      saveAttempts()
      
      if (loginAttempts.value >= 5) {
        lockAccount()
      } else {
        if (loginAttempts.value >= 3) {
          showLoginCaptcha.value = true
          await authStore.getCaptcha()
        }
      }
    }
  } catch (error: any) {
    console.error('登录失败:', error)
  }
}

const handleRegisterSubmit = async (form: any) => {
  try {
    const needCaptcha = registerAttempts.value >= 3
    
    const registerData = {
      username: form.username,
      password: form.password,
      email: form.email || '',
      captcha_code: needCaptcha ? form.captcha_code : '',
      captcha_id: needCaptcha ? form.captcha_id : ''
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
      }
    }
  } catch (error: any) {
    console.error('注册失败:', error)
  }
}

const handleForgotPasswordSubmit = async (form: any) => {
  try {
    const success = await authStore.forgotPassword(form.username, form.email)
    
    if (success) {
      // 成功时不抛出异常，直接返回
      return Promise.resolve(true)
    } else {
      // 使用 authStore 中的错误信息
      const errorMsg = authStore.error || '密码找回失败'
      return Promise.reject(new Error(errorMsg))
    }
  } catch (err: any) {
    console.error('密码找回失败:', err)
    // 确保错误被正确传播
    return Promise.reject(err)
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
</script>

<style scoped src="./styles/auth-styles.css"></style>
