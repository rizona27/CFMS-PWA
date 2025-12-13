<template>
  <div class="auth-view" :class="themeClass">
    <div class="background-fx">
      <div class="blobs">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
      </div>
      <div class="grid-overlay"></div>
    </div>
    
    <div class="auth-scroll-container">
      <div class="auth-container">
        <div class="auth-card fade-in-down">
          <h1 class="auth-title">CFMS·一基暴富</h1>
          
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
            <div class="form-group with-icon">
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
              />
            </div>
            
            <div class="form-group with-icon password-group">
              <div class="icon-container">
                <span class="input-icon">🔒</span>
              </div>
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="密码"
                required
                autocomplete="current-password"
                class="icon-input password-input"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              >
                <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
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
                  />
                </div>
                <div class="captcha-image-container">
                  <div class="captcha-image" @click="refreshCaptcha">
                    <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                    <div v-else class="captcha-placeholder">刷新</div>
                  </div>
                </div>
              </div>
            </div>
            
            <button type="submit" class="auth-button gradient-button" :disabled="isLoading">
              <span class="button-text">
                {{ isLoading ? '登录中...' : '登录' }}
              </span>
            </button>
          </form>
          
          <form v-else @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group with-icon">
              <div class="icon-container">
                <span class="input-icon">👤</span>
              </div>
              <input
                v-model="authStore.registerForm.username"
                type="text"
                placeholder="用户名"
                required
                autocomplete="username"
                class="icon-input"
              />
            </div>
            
            <div class="form-group with-icon password-group">
              <div class="icon-container">
                <span class="input-icon">🔒</span>
              </div>
              <input
                v-model="authStore.registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="密码"
                required
                autocomplete="new-password"
                class="icon-input password-input"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              >
                <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div class="form-group with-icon">
              <div class="icon-container">
                <span class="input-icon">📧</span>
              </div>
              <input
                v-model="authStore.registerForm.email"
                type="email"
                placeholder="邮箱(选填)"
                autocomplete="email"
                class="icon-input"
              />
            </div>
            
            <div v-if="showRegisterCaptcha && registerAttempts >= 3" class="form-group captcha-group">
              <div class="captcha-row">
                <div class="captcha-input-group">
                  <div class="icon-container">
                    <span class="input-icon">🖼️</span>
                  </div>
                  <input
                    v-model="authStore.registerForm.captcha_code"
                    type="text"
                    placeholder="验证码"
                    required
                    class="icon-input captcha-input"
                  />
                </div>
                <div class="captcha-image-container">
                  <div class="captcha-image" @click="refreshCaptcha">
                    <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                    <div v-else class="captcha-placeholder">刷新</div>
                  </div>
                </div>
              </div>
            </div>
            
            <button type="submit" class="auth-button gradient-button" :disabled="isLoading">
              <span class="button-text">
                {{ isLoading ? '注册中...' : '注册' }}
              </span>
            </button>
          </form>
          
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
          
          <div v-if="!isRegistering && loginAttempts > 0 && loginAttempts < 3" class="attempt-hint">
            <span class="hint-icon">⚠️</span>
            <span class="hint-text">登录失败 {{ loginAttempts }} 次，{{ 3 - loginAttempts }} 次后将需要验证码</span>
          </div>
          
          <div v-if="isRegistering && registerAttempts > 0 && registerAttempts < 3" class="attempt-hint">
            <span class="hint-icon">⚠️</span>
            <span class="hint-text">注册失败 {{ registerAttempts }} 次，{{ 3 - registerAttempts }} 次后将需要验证码</span>
          </div>
          
          <div class="auth-footer">
          </div>
        </div>
      </div>
    </div>
    
    <ToastMessage
      v-if="toast.show"
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @update:show="toast.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import ToastMessage from '../components/common/ToastMessage.vue'

const router = useRouter()
const authStore = useAuthStore()

const isRegistering = ref(false)
const showLoginCaptcha = ref(false)
const showRegisterCaptcha = ref(false)
const loginAttempts = ref(0)
const registerAttempts = ref(0)
const showPassword = ref(false)

const toast = ref({
  show: false,
  message: '',
  type: 'info' as 'info' | 'success' | 'error' | 'warning'
})

