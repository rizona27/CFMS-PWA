import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 定义用户类型枚举
export enum UserType {
  FREE = 'free',
  SUBSCRIBED = 'subscribed',
  VIP = 'vip'
}

// 定义用户接口
export interface User {
  id: number
  username: string
  email: string
  user_type: string
  subscription_start?: string
  subscription_end?: string
  created_at: string
  updated_at: string
  last_login?: string
  displayName?: string
  has_full_access?: boolean
}

// 定义注册表单接口
export interface RegisterForm {
  username: string
  password: string
  email?: string
  captcha_code?: string
  captcha_id?: string
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const isLoggedIn = ref(false)
  const currentUser = ref<User | null>(null)
  const token = ref<string>('')
  const isLoading = ref(false)
  const error = ref<string>('')
  const isRegistering = ref(false)

  // 后端API地址 - 【修改】开发和生产环境都使用真实后端
  const API_BASE_URL = 'https://cfms.crnas.uk/api'
  
  // 验证码相关状态
  const captchaImage = ref<string>('')
  const captchaId = ref<string>('')
  const captchaCode = ref<string>('')
  
  // 注册表单状态
  const registerForm = ref<RegisterForm>({
    username: '',
    password: '',
    email: '',
    captcha_code: '',
    captcha_id: ''
  })

  // 计算属性
  const userType = computed(() => {
    if (!currentUser.value) return UserType.FREE
    
    switch (currentUser.value.user_type?.toLowerCase()) {
      case 'vip':
      case 'admin':
        return UserType.VIP
      case 'subscribed':
      case 'premium':
        return UserType.SUBSCRIBED
      case 'free':
      case 'guest':
      default:
        return UserType.FREE
    }
  })

  const displayName = computed(() => {
    if (!currentUser.value) return '未登录'
    const username = currentUser.value.username
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()
  })

  const userTypeString = computed(() => {
    return userType.value.toString().toLowerCase()
  })

  const userTypeDisplay = computed(() => {
    switch (userType.value) {
      case UserType.VIP:
        return '尊享用户'
      case UserType.SUBSCRIBED:
        return '体验用户'
      case UserType.FREE:
      default:
        return '基础用户'
    }
  })

  const isSubscriptionValid = computed(() => {
    if (!currentUser.value || !currentUser.value.subscription_end) return false
    
    const now = new Date()
    const endDate = new Date(currentUser.value.subscription_end)
    return endDate > now
  })

  const subscriptionDaysLeft = computed(() => {
    if (!currentUser.value || !currentUser.value.subscription_end || !isSubscriptionValid.value) return 0
    
    const now = new Date()
    const endDate = new Date(currentUser.value.subscription_end)
    const diffTime = endDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  })

  // ========== 验证码相关方法 ==========
  
