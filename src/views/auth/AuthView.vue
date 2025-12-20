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
            <!-- 移除全局状态提示区域 -->
            
            <AuthForm
              v-if="!isRegistering && !showForgotPassword"
              :isLoading="isLoading"
              :attempts="loginAttempts"
              :showCaptcha="showLoginCaptcha"
              :captchaImage="captchaImage"
              :hasValidAccountForAttempt="hasValidAccountForLoginAttempt"
              :showUserMissingMessage="showUserMissingMessage"
              @submit="handleLoginSubmit"
              @username-blur="handleUsernameBlur"
              @password-focus="handlePasswordFocus"
              @refresh-captcha="refreshCaptcha"
              @switch-to-register="switchToRegister"
            />
            
            <RegisterForm
              v-else-if="isRegistering && !showForgotPassword"
              ref="registerFormRef"
              :isLoading="isLoading"
              :attempts="registerAttempts"
              :showCaptcha="showRegisterCaptcha"
              :captchaImage="captchaImage"
              @submit="handleRegisterSubmit"
              @check-username="handleCheckUsername"
              @check-email="handleCheckEmail"
              @refresh-captcha="refreshCaptcha"
              @clear-global-error="clearGlobalError"
            />
            
            <ForgotPasswordForm
              v-else
              :isLoading="isLoading"
              @submit="handleForgotPasswordSubmit"
              @check-username="handleCheckUsername"
              @back="showForgotPassword = false"
              @clear-global-error="clearGlobalError"
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
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
const isAccountLocked = ref(false)
const hasValidAccountForLoginAttempt = ref(false)
const showUserMissingMessage = ref(false)
const loginAttempts = ref(0)
const registerAttempts = ref(0)
const registerFormRef = ref<InstanceType<typeof RegisterForm>>()

// 全局状态管理 - 不再需要
// const globalError = ref('')
// const successMessage = ref('')

const isLoading = computed(() => authStore.isLoading)
const captchaImage = computed(() => authStore.captchaImage)

const copyrightInfo = ref(getCopyright())

// 修改：按用户名存储登录尝试次数
const LOGIN_ATTEMPTS_PREFIX = 'cfms_login_attempts_'
const REGISTER_ATTEMPTS_KEY = 'cfms_register_attempts'
const ACCOUNT_LOCKED_PREFIX = 'cfms_account_locked_'
const ATTEMPTS_TIMESTAMP_KEY = 'cfms_attempts_timestamp'
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

// 修改：按用户名检查账户锁定状态
const checkAccountLocked = (username: string): boolean => {
  try {
    if (!username) return false
    
    const lockedKey = ACCOUNT_LOCKED_PREFIX + username.toLowerCase()
    const locked = localStorage.getItem(lockedKey)
    if (locked) {
      const lockData = JSON.parse(locked)
      if (lockData.expiry && Date.now() > lockData.expiry) {
        localStorage.removeItem(lockedKey)
        const attemptsKey = LOGIN_ATTEMPTS_PREFIX + username.toLowerCase()
        localStorage.removeItem(attemptsKey)
        return false
      }
      return true
    }
    return false
  } catch (error) {
    console.error('检查账户锁定状态失败:', error)
    return false
  }
}

// 修改：按用户名锁定账户
const lockAccount = (username: string) => {
  try {
    if (!username) return
    
    const lockKey = ACCOUNT_LOCKED_PREFIX + username.toLowerCase()
    const lockData = {
      lockedAt: Date.now(),
      expiry: Date.now() + (24 * 60 * 60 * 1000)
    }
    localStorage.setItem(lockKey, JSON.stringify(lockData))
  } catch (error) {
    console.error('锁定账户失败:', error)
  }
}

// 修改：按用户名加载尝试次数
const loadAttempts = (username?: string) => {
  try {
    // 处理注册尝试次数
    const timestampStr = localStorage.getItem(ATTEMPTS_TIMESTAMP_KEY)
    if (timestampStr) {
      const timestamp = parseInt(timestampStr)
      if (isAttemptsExpired(timestamp)) {
        clearRegisterAttempts()
      }
    }
    
    const registerAttemptsStr = localStorage.getItem(REGISTER_ATTEMPTS_KEY)
    if (registerAttemptsStr) {
      registerAttempts.value = parseInt(registerAttemptsStr)
      showRegisterCaptcha.value = registerAttempts.value >= 3
    }
    
    // 如果有用户名，加载该用户的登录尝试次数
    if (username) {
      const attemptsKey = LOGIN_ATTEMPTS_PREFIX + username.toLowerCase()
      const loginAttemptsStr = localStorage.getItem(attemptsKey)
      if (loginAttemptsStr) {
        loginAttempts.value = parseInt(loginAttemptsStr)
        showLoginCaptcha.value = loginAttempts.value >= 3
      } else {
        // 新用户，重置计数器
        loginAttempts.value = 0
        showLoginCaptcha.value = false
      }
      
      // 检查该用户是否被锁定
      isAccountLocked.value = checkAccountLocked(username)
      hasValidAccountForLoginAttempt.value = false
      showUserMissingMessage.value = false
      
      // 检查用户名是否存在（用于预判）
      checkUsernameExists(username).then(exists => {
        hasValidAccountForLoginAttempt.value = exists
        if (!exists) {
          showUserMissingMessage.value = false // 先隐藏，等登录失败时再显示
        }
      })
    }
  } catch (error) {
    console.error('加载尝试次数失败:', error)
  }
}