// 存储键名
const LOGIN_ATTEMPTS_KEY = 'cfms_login_attempts'
const REGISTER_ATTEMPTS_KEY = 'cfms_register_attempts'
const ATTEMPTS_TIMESTAMP_KEY = 'cfms_attempts_timestamp'
const ATTEMPTS_EXPIRY_MS = 30 * 60 * 1000 // 30分钟过期

const showToast = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toast.value = {
    show: true,
    message,
    type
  }
}

const isDevEnvironment = computed(() => {
  return import.meta.env.DEV || window.location.hostname === 'localhost'
})

const themeMode = ref('system')
const systemTheme = ref('light') // 跟踪系统主题
const themeClass = computed(() => {
  let effectiveTheme = themeMode.value
  if (effectiveTheme === 'system') {
    effectiveTheme = systemTheme.value
  }
  if (effectiveTheme === 'dark') return 'theme-dark'
  if (effectiveTheme === 'light') return 'theme-light'
  return 'theme-system'
})

const loginForm = ref({
  username: '',
  password: '',
  captcha_code: '',
  captcha_id: ''
})

const isLoading = computed(() => authStore.isLoading)
const captchaImage = computed(() => authStore.captchaImage)

// 检查尝试次数是否过期
const isAttemptsExpired = (timestamp: number) => {
  return Date.now() - timestamp > ATTEMPTS_EXPIRY_MS
}

// 加载持久化的尝试次数
const loadAttempts = () => {
  try {
    // 检查时间戳
    const timestampStr = localStorage.getItem(ATTEMPTS_TIMESTAMP_KEY)
    if (timestampStr) {
      const timestamp = parseInt(timestampStr)
      if (isAttemptsExpired(timestamp)) {
        // 过期则清除所有尝试次数
        clearAttempts()
        return
      }
    }
    
    // 加载登录尝试次数
    const loginAttemptsStr = localStorage.getItem(LOGIN_ATTEMPTS_KEY)
    if (loginAttemptsStr) {
      loginAttempts.value = parseInt(loginAttemptsStr)
      showLoginCaptcha.value = loginAttempts.value >= 3
    }
    
    // 加载注册尝试次数
    const registerAttemptsStr = localStorage.getItem(REGISTER_ATTEMPTS_KEY)
    if (registerAttemptsStr) {
      registerAttempts.value = parseInt(registerAttemptsStr)
      showRegisterCaptcha.value = registerAttempts.value >= 3
    }
  } catch (error) {
    console.error('加载尝试次数失败:', error)
  }
}

// 保存尝试次数
const saveAttempts = () => {
  try {
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, loginAttempts.value.toString())
    localStorage.setItem(REGISTER_ATTEMPTS_KEY, registerAttempts.value.toString())
    localStorage.setItem(ATTEMPTS_TIMESTAMP_KEY, Date.now().toString())
  } catch (error) {
    console.error('保存尝试次数失败:', error)
  }
}

// 清除尝试次数
const clearAttempts = () => {
  loginAttempts.value = 0
  registerAttempts.value = 0
  showLoginCaptcha.value = false
  showRegisterCaptcha.value = false
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
  localStorage.removeItem(REGISTER_ATTEMPTS_KEY)
  localStorage.removeItem(ATTEMPTS_TIMESTAMP_KEY)
}

// 清除特定类型的尝试次数
const clearSpecificAttempts = (isRegister: boolean) => {
  if (isRegister) {
    registerAttempts.value = 0
    showRegisterCaptcha.value = false
    localStorage.removeItem(REGISTER_ATTEMPTS_KEY)
  } else {
    loginAttempts.value = 0
    showLoginCaptcha.value = false
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
  }
}

// 监听系统主题变化
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
  
  // 加载持久化的尝试次数
  loadAttempts()
  
  // 初始化主题
  initTheme()
  
  // 监听storage事件（来自ConfigView的主题变化）
  window.addEventListener('storage', handleThemeChange)
  
  // 监听系统主题变化
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

