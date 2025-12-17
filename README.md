# CFMS · 一基暴富 (PWA)

**CFMS · 一基暴富** 是基于 Vue 3 + TypeScript 构建的基金资产管理程序。通过类原生应用的 PWA 架构，提供组合追踪方案。

------


![Android](https://img.shields.io/badge/Android-3DDC84?style=flat-square&logo=android&logoColor=white) ![iOS](https://img.shields.io/badge/iOS-000000?style=flat-square&logo=apple&logoColor=white) ![Web](https://img.shields.io/badge/Web-4285F4?style=flat-square&logo=google-chrome&logoColor=white) ![PC](https://img.shields.io/badge/PC-0078D4?style=flat-square&logo=windows&logoColor=white) ![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=flat-square&logo=vuedotjs&logoColor=4FC08D) ![License: GPL 3.0](https://img.shields.io/badge/License-GPL%203.0-blue.svg?style=flat-square&logo=gnu&logoColor=white)



## ✨ 程序设计

### 📱 移动端部分

- **iOS 风格交互**：毛玻璃效果+适配移动端手势。
- **PWA 支持**：支持添加到主屏幕，支持离线运行与类原生动画。
- **响应式设计**：不同尺寸移动端优化，支持深色/浅色模式切换。

### 📊 数据部分

- **收益计算**：数据库最新净值，计算累计盈亏、年化收益及多周期表现排行。
- **状态管理**：利用 Pinia 驱动的 `dataStore` 实现即时响应与本地持久化。
- **API 监控**：支持日志查看网络请求状态与数据缓存（IndexedDB/LocalStorage）。

### 🛠 导入/导出

- **复杂文件解析**：支持 Excel/CSV 自动字段映射与数据清洗。
- **批量管理**：提供持仓批量编辑以及安全的数据清空机制。
- **数据备份**：支持将数据导出为标准格式，或上传云端，确保数据可迁移性。

### 🔐 权限与安全

- **隐私保护**：一键开启“隐私模式”，模糊敏感金额显示，保护公共场合的财务隐私。

------

## 🛠 技术栈

| **领域**      | **技术方案**                            |
| ------------- | --------------------------------------- |
| **核心框架**  | Vue 3.5+ (Composition API)              |
| **状态管理**  | Pinia (Modularized)                     |
| **构建/开发** | Vite 6.0                                |
| **类型安全**  | TypeScript 5.0                          |
| **表格处理**  | XLSX (SheetJS)                          |
| **样式系统**  | CSS Variables + Scoped CSS (高级动效库) |
| **路由管理**  | Vue Router 4 (包含动态过渡与守卫)       |

------

## 📂 核心目录结构

Plaintext

```
src/
├── components/
│   ├── layout/         # NavBar, CustomTabBar (导航核心)
│   ├── common/         # CustomCard, ToastMessage, EmptyState (原子组件)
│   └── feedback/       # NoFilterResults (反馈组件)
├── stores/
│   ├── dataStore.ts    # 资产计算核心逻辑、持久化、日志
│   └── authStore.ts    # 鉴权、用户等级、激活逻辑
├── services/
│   └── fundService.ts  # 基金净值抓取与 API 封装
├── views/
│   ├── holdings/       # Add/Edit/Import/Export/Manage (持仓管理全家桶)
│   ├── statistics/     # Summary, TopPerformers (数据看板)
│   └── system/         # Auth, Activation, Config, APILog (系统基建)
└── utils/              # 导入导出工具函数、日期格式化
```

### 

------

## 📝 备注

- **API 部分**：项目默认指向 `https://cfms.crnas.uk`。如需私有化部署后端，请修改 `fundService.ts` 中的 `API_BASE_URL`。
- **数据安全**：所有持仓计算均在前端完成，后端不存储用户数据（除非主动同步）。
- **开发环境**：`AuthView.vue` 已内置开发环境 Banner，方便在测试期间使用模拟登录模式。



⚠️ 免责声明与非商业化声明 (Disclaimer) 

1. **非盈利性声明**：本项目是一个开源的基金管理工具，仅供**学习、交流及个人管理**使用。作者从未授权、也不会将本项目用于任何形式的商业用途或盈利活动（包括但不限于付费订阅、打包售卖、植入广告等）。 

2.  **数据所有权**：本项目不存储、不分发也不拥有任何基金行情数据。所有数据均通过网络公开接口实时获取，数据版权归原服务商所有。

3. **禁止商用**：任何单位或个人不得将本项目及其源代码用于任何形式的商业盈利目的。如因违反此声明产生的法律纠纷，由违规者自行承担。 

   ## 🙏 致谢

   **天天基金**、**同花顺 **：提供了高效的实时行情数据参考。 

   如有侵权或需移除接口调用，请通过邮件联系作者。

© 2025 [rizona.cn](mailto:rizona.cn@gmail.com)