// 修改：按用户名保存尝试次数
const saveAttempts = (username?: string) => {
  try {
    // 保存注册尝试次数
    localStorage.setItem(REGISTER_ATTEMPTS_KEY, registerAttempts.value.toString())
    localStorage.setItem(ATTEMPTS_TIMESTAMP_KEY, Date.now().toString())
    
    // 如果有用户名，保存该用户的登录尝试次数
    if (username) {
      const attemptsKey = LOGIN_ATTEMPTS_PREFIX + username.toLowerCase()
      localStorage.setItem(attemptsKey, loginAttempts.value.toString())
      localStorage.setItem('cfms_last_attempted_user', username.toLowerCase())
    }
  } catch (error) {
    console.error('保存尝试次数失败:', error)
  }
}

// 清空注册尝试次数
const clearRegisterAttempts = () => {
  registerAttempts.value = 0
  showRegisterCaptcha.value = false
  localStorage.removeItem(REGISTER_ATTEMPTS_KEY)
}

// 修改：清空特定用户的登录尝试次数
const clearLoginAttempts = (username: string) => {
  if (!username) return
  
  const attemptsKey = LOGIN_ATTEMPTS_PREFIX + username.toLowerCase()
  const lockKey = ACCOUNT_LOCKED_PREFIX + username.toLowerCase()
  
  loginAttempts.value = 0
  showLoginCaptcha.value = false
  isAccountLocked.value = false
  hasValidAccountForLoginAttempt.value = false
  showUserMissingMessage.value = false
  
  localStorage.removeItem(attemptsKey)
  localStorage.removeItem(lockKey)
  localStorage.removeItem('cfms_last_attempted_user')
}

// 全局状态管理方法 - 不再需要
const clearGlobalError = () => {
  // 空实现
}

// const setGlobalError = (message: string) => {
//   // 不再设置全局错误
// }

// const setSuccessMessage = (message: string) => {
//   // 不再设置全局成功消息
// }

// 检查用户名是否存在（用于注册）
const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    const normalizedUsername = username.toLowerCase()
    const response = await fetch('https://cfms.crnas.uk/api/check_user_exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: normalizedUsername })
    })
    
    if (!response.ok) {
      console.error('检查用户名存在性失败:', response.statusText)
      return false
    }
    
    const data = await response.json()
    return data.exists === true
  } catch (error) {
    console.error('检查用户名存在性异常:', error)
    return false
  }
}

// 检查邮箱是否存在（用于注册）
const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const normalizedEmail = email.toLowerCase()
    const response = await fetch('https://cfms.crnas.uk/api/check_email_exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: normalizedEmail })
    })
    
    if (!response.ok) {
      console.error('检查邮箱存在性失败:', response.statusText)
      return false
    }
    
    const data = await response.json()
    return data.exists === true
  } catch (error) {
    console.error('检查邮箱存在性异常:', error)
    return false
  }
}

// 处理注册页面的用户名检查
const handleCheckUsername = async (username: string) => {
  if (username && username.length >= 3) {
    const exists = await checkUsernameExists(username)
    // 更新注册表单的检查结果
    if (registerFormRef.value && registerFormRef.value.handleUsernameCheckResult) {
      registerFormRef.value.handleUsernameCheckResult({
        exists,
        message: exists ? '用户名已被使用' : '用户名可用'
      })
    }
  }
}

// 处理注册页面的邮箱检查
const handleCheckEmail = async (email: string) => {
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const exists = await checkEmailExists(email)
    // 更新注册表单的检查结果
    if (registerFormRef.value && registerFormRef.value.handleEmailCheckResult) {
      registerFormRef.value.handleEmailCheckResult({
        exists,
        message: exists ? '邮箱已被注册' : '邮箱可用'
      })
    }
  }
}

const refreshCaptcha = async () => {
  await authStore.getCaptcha()
}

const switchToLogin = () => {
  isRegistering.value = false
  showForgotPassword.value = false
  showLoginCaptcha.value = false // 重置，将在输入用户名时重新计算
  clearGlobalError()
  hasValidAccountForLoginAttempt.value = false
  showUserMissingMessage.value = false
}

const switchToRegister = async () => {
  isRegistering.value = true
  showForgotPassword.value = false
  showRegisterCaptcha.value = registerAttempts.value >= 3
  clearGlobalError()
  if (showRegisterCaptcha.value) {
    await authStore.getCaptcha()
  }
}