// 不再通过切换模式重置尝试次数
const resetAttempts = () => {
  // 这个方法现在只重置当前模式的表单，不重置尝试次数
  if (isRegistering.value) {
    authStore.registerForm.captcha_code = ''
    authStore.registerForm.captcha_id = ''
  } else {
    loginForm.value.captcha_code = ''
    loginForm.value.captcha_id = ''
  }
  showPassword.value = false
}

const refreshCaptcha = async () => {
  await authStore.getCaptcha()
  if (isRegistering.value) {
    authStore.registerForm.captcha_id = authStore.captchaId
  } else {
    loginForm.value.captcha_id = authStore.captchaId
  }
}

const switchToLogin = () => {
  isRegistering.value = false
  resetAttempts()
  // 根据当前尝试次数决定是否显示验证码
  showLoginCaptcha.value = loginAttempts.value >= 3
  if (showLoginCaptcha.value && !isDevEnvironment.value) {
    refreshCaptcha()
  }
}

const switchToRegister = async () => {
  isRegistering.value = true
  resetAttempts()
  // 根据当前尝试次数决定是否显示验证码
  showRegisterCaptcha.value = registerAttempts.value >= 3
  if (showRegisterCaptcha.value && !isDevEnvironment.value) {
    await authStore.getCaptcha()
    authStore.registerForm.captcha_id = authStore.captchaId
  }
}

const handleLogin = async () => {
  try {
    const normalizedUsername = loginForm.value.username.toLowerCase()
    const needCaptcha = loginAttempts.value >= 3
    
    // 如果需要验证码但未填写
    if (needCaptcha && !loginForm.value.captcha_code) {
      showToast('请输入验证码', 'warning')
      return
    }
    
    // 如果需要验证码但未获取验证码ID
    if (needCaptcha && !authStore.captchaId) {
      await authStore.getCaptcha()
      loginForm.value.captcha_id = authStore.captchaId
      showToast('请重新输入验证码', 'info')
      return
    }
    
    let success
    if (isDevEnvironment.value) {
      success = authStore.mockLogin(normalizedUsername, loginForm.value.password)
    } else {
      success = await authStore.login(
        normalizedUsername,
        loginForm.value.password,
        needCaptcha ? loginForm.value.captcha_code : '',
        needCaptcha ? loginForm.value.captcha_id : ''
      )
    }
    
    if (success) {
      // 登录成功，清除登录尝试次数
      clearSpecificAttempts(false)
      showToast(`登录成功！欢迎 ${authStore.displayName}`, 'success')
      
      router.replace('/config').catch(() => {
        router.replace('/')
      })
      
    } else {
      // 登录失败，增加尝试次数
      loginAttempts.value++
      saveAttempts()
      
      // 检查是否需要显示验证码
      if (loginAttempts.value >= 3) {
        showLoginCaptcha.value = true
        if (!isDevEnvironment.value) {
          await authStore.getCaptcha()
          loginForm.value.captcha_id = authStore.captchaId
        }
      }
      
      // 显示具体错误信息
      const errorMessage = authStore.error || '登录失败，请检查用户名和密码'
      showToast(errorMessage, 'error')
      
      // 如果验证码正确但账号密码错误，需要刷新验证码
      if (needCaptcha && authStore.error && authStore.error.includes('验证码')) {
        // 验证码错误，不清除验证码输入
      } else if (needCaptcha) {
        // 验证码正确但账号密码错误，刷新验证码
        await refreshCaptcha()
        loginForm.value.captcha_code = '' // 清空验证码输入框
      }
    }
    
  } catch (error: any) {
    if (isDevEnvironment.value && error.message && error.message.includes('fetch')) {
      const normalizedUsername = loginForm.value.username.toLowerCase()
      const success = authStore.mockLogin(normalizedUsername, loginForm.value.password)
      if (success) {
        clearSpecificAttempts(false)
        showToast(`模拟登录成功！欢迎 ${authStore.displayName}`, 'success')
        router.replace('/config').catch(() => {
          router.replace('/')
        })
      } else {
        loginAttempts.value++
        saveAttempts()
        showToast('登录失败，请使用测试账号：admin, user, guest', 'error')
      }
    } else {
      showToast(`登录失败: ${error.message || '请检查网络连接和服务器状态'}`, 'error')
    }
  }
}

