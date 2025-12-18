<template>
  <div class="import-holding-view">
    <!-- 使用统一的 NavBar 组件 -->
    <NavBar title="导入持仓数据" backText="返回" backRoute="/holdings/manage" />
    
    <!-- 固定顶部部分 - 类似 ManageHoldingsView 样式 -->
    <div class="fixed-top-section">
      <div class="top-container">
        <!-- 固定分隔符 - 与 ManageHoldingsView 一致，无底色 -->
        <div class="stylish-divider">
          <div class="divider-line"></div>
          <div class="divider-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
              <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
              <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
              <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
            </svg>
          </div>
          <div class="divider-line"></div>
        </div>
      </div>
    </div>
    
    <!-- 可滚动的内容区域 -->
    <div class="scrollable-content-section">
      <div class="content-scroll">
        <div class="content-wrapper">
          <div class="import-content">
            
            <!-- 步骤指示器 -->
            <StepIndicator
              :current-step="currentStep"
              :steps="steps"
            />
            
            <!-- 步骤内容 -->
            <div class="steps-container">
              <!-- 步骤1: 上传文件 -->
              <UploadStep
                v-if="currentStep === 1"
                :selected-file="selectedFile"
                :file-processed="fileProcessed"
                :file-format-detected="fileFormatDetected"
                @file-selected="handleFileSelect"
                @clear-selection="clearSelection"
                @next-step="nextStep"
              />
              
              <!-- 步骤2: 配置映射 -->
              <MappingStep
                v-if="currentStep === 2"
                :raw-headers="rawHeaders"
                :raw-data="rawData"
                :field-configs="fieldConfigs"
                :all-required-fields-mapped="allRequiredFieldsMapped"
                :has-unmapped-required-fields="hasUnmappedRequiredFields"
                :auto-suggestions="autoSuggestions"
                @field-mapping-change="onFieldMappingChange"
                @apply-suggestion="applySuggestion"
                @prev-step="prevStep"
                @next-step="nextStep"
              />
              
              <!-- 步骤3: 预览和导入 -->
              <PreviewStep
                v-if="currentStep === 3"
                :preview-data="previewData"
                :raw-data-length="rawData.length"
                :valid-rows-count="validRowsCount"
                :import-logs="importLogs"
                :is-importing="isImporting"
                :progress-percentage="progressPercentage"
                :all-required-fields-mapped="allRequiredFieldsMapped"
                :import-result="importResult"
                @prev-step="prevStep"
                @start-import="startImport"
                @go-to-holdings="goToHoldings"
                @import-another="importAnother"
              />
            </div>

            <div class="footer-section">
              <div class="footer-text">
                <span class="gradient-text">Import with precision, manage with confidence.</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import StepIndicator from './components/StepIndicator.vue'
import UploadStep from './components/UploadStep.vue'
import MappingStep from './components/MappingStep.vue'
import PreviewStep from './components/PreviewStep.vue'
import { useImportHolding } from './composables/useImportHolding'

const router = useRouter()

const steps = [
  { number: 1, label: '上传文件' },
  { number: 2, label: '配置映射' },
  { number: 3, label: '预览导入' }
]

const {
  currentStep,
  selectedFile,
  fileProcessed,
  fileFormatDetected,
  rawHeaders,
  rawData,
  fieldConfigs,
  previewData,
  importLogs,
  isImporting,
  progressPercentage,
  importResult,
  allRequiredFieldsMapped,
  hasUnmappedRequiredFields,
  validRowsCount,
  autoSuggestions,
  handleFileSelect,
  clearSelection,
  onFieldMappingChange,
  applySuggestion,
  nextStep,
  prevStep,
  startImport,
  goToHoldings,
  importAnother,
  showNotification
} = useImportHolding()

const goBack = () => {
  router.push('/holdings/manage')
}
</script>

<style scoped>
/* ------------------------------------- */
/* 页面整体布局 - 参考 ManageHoldingsView 的布局 */
/* ------------------------------------- */
.import-holding-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:root.dark .import-holding-view {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

/* 固定顶部部分 - 类似 ManageHoldingsView 样式 */
.fixed-top-section {
  flex-shrink: 0;
  z-index: 90; /* 低于 NavBar */
  padding-top: 0;
  background: transparent; /* 无底色 */
}

.top-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 分隔符样式 - 与 ManageHoldingsView 一致 */
.stylish-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 0 12px;
  opacity: 0.6;
}

.divider-line {
  height: 1px;
  width: 40px;
  background: linear-gradient(90deg, transparent, currentColor);
}

.divider-line:last-child {
  background: linear-gradient(90deg, currentColor, transparent);
}

.divider-icon {
  color: currentColor;
  display: flex;
  align-items: center;
}

:root.dark .stylish-divider {
  color: rgba(255, 255, 255, 0.3);
}

.stylish-divider {
  color: rgba(0, 0, 0, 0.2);
}

/* 可滚动的内容区域 */
.scrollable-content-section {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: transparent;
}

.content-scroll {
  height: 100%;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px 100px;
}

/* 导入内容区域 */
.import-content {
  padding: 16px 0 120px;
}

/* 步骤容器 */
.steps-container {
  background: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

:root.dark .steps-container {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-section {
  margin-top: 30px;
  text-align: center;
  padding: 0 16px;
}

.footer-text {
  padding: 16px 0;
}

.gradient-text {
  font-size: 16px;
  font-weight: 300;
  font-style: italic;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientFlow 4s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .top-container {
    padding: 0 12px;
  }
  
  .content-wrapper {
    padding: 0 12px 80px;
  }
  
  .steps-container {
    padding: 20px;
    border-radius: 16px;
  }
  
  .import-content {
    padding: 12px 0 100px;
  }
  
  .footer-section {
    margin-top: 20px;
  }
  
  .footer-text {
    padding: 12px 0;
  }
  
  .gradient-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .import-content {
    padding: 10px 0 100px;
  }
  
  .steps-container {
    padding: 16px;
    border-radius: 12px;
  }
  
  .footer-section {
    margin-top: 16px;
  }
  
  .footer-text {
    padding: 10px 0;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .scrollable-content-section {
    height: calc(100vh - 60px);
  }
  
  .import-content {
    padding: 10px 0 80px;
  }
}

/* 滚动条样式 */
.content-scroll::-webkit-scrollbar {
  width: 6px;
}

.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

:root.dark .content-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>
