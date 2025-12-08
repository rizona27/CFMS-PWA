<template>
  <div class="auth-view">
    <div class="auth-scroll-container">
      <div class="auth-container">
        <div class="auth-card">
          <h1 class="auth-title">CFMS·一基暴富</h1>
          
          <!-- 开发环境提示 -->
          <div v-if="isDevEnvironment" class="dev-environment-banner">
            <span class="dev-icon">🔧</span>
            <span class="dev-text">开发环境 - 使用模拟登录</span>
          </div>
          
          <!-- 模式切换标签 -->
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
          
          <!-- 登录表单 -->
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
            
            <div class="form-group with-icon">
              <div class="icon-container">
                <span class="input-icon">🔒</span>
              </div>
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                required
                autocomplete="current-password"
                class="icon-input"
              />
            </div>
            
            <!-- 开发环境测试账号提示 -->
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
            
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
            
            <div v-if="successMessage" class="success-message">
              {{ successMessage }}
            </div>
          </form>
          
          <!-- 注册表单 -->
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
            
            <div class="form-group with-icon">
              <div class="icon-container">
                <span class="input-icon">🔒</span>
              </div>
              <input
                v-model="authStore.registerForm.password"
                type="password"
                placeholder="密码"
                required
                autocomplete="new-password"
                class="icon-input"
              />
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
            
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
            
            <div v-if="successMessage" class="success-message">
              {{ successMessage }}
            </div>
          </form>
          
          <!-- 模式切换链接 -->
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
          
          <!-- 登录尝试次数提示 -->
          <div v-if="!isRegistering && loginAttempts > 0 && loginAttempts < 3" class="attempt-hint">
            <span class="hint-icon">⚠️</span>
            <span class="hint-text">登录失败 {{ loginAttempts }} 次，{{ 3 - loginAttempts }} 次后将需要验证码</span>
          </div>
          
          <!-- 注册尝试次数提示 -->
          <div v-if="isRegistering && registerAttempts > 0 && registerAttempts < 3" class="attempt-hint">
            <span class="hint-icon">⚠️</span>
            <span class="hint-text">注册失败 {{ registerAttempts }} 次，{{ 3 - registerAttempts }} 次后将需要验证码</span>
          </div>
          
          <div class="auth-footer">
            <!-- 移除了所有提示信息 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// 状态
const isRegistering = ref(false)
const showLoginCaptcha = ref(false)
const showRegisterCaptcha = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const loginAttempts = ref(0)
const registerAttempts = ref(0)

// 开发环境检测
const isDevEnvironment = computed(() => {
  return import.meta.env.DEV || window.location.hostname === 'localhost'
})

// 主题相关
const themeMode = ref('system')
const themeClass = computed(() => {
  if (themeMode.value === 'dark') return 'theme-dark'
  if (themeMode.value === 'light') return 'theme-light'
  return 'theme-system'
})

// 登录表单
const loginForm = ref({
  username: '',
  password: '',
  captcha_code: '',
  captcha_id: ''
})

// 计算属性
const isLoading = computed(() => authStore.isLoading)
const captchaImage = computed(() => authStore.captchaImage)

// 检查当前URL和路由状态
onMounted(() => {
  console.log('当前路径:', window.location.pathname)
  console.log('完整URL:', window.location.href)
  console.log('开发环境:', isDevEnvironment.value)
  
  // 检查是否从404页面跳转过来
  if (window.location.pathname === '/404' || window.location.pathname === '/auth') {
    // 确保URL正确
    if (window.location.pathname !== '/auth') {
      history.replaceState(null, '', '/auth')
    }
  }
  
  // 初始化主题
  initTheme()
  
  // 监听主题变化
  window.addEventListener('storage', handleThemeChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleThemeChange)
})

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme_mode') || 'system'
  themeMode.value = savedTheme
  applyTheme(savedTheme)
}

// 处理主题变化
const handleThemeChange = (e: StorageEvent) => {
  if (e.key === 'theme_mode') {
    const newTheme = e.newValue || 'system'
    themeMode.value = newTheme
    applyTheme(newTheme)
  }
}

// 应用主题
const applyTheme = (theme: string) => {
  const root = document.documentElement
  root.classList.remove('theme-dark', 'theme-light', 'theme-system')
  
  if (theme === 'dark') {
    root.classList.add('theme-dark')
  } else if (theme === 'light') {
    root.classList.add('theme-light')
  } else {
    root.classList.add('theme-system')
  }
}