const handleRegister = async () => {
  try {
    if (isDevEnvironment.value) {
      const success = authStore.mockLogin(authStore.registerForm.username, authStore.registerForm.password)
      if (success) {
        clearSpecificAttempts(true)
        showToast(`模拟注册成功！欢迎 ${authStore.displayName}`, 'success')
        router.replace('/config')
        return
      }
    }
    
    const needCaptcha = registerAttempts.value >= 3
    
    if (needCaptcha && !authStore.registerForm.captcha_code) {
      showToast('请输入验证码', 'warning')
      return
    }
    
    if (needCaptcha && !authStore.captchaId) {
      await authStore.getCaptcha()
      authStore.registerForm.captcha_id = authStore.captchaId
      showToast('请重新输入验证码', 'info')
      return
    }
    
    const success = await authStore.register(authStore.registerForm)
    
    if (success) {
      // 注册成功，清除注册尝试次数
      clearSpecificAttempts(true)
      showToast(`注册成功！欢迎 ${authStore.displayName}`, 'success')
      router.replace('/config')
    } else {
      // 注册失败，增加尝试次数
      registerAttempts.value++
      saveAttempts()
      
      if (registerAttempts.value >= 3) {
        showRegisterCaptcha.value = true
        await authStore.getCaptcha()
        authStore.registerForm.captcha_id = authStore.captchaId
      }
      
      // 显示具体错误信息
      const errorMessage = authStore.error || '注册失败'
      showToast(errorMessage, 'error')
      
      // 如果验证码正确但其他信息错误，刷新验证码
      if (needCaptcha && authStore.error && !authStore.error.includes('验证码')) {
        await refreshCaptcha()
        authStore.registerForm.captcha_code = ''
      }
    }
    
  } catch (error: any) {
    showToast(`注册失败: ${error.message || '请检查网络连接和服务器状态'}`, 'error')
  }
}
</script>

<style scoped>
/* === 炫酷背景逻辑 Start === */
.auth-view {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: relative;
  /* 基础背景色 */
  background-color: #f8fafc;
  transition: background-color 0.5s ease;
}

/* 背景特效容器 */
.background-fx {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

/* 1. 流体光斑层 */
.blobs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: blur(80px); /* 强模糊制造流体感 */
  opacity: 0.8;
  z-index: 1;
}

.blob {
  position: absolute;
  border-radius: 50%;
  animation: float 20s infinite ease-in-out alternate;
  opacity: 0.6;
}

/* 深色模式下的流体颜色：霓虹极光 */
.auth-view.theme-dark .blob-1 {
  background: #4f46e5; /* 靛蓝 */
  width: 600px;
  height: 600px;
  top: -100px;
  left: -100px;
  animation-duration: 25s;
}
.auth-view.theme-dark .blob-2 {
  background: #c026d3; /* 紫红 */
  width: 500px;
  height: 500px;
  bottom: -50px;
  right: -100px;
  animation-duration: 18s;
  animation-delay: -5s;
}
.auth-view.theme-dark .blob-3 {
  background: #06b6d4; /* 青色 */
  width: 300px;
  height: 300px;
  bottom: 30%;
  left: 30%;
  animation-duration: 22s;
  animation-delay: -10s;
}

/* 浅色/系统模式下的流体颜色：清新渐变 */
.auth-view:not(.theme-dark) .blob-1 {
  background: #a5b4fc;
  width: 700px;
  height: 700px;
  top: -200px;
  left: -200px;
}
.auth-view:not(.theme-dark) .blob-2 {
  background: #f9a8d4;
  width: 600px;
  height: 600px;
  bottom: -100px;
  right: -100px;
}
.auth-view:not(.theme-dark) .blob-3 {
  background: #67e8f9;
  width: 400px;
  height: 400px;
  top: 40%;
  left: 40%;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1) rotate(0deg); }
  33% { transform: translate(30px, -50px) scale(1.1) rotate(10deg); }
  66% { transform: translate(-20px, 20px) scale(0.9) rotate(-5deg); }
  100% { transform: translate(0, 0) scale(1) rotate(0deg); }
}

