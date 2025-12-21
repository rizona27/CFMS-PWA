<template>
  <div class="auth-form">
    <div class="form-content">
      <div class="auth-steps-container" :class="{ 'two-steps-active': step === 2 }">
        <div class="auth-step step-one" :class="{ 'slide-left': step === 2 }">
          <div class="form-group with-icon" :class="{
            'has-error': errors.username,
            'has-success': form.username && !errors.username,
            'focused': isUsernameFocused
          }">
            <div class="icon-container">
              <span class="input-icon">👤</span>
            </div>
            <input
              v-model="form.username"
              type="text"
              placeholder="用户名"
              required
              autocomplete="username"
              class="icon-input"
              maxlength="10"
              @input="validateUsername"
              @focus="() => { isUsernameFocused = true; handleInputFocus() }"
              @blur="() => { isUsernameFocused = false; handleInputBlur() }"
            />
            <div class="input-actions">
              <button
                v-if="form.username"
                type="button"
                class="clear-button"
                @click="form.username = ''; validateUsername()"
                title="清除"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div class="form-group with-icon" :class="{
            'has-error': errors.email,
            'has-success': form.email && !errors.email,
            'focused': isEmailFocused
          }">
            <div class="icon-container">
              <span class="input-icon">📧</span>
            </div>
            <input
              v-model="form.email"
              type="email"
              placeholder="注册邮箱"
              required
              autocomplete="email"
              class="icon-input"
              @input="validateEmail"
              @focus="() => { isEmailFocused = true; handleInputFocus() }"
              @blur="() => { isEmailFocused = false; handleInputBlur() }"
            />
            <div class="input-actions">
              <button
                v-if="form.email"
                type="button"
                class="clear-button"
                @click="form.email = ''; validateEmail()"
                title="清除"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        
        <div class="auth-step step-two" :class="{ 'slide-in': step === 2, 'active': step === 2 }">
          <div class="success-message">
            <div class="success-icon">✅</div>
            <div class="success-text">
              <h3>邮件已发送</h3>
              <p>重置链接已发送到您的邮箱 <strong>{{ form.email }}</strong></p>
              <p class="tips">请检查您的收件箱（包括垃圾邮件文件夹）</p>
              <p class="tips">链接有效期为24小时</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="auth-button-area">
      <div v-if="step === 1" class="button-container">
        <div class="button-group two-buttons">
          <button
            type="button"
            class="auth-button back-button"
            @click="$emit('back')"
            :disabled="isLoading"
          >
            <span class="button-text">返回</span>
          </button>
          <button
            type="button"
            class="auth-button gradient-button"
            @click="handleSubmit"
            :disabled="isLoading || !isFormValid"
          >
            <span class="button-text">{{ isLoading ? '发送中...' : '发送重置链接' }}</span>
            <div v-if="isLoading" class="button-loading">
              <div class="loading-spinner"></div>
            </div>
          </button>
        </div>
      </div>
      
      <div v-else class="button-container">
        <div class="button-group single-button">
          <button
            type="button"
            class="auth-button gradient-button"
            @click="$emit('back')"
          >
            <span class="button-text">返回登录</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './styles/auth-styles.css'
import { ref, computed, reactive, watch } from 'vue'

interface Props {
  isLoading?: boolean
}

interface Emits {
  (e: 'submit', form: any): void
  (e: 'back'): void
  (e: 'check-username', username: string): void
  (e: 'clear-global-error'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const emit = defineEmits<Emits>()

const step = ref(1)
const isUsernameFocused = ref(false)
const isEmailFocused = ref(false)

const form = reactive({
  username: '',
  email: ''
})

const errors = reactive({
  username: '',
  email: ''
})

const isFormValid = computed(() => {
  return form.username.length >= 3 &&
         validateEmailFormat(form.email)
})

const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateUsername = () => {
  const username = form.username
  if (!username) {
    errors.username = ''
  } else if (username.length < 3) {
    errors.username = ''
  } else {
    errors.username = ''
  }
  emit('clear-global-error')
}

const validateEmail = () => {
  const email = form.email
  if (!email) {
    errors.email = ''
  } else if (!validateEmailFormat(email)) {
    errors.email = ''
  } else {
    errors.email = ''
  }
  emit('clear-global-error')
}

const handleInputFocus = (event?: Event) => {
  if (event) {
    const input = event.target as HTMLElement
    input.parentElement?.classList.add('focused')
  }
}

const handleInputBlur = (event?: Event) => {
  if (event) {
    const input = event.target as HTMLElement
    input.parentElement?.classList.remove('focused')
  }
}

watch(() => form.username, (newUsername) => {
  if (newUsername && newUsername.length >= 3) {
    const timer = setTimeout(() => {
      emit('check-username', newUsername)
    }, 500)
    return () => clearTimeout(timer)
  }
  emit('clear-global-error')
})

const handleSubmit = async () => {
  validateUsername()
  validateEmail()
  
  if (errors.username || errors.email) {
    return
  }
  
  try {
    await emit('submit', form)
    step.value = 2
  } catch (err: any) {
    console.error('提交失败:', err)
  }
}
</script>

<style scoped>
/* 移除所有内部样式，使用统一的 auth-styles.css */
</style>