<template>
  <div class="auth-form">
    <div class="form-content" :style="{ minHeight: step === 1 ? '180px' : '220px', padding: '10px 0' }">
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

// 添加用户名检查
watch(() => form.username, (newUsername) => {
  if (newUsername && newUsername.length >= 3) {
    // 延迟检查，避免频繁请求
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
.form-content {
  padding: 10px 0 !important;
  min-height: 180px;
  position: relative;
}

.form-group.with-icon {
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.form-group.with-icon.focused {
  z-index: 100;
  position: relative;
  transform: translateZ(0);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.auth-steps-container {
  position: relative;
  min-height: 140px;
  transition: min-height 0.3s ease;
}

.auth-step.step-two {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--card-bg);
  border-radius: 12px;
  z-index: 5;
}

.auth-step.step-two.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-step.step-two.slide-in {
  display: flex;
}

.auth-step.step-one.slide-left {
  transform: translateX(-100%);
  opacity: 0;
}

.auth-step {
  transition: all 0.3s ease;
}

.success-message {
  text-align: center;
  padding: 20px;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.success-text h3 {
  margin: 0 0 10px 0;
  color: #10b981;
}

.success-text p {
  margin: 8px 0;
  color: #64748b;
}

.success-text .tips {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 15px;
}

.theme-dark .success-text h3 {
  color: #34d399;
}

.theme-dark .success-text p {
  color: #cbd5e1;
}

.theme-dark .success-text .tips {
  color: #94a3b8;
}

.auth-button-area {
  margin-top: 0 !important; /* 移除冗余间距，由父容器控制 */
}

/* 移动端适配 */
@media (max-width: 480px) {
  .button-group.two-buttons {
    display: flex;
    flex-direction: row;
    gap: 12px;
    width: 100%;
  }
  
  .back-button, .gradient-button {
    flex: 1;
    min-width: auto;
  }
  
  .form-content {
    min-height: 160px;
  }
  
  .auth-steps-container {
    min-height: 120px;
  }
}
</style>

<style scoped src="./styles/auth-styles.css"></style>