/* 2. 网格覆盖层 - 制造科技感质感 */
.grid-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
  background-image: 
    linear-gradient(rgba(100, 100, 100, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 100, 100, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
  pointer-events: none;
}

.auth-view.theme-dark .grid-overlay {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
}

/* === 炫酷背景逻辑 End === */

.auth-view.theme-dark {
  background-color: #0f172a; /* 深色底色 */
}

.dev-environment-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 15px;
  background: linear-gradient(135deg, var(--warning-color), #ff5722);
  color: white;
  border-radius: 10px;
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
  0%, 100% { opacity: 0.9; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}

.dev-accounts {
  margin: 10px 0 15px;
  padding: 12px;
  background: rgba(var(--success-color), 0.1);
  border-radius: 8px;
  border: 1px solid rgba(var(--success-color), 0.3);
}

.dev-accounts-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--success-color);
}

.dev-account {
  font-size: 12px;
  margin: 3px 0;
  color: var(--text-secondary);
  padding-left: 8px;
  position: relative;
}

.dev-account::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--success-color);
}

.auth-scroll-container {
  width: 100%;
  min-height: 100vh;
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

/* 卡片样式优化：更强的玻璃质感 */
.auth-card {
  border-radius: 20px;
  padding: 40px 35px;
  /* 阴影加深 */
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  /* 模糊度增加 */
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 520px;
  background-color: rgba(255, 255, 255, 0.6); /* 浅色半透明 */
}

.theme-dark .auth-card {
  background-color: rgba(30, 41, 59, 0.6); /* 深色半透明 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
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
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 1px;
  transition: color 0.3s ease;
  color: var(--text-primary);
}

.theme-light .auth-title {
  color: #1e293b;
}

.theme-dark .auth-title {
  /* 标题渐变 */
  background: linear-gradient(135deg, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mode-tabs {
  display: flex;
  margin-bottom: 35px;
  border-radius: 0;
  transition: all 0.3s ease;
  border-bottom: 2px solid rgba(var(--accent-color-rgb), 0.2);
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
  color: var(--text-secondary);
}

.mode-tab:hover {
  background: rgba(var(--accent-color-rgb), 0.05);
  color: var(--text-primary);
}

.mode-tab.active {
  font-weight: 700;
  color: var(--text-primary);
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
  background: linear-gradient(90deg, var(--accent-color), var(--primary-color));
}

.auth-form {
  margin-bottom: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 22px;
}

.form-group.with-icon {
  display: flex;
  align-items: center;
  border-radius: 12px;
  padding: 0 15px;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  /* 输入框背景色稍微加深，增加对比 */
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0,0,0,0.05);
  position: relative;
}

.theme-dark .form-group.with-icon {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.form-group.with-icon:focus-within {
  transform: translateY(-1px);
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05), 0 0 0 2px rgba(var(--accent-color-rgb), 0.2);
  border-color: var(--accent-color);
}

.theme-dark .form-group.with-icon:focus-within {
  background-color: rgba(0, 0, 0, 0.4);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  margin-right: 12px;
  font-size: 18px;
  transition: color 0.3s ease;
  color: var(--text-tertiary);
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
  color: var(--text-primary);
  width: 100%;
}

.password-input {
  padding-right: 40px;
}

.icon-input::placeholder {
  font-weight: 400;
  transition: color 0.3s ease;
  color: var(--text-tertiary);
}

.password-toggle {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: var(--text-tertiary);
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  height: 36px;
  width: 36px;
  border-radius: 50%;
}

.password-toggle:hover {
  background-color: rgba(var(--accent-color-rgb), 0.1);
  color: var(--accent-color);
}

.password-toggle:active {
  transform: translateY(-50%) scale(0.95);
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
  border-radius: 12px;
  padding: 0 15px;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  min-height: 54px;
  min-width: 0;
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0,0,0,0.05);
}

.theme-dark .captcha-input-group {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.captcha-input-group:focus-within {
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.2), 0 4px 10px rgba(0, 0, 0, 0.05);
  border-color: var(--accent-color);
}

.theme-dark .captcha-input-group:focus-within {
  background-color: rgba(0, 0, 0, 0.4);
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
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0,0,0,0.05);
}

.theme-dark .captcha-image {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.captcha-image:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--accent-color);
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
  color: var(--text-tertiary);
}