// 重置尝试次数
const resetAttempts = () => {
  if (isRegistering.value) {
    registerAttempts.value = 0
    showRegisterCaptcha.value = false
  } else {
    loginAttempts.value = 0
    showLoginCaptcha.value = false
  }
}

// 刷新验证码
const refreshCaptcha = async () => {
  await authStore.getCaptcha()
  if (isRegistering.value) {
    authStore.registerForm.captcha_id = authStore.captchaId
  } else {
    loginForm.value.captcha_id = authStore.captchaId
  }
}

// 切换到登录模式
const switchToLogin = () => {
  isRegistering.value = false
  resetAttempts()
  errorMessage.value = ''
  successMessage.value = ''
  loginForm.value.captcha_code = ''
  loginForm.value.captcha_id = ''
}

// 切换到注册模式
const switchToRegister = async () => {
  isRegistering.value = true
  resetAttempts()
  errorMessage.value = ''
  successMessage.value = ''
  
  // 获取验证码（如果需要）
  if (registerAttempts.value >= 3) {
    await authStore.getCaptcha()
    authStore.registerForm.captcha_id = authStore.captchaId
  }
}

const handleLogin = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    console.log('正在登录，用户名:', loginForm.value.username)
    
    // 忽略用户名大小写
    const normalizedUsername = loginForm.value.username.toLowerCase()
    
    // 检查是否需要验证码
    const needCaptcha = loginAttempts.value >= 3
    
    if (needCaptcha && !loginForm.value.captcha_code) {
      errorMessage.value = '请输入验证码'
      return
    }
    
    // 如果需要验证码但尚未获取，先获取验证码
    if (needCaptcha && !authStore.captchaId) {
      await authStore.getCaptcha()
      loginForm.value.captcha_id = authStore.captchaId
    }
    
    // 开发环境下使用模拟登录，避免代理问题
    let success
    if (isDevEnvironment.value) {
      console.log('开发环境，使用模拟登录')
      // 直接调用模拟登录函数
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
      // 登录成功，重置尝试次数
      loginAttempts.value = 0
      showLoginCaptcha.value = false
      successMessage.value = `登录成功！欢迎 ${authStore.displayName}`
      
      console.log('登录成功，准备跳转到配置页面...')
      
      // 重要：使用路由的 replace 方法而不是 push
      // 这样可以防止后退到登录页
      router.replace('/config').then(() => {
        console.log('跳转到 /config 成功')
      }).catch(err => {
        console.error('跳转到 /config 失败:', err)
        // 备用方案：尝试跳转到首页
        router.replace('/').catch(() => {
          console.error('跳转到根路径也失败')
        })
      })
      
    } else {
      // 登录失败，增加尝试次数
      loginAttempts.value++
      
      // 如果达到3次失败，显示验证码
      if (loginAttempts.value >= 3) {
        showLoginCaptcha.value = true
        // 开发环境下不需要验证码
        if (!isDevEnvironment.value) {
          await authStore.getCaptcha()
          loginForm.value.captcha_id = authStore.captchaId
        }
      }
      
      errorMessage.value = authStore.error || '登录失败，请检查用户名和密码'
    }
    
  } catch (error: any) {
    console.error('登录错误:', error)
    // 开发环境下的网络错误提示
    if (isDevEnvironment.value && error.message && error.message.includes('fetch')) {
      // 尝试使用模拟登录作为备选
      console.log('网络请求失败，尝试模拟登录')
      const normalizedUsername = loginForm.value.username.toLowerCase()
      const success = authStore.mockLogin(normalizedUsername, loginForm.value.password)
      if (success) {
        successMessage.value = `模拟登录成功！欢迎 ${authStore.displayName}`
        console.log('模拟登录成功，准备跳转到配置页面...')
        // 使用 replace 而不是 push
        router.replace('/config').catch(() => {
          router.replace('/')
        })
      } else {
        errorMessage.value = '登录失败，请使用测试账号：admin, user, guest'
      }
    } else {
      errorMessage.value = `登录失败: ${error.message || '请检查网络连接和服务器状态'}`
    }
  }
}

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    console.log('正在注册，用户名:', authStore.registerForm.username)
    
    // 开发环境下跳过注册，直接模拟注册
    if (isDevEnvironment.value) {
      console.log('开发环境，使用模拟注册')
      // 使用模拟登录代替注册
      const success = authStore.mockLogin(authStore.registerForm.username, authStore.registerForm.password)
      if (success) {
        registerAttempts.value = 0
        showRegisterCaptcha.value = false
        successMessage.value = `模拟注册成功！欢迎 ${authStore.displayName}`
        
        console.log('注册成功，准备跳转到配置页面...')
        // 使用 replace 而不是 push
        router.replace('/config')
        return
      }
    }
    
    // 检查是否需要验证码
    const needCaptcha = registerAttempts.value >= 3
    
    if (needCaptcha && !authStore.registerForm.captcha_code) {
      errorMessage.value = '请输入验证码'
      return
    }
    
    // 如果需要验证码但尚未获取，先获取验证码
    if (needCaptcha && !authStore.captchaId) {
      await authStore.getCaptcha()
      authStore.registerForm.captcha_id = authStore.captchaId
    }
    
    const success = await authStore.register(authStore.registerForm)
    
    if (success) {
      // 注册成功，重置尝试次数
      registerAttempts.value = 0
      showRegisterCaptcha.value = false
      successMessage.value = `注册成功！欢迎 ${authStore.displayName}`
      
      console.log('注册成功，准备跳转到配置页面...')
      // 使用 replace 而不是 push
      router.replace('/config')
      
    } else {
      // 注册失败，增加尝试次数
      registerAttempts.value++
      
      // 如果达到3次失败，显示验证码
      if (registerAttempts.value >= 3) {
        showRegisterCaptcha.value = true
        await authStore.getCaptcha()
        authStore.registerForm.captcha_id = authStore.captchaId
      }
      
      errorMessage.value = authStore.error || '注册失败'
    }
    
  } catch (error: any) {
    console.error('注册错误:', error)
    errorMessage.value = `注册失败: ${error.message || '请检查网络连接和服务器状态'}`
  }
}
</script>

