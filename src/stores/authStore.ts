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

    // 登录响应类型
    interface LoginResponse {
      success: boolean
      reason?: 'user_missing' | 'password_error' | 'network_error' | 'captcha_error' | 'account_locked' | 'captcha_required'
      message?: string
      attempts?: number
    }

    // 忘记密码响应类型
    interface ForgotPasswordResponse {
      success: boolean
      message?: string
    }

    export const useAuthStore = defineStore('auth', () => {
      // 状态
      const isLoggedIn = ref(false)
      const currentUser = ref<User | null>(null)
      const token = ref<string>('')
      const isLoading = ref(false)
      const error = ref<string>('')
      
      // 错误尝试计数（按用户名）
      const errorAttempts = ref<Record<string, number>>({})
      
      // 后端API地址
      const API_BASE_URL = 'https://cfms.crnas.uk/api'
      
      // 验证码相关状态
      const captchaImage = ref<string>('')
      const captchaId = ref<string>('')
      
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

      async function login(username: string, password: string, captcha_code?: string, captcha_id?: string): Promise<LoginResponse> {
        isLoading.value = true
        error.value = ''
        
        try {
          if (!username || !password) {
            error.value = '请输入用户名和密码'
            return { success: false, reason: 'network_error', message: '请输入用户名和密码' }
          }

          // 获取当前用户的错误尝试次数
          const attempts = errorAttempts.value[username] || 0
          
          // 如果需要验证码但未提供验证码
          if (attempts >= 3 && !captcha_id) {
            return {
              success: false,
              reason: 'captcha_required',
              message: '请输入验证码',
              attempts
            }
          }

          const requestData: any = { username, password }
          if (captcha_code && captcha_id) {
            requestData.captcha_code = captcha_code
            requestData.captcha_id = captcha_id
          }

          const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
            credentials: 'include'
          })

          const data = await response.json()
          
          if (response.ok && data.success) {
            // 登录成功，重置错误计数
            errorAttempts.value[username] = 0
            
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
            
            localStorage.setItem('auth_user', JSON.stringify(currentUser.value))
            localStorage.setItem('auth_token', token.value)
            return { success: true }
          } else {
            // 处理不同类型的错误
            if (data.error?.includes('验证码') || data.error?.includes('captcha')) {
              // 验证码错误
              return {
                success: false,
                reason: 'captcha_error',
                message: data.error || '验证码错误',
                attempts
              }
            } else if (data.error?.includes('不存在') || data.message?.includes('不存在')) {
              // 用户不存在
              return {
                success: false,
                reason: 'user_missing',
                message: data.error || '用户不存在',
                attempts: 0
              }
            } else if (data.error?.includes('锁定')) {
              // 账户已锁定
              errorAttempts.value[username] = 5
              return {
                success: false,
                reason: 'account_locked',
                message: data.error || '账户已被锁定',
                attempts: 5
              }
            } else if (response.status === 400 && (data.error?.includes('验证码') || data.message?.includes('验证码'))) {
              // 状态不同步：前端不知道需要验证码，但后端要求验证码
              // 自动获取验证码
              await getCaptcha()
              return {
                success: false,
                reason: 'captcha_required',
                message: '请输入验证码',
                attempts: attempts >= 3 ? attempts : 3 // 最少设置为3次
              }
            } else {
              // 密码错误，增加错误计数
              const newAttempts = attempts + 1
              errorAttempts.value[username] = newAttempts
              
              let reason: LoginResponse['reason'] = 'password_error'
              let message = data.error || '用户名或密码错误'
              
              if (newAttempts >= 5) {
                reason = 'account_locked'
                message = '密码错误次数过多，账户已被锁定'
              } else if (newAttempts >= 3) {
                message = `用户名或密码错误，剩余尝试次数: ${5 - newAttempts}，需要验证码`
              } else {
                message = `用户名或密码错误，剩余尝试次数: ${5 - newAttempts}`
              }
              
              return {
                success: false,
                reason,
                message,
                attempts: newAttempts
              }
            }
          }
        } catch (err: any) {
          error.value = err.message || '登录失败，请检查网络连接'
          return { success: false, reason: 'network_error', message: error.value }
        } finally {
          isLoading.value = false
        }
      }

      async function register(formData: RegisterForm): Promise<boolean> {
        isLoading.value = true
        error.value = ''
        
        try {
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
            headers: { 'Content-Type': 'application/json' },
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
            return true
          } else {
            error.value = data.error || data.message || '注册失败'
            if (data.error && (data.error.includes('验证码') || data.error.includes('captcha'))) {
              await getCaptcha()
            }
            return false
          }
        } catch (err: any) {
          error.value = err.message || '注册失败，请检查网络连接'
          return false
        } finally {
          isLoading.value = false
        }
      }

      // ========== 密码找回相关方法 ==========

      async function forgotPassword(username: string, email: string): Promise<ForgotPasswordResponse> {
        isLoading.value = true
        error.value = ''
        
        try {
          console.log(`密码找回请求: ${username}, ${email}`)
          if (!username || !email) {
            error.value = '用户名和邮箱不能为空'
            return { success: false, message: '用户名和邮箱不能为空' }
          }

          const response = await fetch(`${API_BASE_URL}/password/forgot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email }),
            credentials: 'include'
          })

          const data = await response.json()
          
          if (response.ok && data.success) {
            error.value = data.message || '重置链接已发送到您的邮箱'
            return {
              success: true,
              message: data.message || '重置链接已发送到您的邮箱，请查收邮件'
            }
          } else {
            const errorMsg = data.error || data.message || '密码找回失败，请检查输入信息'
            error.value = errorMsg
            return {
              success: false,
              message: errorMsg
            }
          }
        } catch (err: any) {
          console.error('密码找回错误:', err)
          const errorMsg = err.message || '密码找回失败，请检查网络连接'
          error.value = errorMsg
          return {
            success: false,
            message: errorMsg
          }
        } finally {
          isLoading.value = false
        }
      }

      async function resetPassword(tokenStr: string, newPassword: string): Promise<boolean> {
        isLoading.value = true
        error.value = ''
        
        try {
          if (!tokenStr || !newPassword) {
            error.value = '令牌和新密码不能为空'
            return false
          }

          if (newPassword.length < 6) {
            error.value = '密码长度至少6位'
            return false
          }

          const response = await fetch(`${API_BASE_URL}/password/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenStr, new_password: newPassword }),
            credentials: 'include'
          })

          const data = await response.json()
          
          if (response.ok && data.success) {
            error.value = data.message || '密码重置成功'
            return true
          } else {
            error.value = data.error || data.message || '密码重置失败'
            return false
          }
        } catch (err: any) {
          console.error('密码重置错误:', err)
          error.value = err.message || '密码重置失败，请检查网络连接'
          return false
        } finally {
          isLoading.value = false
        }
      }

      async function validateResetToken(tokenStr: string): Promise<{ valid: boolean; username?: string; message?: string }> {
        try {
          const response = await fetch(`${API_BASE_URL}/password/validate-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenStr }),
            credentials: 'include'
          })

          const data = await response.json()
          if (response.ok && data.success) {
            return {
              valid: data.valid || false,
              username: data.username
            }
          } else {
            return {
              valid: false,
              message: data.message || data.error || '重置链接无效'
            }
          }
        } catch (err: any) {
          console.error('验证重置令牌错误:', err)
          return {
            valid: false,
            message: err.message || '网络连接失败'
          }
        }
      }

      // ========== 辅助与持久化方法 ==========

      function clearError() {
        error.value = ''
      }

      function resetErrorAttempts(username: string) {
        if (errorAttempts.value[username]) {
          delete errorAttempts.value[username]
        }
      }

      function getErrorAttempts(username: string): number {
        return errorAttempts.value[username] || 0
      }

      async function checkDatabaseConnection(): Promise<boolean> {
        try {
          const response = await fetch(`${API_BASE_URL}/health`)
          return response.ok
        } catch (error) {
          return false
        }
      }

      async function fetchUserProfile(): Promise<void> {
        if (!currentUser.value || !token.value) return
        try {
          const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token.value}` },
            credentials: 'include'
          })
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              currentUser.value = { ...currentUser.value, ...data.user }
              localStorage.setItem('auth_user', JSON.stringify(currentUser.value))
            }
          }
        } catch (err) {
          console.error('获取用户信息失败:', err)
        }
      }

      function logout() {
        isLoggedIn.value = false
        currentUser.value = null
        token.value = ''
        errorAttempts.value = {}
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
        
        setTimeout(() => {
          window.location.hash = '#/auth'
          setTimeout(() => window.location.reload(), 100)
        }, 100)
      }

      function autoLogin() {
        try {
          const savedUser = localStorage.getItem('auth_user')
          const savedToken = localStorage.getItem('auth_token')
          if (savedUser && savedToken) {
            currentUser.value = JSON.parse(savedUser)
            token.value = savedToken
            isLoggedIn.value = true
            fetchUserProfile()
            return true
          }
          return false
        } catch (error) {
          logout()
          return false
        }
      }

      async function validateToken(): Promise<boolean> {
        if (!token.value) return false
        try {
          const response = await fetch(`${API_BASE_URL}/validate-token`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token.value}` },
            credentials: 'include'
          })
          return response.ok
        } catch (error) {
          return false
        }
      }

      function hasPermission(requiredType: UserType): boolean {
        if (!currentUser.value) return false
        const levelValue = { [UserType.VIP]: 3, [UserType.SUBSCRIBED]: 2, [UserType.FREE]: 1 }
        return levelValue[userType.value] >= levelValue[requiredType]
      }

      // 新增：检查用户名是否存在（用于注册时的实时验证）
      async function checkUsernameExists(username: string): Promise<{ exists: boolean; is_locked?: boolean }> {
        try {
          if (!username || username.length < 3) {
            return { exists: false }
          }
          
          const response = await fetch(`${API_BASE_URL}/check_user_exists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
            credentials: 'include'
          })
          
          const data = await response.json()
          if (response.ok && data.success) {
            return {
              exists: data.exists || false,
              is_locked: data.is_locked || false
            }
          } else {
            return { exists: false }
          }
        } catch (err) {
          console.error('检查用户名存在错误:', err)
          return { exists: false }
        }
      }

      return {
        isLoggedIn,
        currentUser,
        token,
        isLoading,
        error,
        captchaImage,
        captchaId,
        userType,
        userTypeString,
        userTypeDisplay,
        displayName,
        isSubscriptionValid,
        subscriptionDaysLeft,
        login,
        register,
        forgotPassword,
        resetPassword,
        validateResetToken,
        clearError,
        resetErrorAttempts,
        getErrorAttempts,
        getCaptcha,
        checkDatabaseConnection,
        fetchUserProfile,
        logout,
        autoLogin,
        validateToken,
        hasPermission,
        checkUsernameExists
      }
    })