// 修改：处理用户名输入变化时加载该用户的尝试次数
const handleUsernameBlur = (username: string) => {
  if (username) {
    loadAttempts(username)
  }
}

const handlePasswordFocus = (username: string) => {
  // 可以在这里做一些处理
}

const handleLoginSubmit = async (form: any) => {
  try {
    clearGlobalError()
    
    const normalizedUsername = form.username.toLowerCase()
    
    // 检查该用户是否被锁定
    if (checkAccountLocked(normalizedUsername)) {
      // 锁定错误已经在子组件中显示
      hasValidAccountForLoginAttempt.value = true
      showUserMissingMessage.value = false
      return
    }
    
    // 加载该用户的尝试次数
    loadAttempts(normalizedUsername)
    
    const needCaptcha = loginAttempts.value >= 3
    
    // 提交前清空store中的错误信息
    authStore.clearError()
    
    const result = await authStore.login(
      normalizedUsername,
      form.password,
      needCaptcha ? form.captcha_code : '',
      needCaptcha ? form.captcha_id : ''
    )
    
    if (result.success) {
      // 登录成功，清除该用户的尝试次数
      clearLoginAttempts(normalizedUsername)
      router.replace('/config').catch(() => {
        router.replace('/')
      })
    } else {
      // 根据失败原因处理
      if (result.reason === 'user_missing') {
        // 用户不存在，不累加尝试次数
        hasValidAccountForLoginAttempt.value = false
        showUserMissingMessage.value = true
        // 清除该用户的尝试记录
        clearLoginAttempts(normalizedUsername)
      } else if (result.reason === 'password_error') {
        // 密码错误，累加该用户的尝试次数
        hasValidAccountForLoginAttempt.value = true
        showUserMissingMessage.value = false
        
        loginAttempts.value++
        saveAttempts(normalizedUsername)
        
        if (loginAttempts.value >= 5) {
          // 锁定该用户
          lockAccount(normalizedUsername)
          // 锁定错误在子组件中显示
        }
      } else if (result.reason === 'account_locked') {
        // 账户已锁定
        hasValidAccountForLoginAttempt.value = true
        showUserMissingMessage.value = false
        isAccountLocked.value = true
      } else if (result.reason === 'captcha_error') {
        // 验证码错误，也累加尝试次数
        hasValidAccountForLoginAttempt.value = true
        showUserMissingMessage.value = false
        
        loginAttempts.value++
        saveAttempts(normalizedUsername)
      } else {
        // 网络错误等其他原因
        hasValidAccountForLoginAttempt.value = false
        showUserMissingMessage.value = false
      }
      // 错误提示现在由子组件处理
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    // 网络错误提示也由子组件处理
  }
}

const handleRegisterSubmit = async (form: any) => {
  try {
    clearGlobalError()
    
    const needCaptcha = registerAttempts.value >= 3
    
    const registerData = {
      username: form.username,
      password: form.password,
      email: form.email || '',
      captcha_code: needCaptcha ? form.captcha_code : '',
      captcha_id: needCaptcha ? form.captcha_id : ''
    }
    
    // 提交前清空store中的错误信息
    authStore.clearError()
    
    const success = await authStore.register(registerData)
    
    if (success) {
      clearRegisterAttempts()
      // 注册成功跳转
      setTimeout(() => {
        router.replace('/config')
      }, 1000)
    } else {
      registerAttempts.value++
      saveAttempts() // 保存注册尝试次数
      
      if (registerAttempts.value >= 3) {
        showRegisterCaptcha.value = true
        await authStore.getCaptcha()
      }
      // 错误提示现在由子组件处理
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    // 网络错误提示也由子组件处理
  }
}

const handleForgotPasswordSubmit = async (form: any) => {
  try {
    clearGlobalError()
    
    const success = await authStore.forgotPassword(form.username, form.email)
    
    if (success) {
      // 成功消息现在由子组件处理
      return Promise.resolve(true)
    } else {
      // 错误消息现在由子组件处理
      return Promise.reject(new Error('密码找回失败'))
    }
  } catch (err: any) {
    console.error('密码找回失败:', err)
    return Promise.reject(err)
  }
}

onMounted(() => {
  if (window.location.pathname === '/404' || window.location.pathname === '/auth') {
    if (window.location.pathname !== '/auth') {
      history.replaceState(null, '', '/auth')
    }
  }
  
  // 只加载注册尝试次数，登录尝试次数在输入用户名时加载
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

<style scoped>
.auth-form-wrapper {
  min-height: 240px; /* 减小高度，因为移除了全局提示区域 */
  position: relative;
  margin-bottom: 16px;
}

/* 移除全局状态提示区域的样式 */

/* 移动端适配 */
@media (max-width: 480px) {
  .auth-card {
    padding: 20px;
    margin: 10px;
  }
  
  .auth-form-wrapper {
    min-height: 220px; /* 移动端稍小的高度 */
  }
}
</style>

<style scoped src="./styles/auth-styles.css"></style>
