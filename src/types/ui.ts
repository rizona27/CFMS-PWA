import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '../App.vue' // <-- 路径应该正确，因为它导入了同级目录的 App.vue
import router from '../router' // <-- 路径应该正确，因为它会自动查找 ./router/index.ts

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')