  async function getCaptcha(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/captcha`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        captchaImage.value = `data:image/png;base64,${data.image_base64}`
        captchaId.value = data.captcha_id
        registerForm.value.captcha_id = data.captcha_id
        return true
      } else {
        error.value = data.error || '获取验证码失败'
        return false
      }
      
    } catch (err: any) {
      console.error('获取验证码错误:', err)
      error.value = err.message || '获取验证码失败'
      return false
    }
  }

  // ========== 登录注册方法 ==========

  async function login(username: string, password: string, captcha_code?: string, captcha_id?: string): Promise<boolean> {
    isLoading.value = true
    error.value = ''
    
    try {
      console.log(`登录尝试: ${username}`)
      console.log(`API地址: ${API_BASE_URL}`)

      if (!username || !password) {
        error.value = '请输入用户名和密码'
        return false
      }

      const requestData: any = {
        username: username,
        password: password
      }
      
      if (captcha_code && captcha_id) {
        requestData.captcha_code = captcha_code
        requestData.captcha_id = captcha_id
      }

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        const userData = data.user_info || data.user
        
        currentUser.value = {
          id: userData.user_id || userData.id,
          username: userData.username,
          email: userData.email || '',
          user_type: userData.user_type || 'free',
          subscription_start: userData.subscription_start,
          subscription_end: userData.subscription_end,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString(),
          last_login: userData.last_login || new Date().toISOString(),
          displayName: userData.displayName || userData.username,
          has_full_access: userData.has_full_access || false
        }
        
        token.value = data.token || ''
        isLoggedIn.value = true
        
        console.log('登录响应数据:', data)
        console.log('用户数据:', userData)
        console.log('登录成功，存储token和用户信息')
        
        localStorage.setItem('auth_user', JSON.stringify(currentUser.value))
        localStorage.setItem('auth_token', token.value)
        
        console.log(`登录成功: ${username} (${currentUser.value.user_type})`)
        
        return true
      } else {
        error.value = data.error || data.message || '用户名或密码错误'
        
        if (data.error && data.error.includes('验证码')) {
          await getCaptcha()
        }
        
        return false
      }
      
    } catch (err: any) {
      console.error('登录错误:', err)
      error.value = err.message || '登录失败，请检查网络连接'
      
      // 开发环境下也使用真实后端，移除模拟登录备用
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(formData: RegisterForm): Promise<boolean> {
    isLoading.value = true
    error.value = ''
    
    try {
      console.log(`注册尝试: ${formData.username}`)

      if (!formData.username || !formData.password) {
        error.value = '用户名和密码不能为空'
        return false
      }

      if (formData.password.length < 6) {
        error.value = '密码至少需要6位'
        return false
      }

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        const userData = data.user_info
        
        currentUser.value = {
          id: userData.user_id,
          username: userData.username,
          email: userData.email || '',
          user_type: userData.user_type || 'free',
          subscription_start: userData.subscription_start,
          subscription_end: userData.subscription_end,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString(),
          last_login: userData.last_login || new Date().toISOString(),
          displayName: userData.displayName || userData.username,
          has_full_access: userData.has_full_access || false
        }
        
        token.value = data.token || ''
        isLoggedIn.value = true
        
        localStorage.setItem('auth_user', JSON.stringify(currentUser.value))
        localStorage.setItem('auth_token', token.value)
        
        console.log(`注册并登录成功: ${formData.username} (${currentUser.value.user_type})`)
        
        resetRegisterForm()
        
        return true
      } else {
        error.value = data.error || data.message || '注册失败'
        
        if (data.error && (data.error.includes('验证码') || data.error.includes('captcha'))) {
          await getCaptcha()
        }
        
        return false
      }
      
    } catch (err: any) {
      console.error('注册错误:', err)
      error.value = err.message || '注册失败，请检查网络连接'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function resetRegisterForm() {
    registerForm.value = {
      username: '',
      password: '',
      email: '',
      captcha_code: '',
      captcha_id: ''
    }
    captchaCode.value = ''
    captchaImage.value = ''
    captchaId.value = ''
  }

  function toggleRegisterMode() {
    isRegistering.value = !isRegistering.value
    error.value = ''
    
    if (isRegistering.value) {
      getCaptcha()
    }
  }

  // 移除了 mockLogin 方法

  async function checkDatabaseConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      return response.ok
    } catch (error) {
      console.error('数据库连接检查失败:', error)
      return false
    }
  }

  async function fetchUserProfile(): Promise<void> {
    if (!currentUser.value || !token.value) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          currentUser.value = {
            ...currentUser.value,
            ...data.user
          }
          localStorage.setItem('auth_user', JSON.stringify(currentUser.value))
        }
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }
  }

  function logout() {
    console.log('用户退出登录')
    
    isLoggedIn.value = false
    currentUser.value = null
    token.value = ''
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    
    console.log('清除登录状态完成，正在跳转到登录页...')
    
    // 直接使用 window.location 跳转
    setTimeout(() => {
      window.location.hash = '#/auth'
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }, 100)
  }

  function autoLogin() {
    try {
      console.log('尝试自动登录...')
      const savedUser = localStorage.getItem('auth_user')
      const savedToken = localStorage.getItem('auth_token')
      
      console.log('保存的用户:', savedUser)
      console.log('保存的token:', savedToken)
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser)
        currentUser.value = userData
        token.value = savedToken
        isLoggedIn.value = true
        
        console.log('自动登录成功:', userData.username)
        console.log('当前登录状态:', isLoggedIn.value)
        
        // 获取用户信息
        fetchUserProfile()
        
        return true
      } else {
        console.log('没有保存的登录信息，需要手动登录')
        return false
      }
    } catch (error) {
      console.error('自动登录失败:', error)
      logout()
      return false
    }
  }

  async function validateToken(): Promise<boolean> {
    if (!token.value) return false
    
    try {
      const response = await fetch(`${API_BASE_URL}/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`
        },
        credentials: 'include'
      })
      
      return response.ok
    } catch (error) {
      console.error('Token验证失败:', error)
      return false
    }
  }

  function hasPermission(requiredType: UserType): boolean {
    if (!currentUser.value) return false
    
    const userLevel = userType.value
    
    const levelValue = {
      [UserType.VIP]: 3,
      [UserType.SUBSCRIBED]: 2,
      [UserType.FREE]: 1
    }
    
    return levelValue[userLevel] >= levelValue[requiredType]
  }

  return {
    isLoggedIn,
    currentUser,
    token,
    isLoading,
    error,
    isRegistering,
    captchaImage,
    captchaId,
    captchaCode,
    registerForm,
    
    userType,
    userTypeString,
    userTypeDisplay,
    displayName,
    isSubscriptionValid,
    subscriptionDaysLeft,
    
    login,
    register,
    resetRegisterForm,
    toggleRegisterMode,
    getCaptcha,
    checkDatabaseConnection,
    fetchUserProfile,
    logout,
    autoLogin,
    validateToken,
    hasPermission
  }
})
