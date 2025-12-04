import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

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

  // 后端API地址 - 根据您的后端配置
  // 注意：您的后端运行在 30443 端口，不是 11345
  const API_BASE_URL = 'http://192.168.124.26:30443/api'
  
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
    
    // 根据数据库中的user_type字段映射到枚举
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

  // 将UserType转换为字符串格式
  const userTypeString = computed(() => {
    return userType.value.toString().toLowerCase()
  })

  // 获取用户等级显示文本
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

  // 检查订阅是否有效
  const isSubscriptionValid = computed(() => {
    if (!currentUser.value || !currentUser.value.subscription_end) return false
    
    const now = new Date()
    const endDate = new Date(currentUser.value.subscription_end)
    return endDate > now
  })

  // 获取剩余订阅天数
  const subscriptionDaysLeft = computed(() => {
    if (!currentUser.value || !currentUser.value.subscription_end || !isSubscriptionValid.value) return 0
    
    const now = new Date()
    const endDate = new Date(currentUser.value.subscription_end)
    const diffTime = endDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  })

  // ========== 验证码相关方法 ==========
  
  // 获取验证码
  async function getCaptcha(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/captcha`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
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

      if (!username || !password) {
        error.value = '请输入用户名和密码'
        return false
      }

      // 构建请求数据
      const requestData: any = {
        username: username,
        password: password
      }
      
      // 如果需要验证码，添加到请求中
      if (captcha_code && captcha_id) {
        requestData.captcha_code = captcha_code
        requestData.captcha_id = captcha_id
      }

      // 连接到后端API进行真实登录
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        // 登录成功
        const userData = data.user_info || data.user
        
        // 将数据库用户数据映射到User接口
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
        
        // 存储到localStorage
        localStorage.setItem('auth_user', JSON.stringify(currentUser.value))
        localStorage.setItem('auth_token', token.value)
        
        console.log(`登录成功: ${username} (${currentUser.value.user_type})`)
        
        return true
      } else {
        // 登录失败，使用后端返回的错误消息或默认消息
        error.value = data.error || data.message || '用户名或密码错误'
        
        // 如果需要验证码，重新获取验证码
        if (data.error && data.error.includes('验证码')) {
          await getCaptcha()
        }
        
        return false
      }
      
    } catch (err: any) {
      console.error('登录错误:', err)
      error.value = err.message || '登录失败，请检查网络连接'
      
      // 如果后端API不可用，作为备用，使用模拟数据
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        console.log('后端API不可用，使用模拟登录作为备用')
        return mockLogin(username, password)
      }
      
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 注册方法
  async function register(formData: RegisterForm): Promise<boolean> {
    isLoading.value = true
    error.value = ''
    
    try {
      console.log(`注册尝试: ${formData.username}`)

      if (!formData.username || !formData.password) {
        error.value = '用户名和密码不能为空'
        return false
      }

      // 如果密码太短
      if (formData.password.length < 6) {
        error.value = '密码至少需要6位'
        return false
      }

      // 连接到后端API进行注册
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        // 注册成功，自动登录
        const userData = data.user_info
        
        // 将数据库用户数据映射到User接口
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
        
        // 存储到localStorage
        localStorage.setItem('auth_user', JSON.stringify(currentUser.value))
        localStorage.setItem('auth_token', token.value)
        
        console.log(`注册并登录成功: ${formData.username} (${currentUser.value.user_type})`)
        
        // 清空注册表单
        resetRegisterForm()
        
        return true
      } else {
        // 注册失败
        error.value = data.error || data.message || '注册失败'
        
        // 如果需要验证码，重新获取验证码
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

  // 重置注册表单
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

  // 切换登录/注册模式
  function toggleRegisterMode() {
    isRegistering.value = !isRegistering.value
    error.value = ''
    
    // 如果是注册模式，获取验证码
    if (isRegistering.value) {
      getCaptcha()
    }
  }

  // 模拟登录作为备用
  function mockLogin(username: string, password: string): boolean {
    // 模拟用户数据 - 可以根据您的数据库内容调整
    const mockUsers: Record<string, Partial<User>> = {
      'admin': {
        id: 1,
        username: 'admin',
        email: 'admin@cfms.com',
        user_type: 'vip',
        displayName: '管理员',
        has_full_access: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'user': {
        id: 2,
        username: 'user',
        email: 'user@cfms.com',
        user_type: 'subscribed',
        has_full_access: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'guest': {
        id: 3,
        username: 'guest',
        email: 'guest@cfms.com',
        user_type: 'free',
        has_full_access: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    const user = mockUsers[username]
    if (user && password) { // 模拟登录，只要密码非空就通过
      currentUser.value = user as User
      isLoggedIn.value = true
      
      localStorage.setItem('auth_user', JSON.stringify(currentUser.value))
      console.log(`模拟登录成功: ${username} (${user.user_type})`)
      
      return true
    } else {
      error.value = '用户名或密码错误'
      return false
    }
  }

  // 检查数据库连接
  async function checkDatabaseConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      return response.ok
    } catch (error) {
      console.error('数据库连接检查失败:', error)
      return false
    }
  }

  // 从数据库获取用户信息
  async function fetchUserProfile(): Promise<void> {
    if (!currentUser.value || !token.value) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
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

  // 添加一个强制登录方法用于测试
  function forceLogin(username: string) {
    const mockUsers: Record<string, Partial<User>> = {
      'admin': {
        id: 1,
        username: 'admin',
        email: 'admin@cfms.com',
        user_type: 'vip',
        displayName: '管理员',
        has_full_access: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'user': {
        id: 2,
        username: 'user',
        email: 'user@cfms.com',
        user_type: 'subscribed',
        has_full_access: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'guest': {
        id: 3,
        username: 'guest',
        email: 'guest@cfms.com',
        user_type: 'free',
        has_full_access: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    const user = mockUsers[username]
    if (user) {
      currentUser.value = user as User
      isLoggedIn.value = true
      localStorage.setItem('auth_user', JSON.stringify(currentUser.value))
      console.log(`强制登录成功: ${username}`)
    }
  }

  function logout() {
    console.log('用户退出登录')
    
    // 调用后端登出接口（如果存在）
    if (token.value) {
      fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      }).catch(err => console.error('登出API调用失败:', err))
    }
    
    isLoggedIn.value = false
    currentUser.value = null
    token.value = ''
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    
    // 使用Vue Router进行跳转
    const router = useRouter()
    router.push('/auth')
  }

  function autoLogin() {
    try {
      const savedUser = localStorage.getItem('auth_user')
      const savedToken = localStorage.getItem('auth_token')
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser)
        currentUser.value = userData
        token.value = savedToken
        isLoggedIn.value = true
        
        // 验证token是否有效
        validateToken().then(isValid => {
          if (!isValid) {
            console.log('Token已失效，清除登录状态')
            logout()
          } else {
            console.log('自动登录成功:', userData.username)
            
            // 获取最新的用户信息
            fetchUserProfile()
          }
        }).catch(() => {
          // 验证失败也清除登录状态
          logout()
        })
      }
    } catch (error) {
      console.error('自动登录失败:', error)
      logout()
    }
  }

  // 验证token有效性
  async function validateToken(): Promise<boolean> {
    if (!token.value) return false
    
    try {
      const response = await fetch(`${API_BASE_URL}/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
      return response.ok
    } catch (error) {
      console.error('Token验证失败:', error)
      return false
    }
  }

  // 检查用户权限
  function hasPermission(requiredType: UserType): boolean {
    if (!currentUser.value) return false
    
    const userLevel = userType.value
    
    // 权限等级：VIP > SUBSCRIBED > FREE
    const levelValue = {
      [UserType.VIP]: 3,
      [UserType.SUBSCRIBED]: 2,
      [UserType.FREE]: 1
    }
    
    return levelValue[userLevel] >= levelValue[requiredType]
  }

  return {
    // 状态
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
    
    // 计算属性
    userType,
    userTypeString,
    userTypeDisplay,
    displayName,
    isSubscriptionValid,
    subscriptionDaysLeft,
    
    // 方法
    login,
    register,
    resetRegisterForm,
    toggleRegisterMode,
    getCaptcha,
    mockLogin,
    checkDatabaseConnection,
    fetchUserProfile,
    forceLogin,
    logout,
    autoLogin,
    validateToken,
    hasPermission
  }
})