<style scoped>
.auth-view {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  overflow: auto;
  transition: background-color 0.3s ease;
  background-color: var(--bg-primary);
}

/* 开发环境横幅 */
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
  0%, 100% {
    opacity: 0.9;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

/* 开发环境测试账号样式 */
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

/* 主题相关样式 */
.auth-view.theme-light {
  background: linear-gradient(135deg, var(--bg-hover) 0%, var(--bg-secondary) 100%);
}

.auth-view.theme-dark {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
}

.auth-view.theme-system {
  background: linear-gradient(135deg, var(--bg-hover) 0%, var(--bg-secondary) 100%);
}

@media (prefers-color-scheme: dark) {
  .auth-view.theme-system {
    background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  }
}

.auth-scroll-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.auth-card {
  border-radius: 20px;
  padding: 40px 35px;
  box-shadow:
    0 15px 35px rgba(0, 0, 0, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 520px;
  background-color: var(--bg-card);
}

.theme-light .auth-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.95) 100%);
}

.theme-dark .auth-card {
  background: linear-gradient(135deg, rgba(30, 30, 46, 0.95) 0%, rgba(25, 25, 40, 0.95) 100%);
}

.auth-title {
  text-align: center;
  margin-bottom: 35px;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  letter-spacing: 1px;
  transition: color 0.3s ease;
  color: var(--text-primary);
}

.theme-light .auth-title {
  color: #1a237e;
}

.theme-dark .auth-title {
  background: linear-gradient(135deg, #64b5f6, #2196f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 模式切换标签 */
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

/* 表单样式 */
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
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.form-group.with-icon:focus-within {
  transform: translateY(-1px);
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.05),
    0 0 0 2px rgba(var(--accent-color-rgb), 0.2);
  border-color: var(--accent-color);
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
}

.icon-input::placeholder {
  font-weight: 400;
  transition: color 0.3s ease;
  color: var(--text-tertiary);
}

/* 验证码容器 */
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
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.captcha-input-group:focus-within {
  box-shadow:
    0 0 0 2px rgba(var(--accent-color-rgb), 0.2),
    0 4px 10px rgba(0, 0, 0, 0.05);
  border-color: var(--accent-color);
}

.captcha-image-container {
  flex: 1;
  min-width: 120px;
  max-width: 140px;
}

.captcha-image {
  width: 100%;
  height: 100%;
  min-height: 54px;
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.captcha-image:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--accent-color);
}