.gradient-button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
  box-sizing: border-box;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, var(--accent-color), var(--primary-color));
  color: white;
  box-shadow: 0 10px 20px rgba(var(--accent-color-rgb), 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.gradient-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 15px 30px rgba(var(--accent-color-rgb), 0.5);
}

.gradient-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 5px 15px rgba(var(--accent-color-rgb), 0.3);
}

.gradient-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.mode-switch {
  margin-top: 25px;
  text-align: center;
  font-size: 14px;
  padding-top: 20px;
  border-top: 1px solid;
  transition: all 0.3s ease;
  color: var(--text-secondary);
  border-top-color: var(--border-color);
}

.mode-switch a {
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s;
  color: var(--accent-color);
}

.mode-switch a:hover {
  text-decoration: none;
  background: rgba(var(--accent-color-rgb), 0.1);
}

.attempt-hint {
  margin-top: 15px;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  background: rgba(var(--warning-color), 0.1);
  color: var(--warning-color);
  border: 1px solid rgba(var(--warning-color), 0.2);
}

.hint-icon {
  font-size: 16px;
}

.hint-text {
  flex: 1;
}

.auth-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 12px;
  padding-top: 20px;
  border-top: 1px solid;
  transition: all 0.3s ease;
  color: var(--text-secondary);
  border-top-color: var(--border-color);
}

@media (max-height: 700px) {
  .auth-card { padding: 30px 25px; min-height: 480px; }
  .auth-title { font-size: 26px; margin-bottom: 25px; }
  .mode-tabs { margin-bottom: 25px; }
  .form-group { margin-bottom: 18px; }
  .form-group.with-icon { padding: 0 12px; }
  .icon-input { padding: 14px 0; font-size: 14px; }
  .captcha-input-group, .captcha-image { height: 50px; min-height: 50px; }
  .captcha-image-container { min-width: 110px; }
  .gradient-button { padding: 14px; font-size: 15px; }
}

@media (max-height: 600px) {
  .auth-card { padding: 25px 20px; min-height: 450px; }
  .auth-title { font-size: 24px; margin-bottom: 20px; }
  .mode-tab { padding: 12px; font-size: 15px; }
  .captcha-input-group, .captcha-image { height: 46px; min-height: 46px; }
  .captcha-image-container { min-width: 100px; }
  .gradient-button { padding: 14px; font-size: 15px; }
}

@media (max-width: 480px) {
  .auth-container { padding: 15px; max-width: 100%; }
  .auth-card { padding: 30px 20px; min-height: 480px; }
  .auth-title { font-size: 24px; }
  .mode-tab { font-size: 15px; padding: 12px 10px; }
  .captcha-row { flex-direction: row; gap: 10px; }
  .captcha-input-group { flex: 2; height: 50px; min-height: 50px; }
  .captcha-image-container { flex: 1; min-width: 100px; max-width: 120px; }
  .captcha-image { height: 50px; min-height: 50px; }
  .gradient-button { padding: 15px; font-size: 16px; }
  .mode-switch { font-size: 13px; }
  .attempt-hint { font-size: 12px; padding: 10px; }
}

@media (max-width: 360px) {
  .auth-card { padding: 25px 15px; min-height: 460px; }
  .auth-title { font-size: 22px; }
  .mode-tab { padding: 10px 8px; font-size: 14px; }
  .captcha-input-group { height: 48px; min-height: 48px; }
  .captcha-image-container { min-width: 90px; max-width: 100px; }
  .captcha-image { height: 48px; min-height: 48px; }
  .gradient-button { padding: 14px; font-size: 15px; }
}

@media (max-height: 500px) and (orientation: landscape) {
  .auth-scroll-container { align-items: flex-start; padding-top: 10px; }
  .auth-card { min-height: 400px; padding: 20px 25px; }
  .auth-title { font-size: 22px; margin-bottom: 20px; }
  .form-group { margin-bottom: 15px; }
  .form-group.with-icon { padding: 0 10px; min-height: 44px; }
  .icon-input { padding: 10px 0; font-size: 14px; }
  .captcha-row { gap: 8px; }
  .captcha-input-group, .captcha-image { height: 44px; min-height: 44px; }
}
</style>