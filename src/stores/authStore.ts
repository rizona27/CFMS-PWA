import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 定义用户类型枚举
export enum UserType {
  FREE = 'free',
  SUBSCRIBED = 'subscribed',
  VIP = 'vip'
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const isLoggedIn = ref(false)
  const currentUser = ref<{
    username: string
    userType: UserType
    displayName?: string
  } | null>(null)

  // 计算属性
  const userType = computed(() => {
    return currentUser.value?.userType || UserType.FREE
  })

  const displayName = computed(() => {
    if (!currentUser.value) return '未登录'
    const username = currentUser.value.username
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()
  })

  // 将UserType转换为字符串格式
  const userTypeString = computed(() => {
    switch (userType.value) {
      case UserType.VIP:
        return 'vip'
      case UserType.SUBSCRIBED:
        return 'subscribed'
      case UserType.FREE:
      default:
        return 'free'
    }
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

  // 方法
  function login(username: string, password: string): boolean {
    // 模拟登录逻辑
    console.log(`登录尝试: ${username}`)

    if (!username || !password) {
      throw new Error('请输入用户名和密码')
    }

    // 模拟用户数据
    const mockUsers: Record<string, { username: string; userType: UserType; displayName?: string }> = {
      'admin': {
        username: 'admin',
        userType: UserType.VIP,
        displayName: '管理员'
      },
      'user': {
        username: 'user',
        userType: UserType.SUBSCRIBED
      },
      'guest': {
        username: 'guest',
        userType: UserType.FREE
      }
    }

    const user = mockUsers[username]
    if (user) {
      currentUser.value = user
      isLoggedIn.value = true
      
      localStorage.setItem('auth_user', JSON.stringify(currentUser.value))
      console.log(`登录成功: ${username} (${user.userType})`)
      return true
    } else {
      throw new Error('用户名或密码错误')
    }
  }

  // 添加一个强制登录方法用于测试
  function forceLogin(username: string) {
    const mockUsers: Record<string, { username: string; userType: UserType; displayName?: string }> = {
      'admin': {
        username: 'admin',
        userType: UserType.VIP,
        displayName: '管理员'
      },
      'user': {
        username: 'user',
        userType: UserType.SUBSCRIBED
      },
      'guest': {
        username: 'guest',
        userType: UserType.FREE
      }
    }

    const user = mockUsers[username]
    if (user) {
      currentUser.value = user
      isLoggedIn.value = true
      localStorage.setItem('auth_user', JSON.stringify(currentUser.value))
      console.log(`强制登录成功: ${username}`)
    }
  }

  function logout() {
    console.log('用户退出登录')
    isLoggedIn.value = false
    currentUser.value = null
    localStorage.removeItem('auth_user')
  }

  function autoLogin() {
    try {
      const savedUser = localStorage.getItem('auth_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        currentUser.value = userData
        isLoggedIn.value = true
        console.log('自动登录成功:', userData.username)
      }
    } catch (error) {
      console.error('自动登录失败:', error)
      logout()
    }
  }

  return {
    // 状态
    isLoggedIn,
    currentUser,
    
    // 计算属性
    userType,
    userTypeString,
    userTypeDisplay,
    displayName,
    
    // 方法
    login,
    forceLogin,
    logout,
    autoLogin
  }
})