.captcha-placeholder {
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;
  color: var(--text-tertiary);
}

/* 渐变按钮 */
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
  box-shadow: 0 4px 15px rgba(var(--accent-color-rgb), 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.gradient-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--accent-color-rgb), 0.6);
}

.gradient-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(var(--accent-color-rgb), 0.4);
}

.gradient-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 错误和成功消息 */
.error-message {
  margin-top: 18px;
  padding: 14px;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
  border: 1px solid;
  font-weight: 500;
  transition: all 0.3s ease;
  background: rgba(var(--error-color), 0.1);
  color: var(--error-color);
  border-color: rgba(var(--error-color), 0.2);
}

.success-message {
  margin-top: 18px;
  padding: 14px;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
  border: 1px solid;
  font-weight: 500;
  transition: all 0.3s ease;
  background: rgba(var(--success-color), 0.1);
  color: var(--success-color);
  border-color: rgba(var(--success-color), 0.2);
}

/* 模式切换链接 */
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

/* 尝试次数提示 */
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

/* 响应式设计 - 手机端优化 */
@media (max-height: 700px) {
  .auth-card {
    padding: 30px 25px;
    min-height: 480px;
  }
  
  .auth-title {
    font-size: 26px;
    margin-bottom: 25px;
  }
  
  .mode-tabs {
    margin-bottom: 25px;
  }
  
  .form-group {
    margin-bottom: 18px;
  }
  
  .form-group.with-icon {
    padding: 0 12px;
  }
  
  .icon-input {
    padding: 14px 0;
    font-size: 14px;
  }
  
  .captcha-image-container {
    min-width: 110px;
  }
  
  .captcha-image {
    min-height: 50px;
  }
  
  .gradient-button {
    padding: 14px;
    font-size: 15px;
  }
}

@media (max-height: 600px) {
  .auth-card {
    padding: 25px 20px;
    min-height: 450px;
  }
  
  .auth-title {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .mode-tab {
    padding: 12px;
    font-size: 15px;
  }
  
  .captcha-image-container {
    min-width: 100px;
  }
  
  .captcha-image {
    min-height: 46px;
  }
}

/* 适配小屏幕宽度 */
@media (max-width: 480px) {
  .auth-container {
    padding: 15px;
    max-width: 100%;
  }
  
  .auth-card {
    padding: 30px 20px;
    min-height: 480px;
  }
  
  .auth-title {
    font-size: 24px;
  }
  
  .mode-tab {
    font-size: 15px;
    padding: 12px 10px;
  }
  
  .captcha-row {
    flex-direction: row;
    gap: 10px;
  }
  
  .captcha-input-group {
    flex: 2;
    min-height: 50px;
  }
  
  .captcha-image-container {
    flex: 1;
    min-width: 100px;
    max-width: 120px;
  }
  
  .captcha-image {
    min-height: 50px;
  }
  
  .gradient-button {
    padding: 15px;
    font-size: 16px;
  }
  
  .mode-switch {
    font-size: 13px;
  }
  
  .attempt-hint {
    font-size: 12px;
    padding: 10px;
  }
}

/* 极窄屏幕适配 */
@media (max-width: 360px) {
  .auth-card {
    padding: 25px 15px;
    min-height: 460px;
  }
  
  .auth-title {
    font-size: 22px;
  }
  
  .mode-tab {
    padding: 10px 8px;
    font-size: 14px;
  }
  
  .captcha-input-group {
    min-height: 48px;
  }
  
  .captcha-image-container {
    min-width: 90px;
    max-width: 100px;
  }
  
  .captcha-image {
    min-height: 48px;
  }
  
  .gradient-button {
    padding: 14px;
    font-size: 15px;
  }
}

/* 横屏模式优化 */
@media (max-height: 500px) and (orientation: landscape) {
  .auth-scroll-container {
    align-items: flex-start;
    padding-top: 10px;
  }
  
  .auth-card {
    min-height: 400px;
    padding: 20px 25px;
  }
  
  .auth-title {
    font-size: 22px;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group.with-icon {
    padding: 0 10px;
    min-height: 44px;
  }
  
  .icon-input {
    padding: 10px 0;
    font-size: 14px;
  }
  
  .captcha-row {
    gap: 8px;
  }
  
  .captcha-input-group {
    min-height: 44px;
  }
  
  .captcha-image {
    min-height: 44px;
  }
}
</style>
