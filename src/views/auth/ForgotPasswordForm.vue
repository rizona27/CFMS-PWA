<template>
  <div class="auth-form">
    <div class="form-content">
      <div class="auth-steps-container" :class="{ 'two-steps-active': step === 2 }">
        <!-- 第一步：用户名和邮箱 -->
        <div class="auth-step step-one" :class="{ 'slide-left': step === 2 }">
          <div class="form-group with-icon" :class="{
            'has-error': errors.username,
            'has-success': form.username && !errors.username,
            'focused': isUsernameFocused
          }">
            <div class="icon-container">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="form-group with-icon" :class="{
            'has-error': errors.email,
            'has-success': form.email && !errors.email,
            'focused': isEmailFocused
          }">
            <div class="icon-container">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 第二步：成功消息 -->
        <div class="auth-step step-two" :class="{ 'slide-in': step === 2, 'active': step === 2 }">
          <div class="success-message">
            <div class="success-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="success-text">
              <h3>邮件已发送</h3>
              <p>重置链接已发送到您的邮箱 <strong>{{ form.email }}</strong></p>
              <div class="tips">
                <p>请检查您的收件箱（包括垃圾邮件文件夹）</p>
                <p>链接有效期为24小时</p>
              </div>
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
/* 忘记密码表单特殊样式 */
.success-message {
  text-align: center;
  padding: 24px 16px;
  width: 100%;
}

.success-icon {
  margin-bottom: 20px;
  color: var(--success-color);
}

.success-icon svg {
  width: 36px;
  height: 36px;
  display: block;
  margin: 0 auto;
}

.success-text h3 {
  margin: 0 0 12px 0;
  color: var(--success-color);
  font-size: 16px;
  font-weight: 600;
}

.success-text p {
  margin: 6px 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.4;
}

.success-text strong {
  color: var(--text-primary);
  font-weight: 600;
}

.success-text .tips {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-primary);
}

.success-text .tips p {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 4px 0;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .success-message {
    padding: 20px 12px;
  }
  
  .success-icon svg {
    width: 32px;
    height: 32px;
  }
  
  .success-text h3 {
    font-size: 15px;
    margin-bottom: 10px;
  }
  
  .success-text p {
    font-size: 12px;
  }
  
  .success-text .tips {
    margin-top: 14px;
    padding-top: 10px;
  }
  
  .success-text .tips p {
    font-size: 11px;
  }
  
  /* 修复移动端输入框光标位置 */
  .icon-input {
    line-height: 1.2;
    height: 100%;
    padding-top: 0;
    padding-bottom: 0;
    -webkit-appearance: none;
    appearance: none;
  }
  
  .form-group.with-icon {
    align-items: center;
  }
}

/* 深色模式优化 */
.theme-dark .success-icon {
  color: var(--success-color);
}

.theme-dark .success-text h3 {
  color: var(--success-color);
}

.theme-dark .success-text p {
  color: var(--text-secondary);
}

.theme-dark .success-text .tips {
  border-top-color: var(--border-primary);
}

.theme-dark .success-text .tips p {
  color: var(--text-tertiary);
}

/* 步骤切换动画 */
.auth-step.step-one.slide-left {
  transform: translateX(-100%);
  opacity: 0;
}

.auth-step.step-two {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  visibility: hidden;
}

.auth-step.step-two.slide-in {
  display: block;
}

.auth-step.step-two.active {
  visibility: visible;
  opacity: 1;
}
</style>
