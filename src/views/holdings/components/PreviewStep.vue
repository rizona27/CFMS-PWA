<template>
  <div class="preview-step">
    <!-- 转换后数据预览 -->
    <div class="converted-preview">
      <div class="preview-header">
        <h3>转换后数据预览（前5条）</h3>
        <div class="preview-info">
          共 {{ previewData.length }} 条有效数据
        </div>
      </div>
      <div class="preview-container">
        <div class="table-wrapper">
          <table class="preview-table">
            <thead>
              <tr>
                <th>客户姓名</th>
                <th>客户号</th>
                <th>基金代码</th>
                <th>购买金额</th>
                <th>购买份额</th>
                <th>购买日期</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in previewData.slice(0, 5)" :key="index">
                <td>{{ item.clientName }}</td>
                <td>{{ item.clientID }}</td>
                <td>{{ item.fundCode }}</td>
                <td class="numeric">{{ formatNumber(item.purchaseAmount, 2) }}</td>
                <td class="numeric">{{ formatNumber(item.purchaseShares, 4) }}</td>
                <td>{{ formatDate(item.purchaseDate) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 导入统计 -->
    <div class="import-stats">
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-content">
            <div class="stat-value">{{ rawDataLength }}</div>
            <div class="stat-label">总数据行数</div>
          </div>
        </div>
        
        <div class="stat-card valid">
          <div class="stat-content">
            <div class="stat-value">{{ validRowsCount }}</div>
            <div class="stat-label">有效数据行</div>
          </div>
        </div>
        
        <div class="stat-card" :class="{ 'ready': allRequiredFieldsMapped }">
          <div class="stat-content">
            <div class="stat-value">{{ requiredFieldsMappedCount }}/{{ requiredFieldsTotalCount }}</div>
            <div class="stat-label">必填字段已映射</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 导入日志 -->
    <div v-if="importLogs.length > 0" class="import-logs">
      <div class="logs-header">
        <h3>导入日志</h3>
        <button
          class="clear-logs-btn"
          @click="clearLogs"
          :disabled="importLogs.length === 0"
        >
          清空
        </button>
      </div>
      <div class="logs-container">
        <div
          v-for="(log, index) in importLogs.slice(0, 5)"
          :key="index"
          class="log-item"
          :class="getLogTypeClass(log.message)"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-separator">·</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        <div v-if="importLogs.length > 5" class="log-more">
          还有 {{ importLogs.length - 5 }} 条日志...
        </div>
      </div>
    </div>
    
    <!-- 导入按钮 -->
    <div class="import-action">
      <button
        class="import-btn"
        @click="handleStartImport"
        :disabled="isImporting || !allRequiredFieldsMapped"
      >
        <span v-if="!isImporting" class="btn-content">
          <span>开始导入</span>
        </span>
        <span v-else class="btn-content">
          <span class="spinner"></span>
          <span>导入中... {{ progressPercentage }}%</span>
        </span>
      </button>
      <div class="import-progress" v-if="isImporting">
        <div class="progress-bar" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
    </div>
    
    <!-- 导入结果 -->
    <div v-if="importResult" class="import-result">
      <div class="result-header">
        <h3 class="result-title">导入完成</h3>
        <div class="result-summary">
          <span class="summary-item success">
            <span class="summary-count">{{ importResult.success }}</span>
            <span class="summary-label">成功</span>
          </span>
          <span class="summary-divider">·</span>
          <span class="summary-item failed">
            <span class="summary-count">{{ importResult.failed }}</span>
            <span class="summary-label">失败</span>
          </span>
          <span class="summary-divider">·</span>
          <span class="summary-item skipped">
            <span class="summary-count">{{ importResult.skipped }}</span>
            <span class="summary-label">跳过</span>
          </span>
        </div>
      </div>
      
      <!-- 结果卡片 -->
      <div class="result-cards">
        <div class="result-card success">
          <div class="card-content">
            <div class="card-value">{{ importResult.success }}</div>
            <div class="card-label">成功导入</div>
          </div>
        </div>
        
        <div class="result-card failed">
          <div class="card-content">
            <div class="card-value">{{ importResult.failed }}</div>
            <div class="card-label">导入失败</div>
          </div>
        </div>
        
        <div class="result-card skipped">
          <div class="card-content">
            <div class="card-value">{{ importResult.skipped }}</div>
            <div class="card-label">重复跳过</div>
          </div>
        </div>
      </div>
      
      <!-- 错误详情 -->
      <div v-if="importResult.errors.length > 0" class="errors-section">
        <div class="errors-header">
          <h4>错误详情</h4>
          <span class="errors-count">{{ importResult.errors.length }} 个错误</span>
        </div>
        <div class="errors-list">
          <div
            v-for="(error, index) in importResult.errors.slice(0, 3)"
            :key="index"
            class="error-item"
          >
            <span class="error-line">第{{ error.line }}行</span>
            <span class="error-separator">·</span>
            <span class="error-field">{{ error.field }}</span>
            <span class="error-separator">·</span>
            <span class="error-message">{{ error.message }}</span>
          </div>
          <div v-if="importResult.errors.length > 3" class="error-more">
            还有 {{ importResult.errors.length - 3 }} 条错误...
          </div>
        </div>
      </div>
      
      <!-- 结果操作 -->
      <div class="result-actions">
        <button class="result-btn primary" @click="handleGoToHoldings">
          查看持仓
        </button>
        <button class="result-btn secondary" @click="handleImportAnother">
          继续导入
        </button>
      </div>
    </div>
    
    <div class="step-actions" v-if="!importResult">
      <button class="prev-btn" @click="handlePrevStep">
        上一步
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ImportLog {
  time: string
  message: string
}

interface ImportResult {
  success: number
  failed: number
  skipped: number
  errors: Array<{ line: number; field: string; message: string }>
}

interface Props {
  previewData: any[]
  rawDataLength: number
  validRowsCount: number
  importLogs: ImportLog[]
  isImporting: boolean
  progressPercentage: number
  allRequiredFieldsMapped: boolean
  importResult: ImportResult | null
  requiredFieldsTotalCount?: number
  requiredFieldsMappedCount?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'prev-step': []
  'start-import': []
  'go-to-holdings': []
  'import-another': []
  'clear-logs': []
}>()

const handlePrevStep = () => {
  emit('prev-step')
}

const handleStartImport = () => {
  emit('start-import')
}

const handleGoToHoldings = () => {
  emit('go-to-holdings')
}

const handleImportAnother = () => {
  emit('import-another')
}

const clearLogs = () => {
  emit('clear-logs')
}

const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatDate = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return '无效日期'
  return date.toISOString().split('T')[0]
}

const getLogTypeClass = (message: string): string => {
  if (message.includes('失败') || message.includes('错误') || message.includes('异常')) {
    return 'error'
  } else if (message.includes('成功') || message.includes('完成') || message.includes('✓')) {
    return 'success'
  } else if (message.includes('警告') || message.includes('⚠')) {
    return 'warning'
  }
  return 'info'
}
</script>

<style scoped>
.preview-step {
  padding: 8px 0;
}

.converted-preview {
  margin-bottom: 20px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

:root.dark .converted-preview {
  background: rgba(30, 41, 59, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-header h3 {
  color: #374151;
  font-size: 14px;
  margin: 0;
  font-weight: 600;
}

:root.dark .preview-header h3 {
  color: #e5e7eb;
}

.preview-info {
  color: #6b7280;
  font-size: 12px;
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 12px;
}

:root.dark .preview-info {
  color: #9ca3af;
  background: rgba(255, 255, 255, 0.1);
}

.preview-container {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: white;
}

:root.dark .preview-container {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(255, 255, 255, 0.1);
}

.table-wrapper {
  overflow-x: auto;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 500px;
}

.preview-table th {
  background: #f8fafc;
  padding: 8px 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
}

:root.dark .preview-table th {
  background: rgba(30, 41, 59, 0.9);
  color: #e5e7eb;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.preview-table td {
  padding: 6px 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #4b5563;
  white-space: nowrap;
}

:root.dark .preview-table td {
  color: #d1d5db;
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.preview-table tr:hover td {
  background: #f9fafb;
}

:root.dark .preview-table tr:hover td {
  background: rgba(255, 255, 255, 0.05);
}

.numeric {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  text-align: right;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

.import-stats {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  text-align: center;
}

:root.dark .stat-card {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(255, 255, 255, 0.1);
}

.stat-card.total {
  border-color: #3b82f6;
  background: #eff6ff;
}

:root.dark .stat-card.total {
  border-color: #60a5fa;
  background: rgba(59, 130, 246, 0.1);
}

.stat-card.valid {
  border-color: #10b981;
  background: #f0fdf4;
}

:root.dark .stat-card.valid {
  border-color: #34d399;
  background: rgba(16, 185, 129, 0.1);
}

.stat-card.ready {
  border-color: #f59e0b;
  background: #fef3c7;
}

:root.dark .stat-card.ready {
  border-color: #fbbf24;
  background: rgba(245, 158, 11, 0.1);
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:root.dark .stat-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 2px;
}

:root.dark .stat-value {
  color: #f3f4f6;
}

.stat-card.total .stat-value {
  color: #1d4ed8;
}

:root.dark .stat-card.total .stat-value {
  color: #60a5fa;
}

.stat-card.valid .stat-value {
  color: #047857;
}

:root.dark .stat-card.valid .stat-value {
  color: #34d399;
}

.stat-card.ready .stat-value {
  color: #b45309;
}

:root.dark .stat-card.ready .stat-value {
  color: #fbbf24;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

:root.dark .stat-label {
  color: #9ca3af;
}

.import-logs {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

:root.dark .import-logs {
  background: rgba(30, 41, 59, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.logs-header h3 {
  color: #374151;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

:root.dark .logs-header h3 {
  color: #e5e7eb;
}

.clear-logs-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-logs-btn:hover:not(:disabled) {
  background: #dc2626;
}

.clear-logs-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.logs-container {
  max-height: 150px;
  overflow-y: auto;
  padding-right: 4px;
}

.log-item {
  padding: 6px 8px;
  background: white;
  border-radius: 4px;
  margin-bottom: 6px;
  border: 1px solid #e5e7eb;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  animation: fadeIn 0.3s ease;
}

:root.dark .log-item {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(255, 255, 255, 0.1);
}

.log-item.error {
  border-color: #fecaca;
  background: #fef2f2;
}

:root.dark .log-item.error {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
}

.log-item.success {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

:root.dark .log-item.success {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.1);
}

.log-item.warning {
  border-color: #fde68a;
  background: #fffbeb;
}

:root.dark .log-item.warning {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.1);
}

.log-item.info {
  border-color: #bfdbfe;
  background: #eff6ff;
}

:root.dark .log-item.info {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.log-time {
  color: #3b82f6;
  font-weight: 500;
  min-width: 50px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
}

:root.dark .log-time {
  color: #60a5fa;
}

.log-item.error .log-time {
  color: #dc2626;
}

.log-item.success .log-time {
  color: #059669;
}

.log-item.warning .log-time {
  color: #d97706;
}

.log-separator {
  color: #9ca3af;
}

.log-message {
  color: #4b5563;
  flex: 1;
  word-break: break-all;
  line-height: 1.3;
}

:root.dark .log-message {
  color: #d1d5db;
}

.log-item.error .log-message {
  color: #dc2626;
}

.log-item.success .log-message {
  color: #059669;
}

.log-item.warning .log-message {
  color: #d97706;
}

.log-more {
  padding: 8px;
  text-align: center;
  color: #6b7280;
  font-size: 11px;
  font-style: italic;
}

:root.dark .log-more {
  color: #9ca3af;
}

.import-action {
  margin-bottom: 20px;
  text-align: center;
}

.import-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: #3b82f6;
  color: white;
  width: 100%;
  max-width: 200px;
  margin: 0 auto 12px;
}

.import-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.import-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.import-progress {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  max-width: 200px;
  margin: 0 auto;
}

:root.dark .import-progress {
  background: rgba(255, 255, 255, 0.1);
}

.progress-bar {
  height: 100%;
  background: #3b82f6;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.import-result {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
  animation: slideIn 0.5s ease;
}

:root.dark .import-result {
  background: rgba(30, 41, 59, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-header {
  text-align: center;
  margin-bottom: 16px;
}

.result-title {
  color: #10b981;
  font-size: 16px;
  margin: 0 0 8px 0;
  font-weight: 700;
}

:root.dark .result-title {
  color: #34d399;
}

.result-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

:root.dark .result-summary {
  color: #9ca3af;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.summary-item.success .summary-count {
  color: #10b981;
  font-weight: 700;
}

.summary-item.failed .summary-count {
  color: #ef4444;
  font-weight: 700;
}

.summary-item.skipped .summary-count {
  color: #f59e0b;
  font-weight: 700;
}

.summary-divider {
  color: #d1d5db;
}

.result-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.result-card {
  background: white;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  text-align: center;
}

:root.dark .result-card {
  background: rgba(30, 41, 59, 0.7);
}

.result-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:root.dark .result-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.result-card.success {
  border: 1px solid #10b981;
  background: #f0fdf4;
}

:root.dark .result-card.success {
  border-color: #34d399;
  background: rgba(16, 185, 129, 0.1);
}

.result-card.failed {
  border: 1px solid #ef4444;
  background: #fef2f2;
}

:root.dark .result-card.failed {
  border-color: rgba(239, 68, 68, 0.6);
  background: rgba(239, 68, 68, 0.1);
}

.result-card.skipped {
  border: 1px solid #f59e0b;
  background: #fffbeb;
}

:root.dark .result-card.skipped {
  border-color: #fbbf24;
  background: rgba(245, 158, 11, 0.1);
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 2px;
}

:root.dark .card-value {
  color: #f3f4f6;
}

.result-card.success .card-value {
  color: #047857;
}

.result-card.failed .card-value {
  color: #b91c1c;
}

.result-card.skipped .card-value {
  color: #b45309;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

:root.dark .card-label {
  color: #9ca3af;
}

.errors-section {
  background: #fef2f2;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #fecaca;
}

:root.dark .errors-section {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.errors-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.errors-header h4 {
  color: #dc2626;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

:root.dark .errors-header h4 {
  color: #fca5a5;
}

.errors-count {
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
}

.errors-list {
  max-height: 100px;
  overflow-y: auto;
  padding-right: 4px;
}

.error-item {
  padding: 6px 8px;
  background: white;
  border-radius: 4px;
  margin-bottom: 6px;
  border: 1px solid #fecaca;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

:root.dark .error-item {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(239, 68, 68, 0.3);
}

.error-line {
  color: #dc2626;
  font-weight: 600;
  min-width: 40px;
}

.error-separator {
  color: #9ca3af;
}

.error-field {
  color: #374151;
  font-weight: 500;
  min-width: 60px;
}

:root.dark .error-field {
  color: #e5e7eb;
}

.error-message {
  color: #6b7280;
  flex: 1;
  min-width: 150px;
}

:root.dark .error-message {
  color: #d1d5db;
}

.error-more {
  padding: 8px;
  text-align: center;
  color: #6b7280;
  font-size: 11px;
  font-style: italic;
}

:root.dark .error-more {
  color: #9ca3af;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.result-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 100px;
  justify-content: center;
}

.result-btn.primary {
  background: #3b82f6;
  color: white;
}

.result-btn.primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.result-btn.secondary {
  background: #10b981;
  color: white;
}

.result-btn.secondary:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.step-actions {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

:root.dark .step-actions {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.prev-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  display: flex;
  align-items: center;
  gap: 6px;
}

:root.dark .prev-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.2);
}

.prev-btn:hover {
  background: #e5e7eb;
}

:root.dark .prev-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .converted-preview,
  .import-logs,
  .import-result {
    padding: 12px;
    border-radius: 6px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .result-cards {
    grid-template-columns: 1fr;
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .result-btn {
    width: 100%;
  }
  
  .import-btn {
    padding: 10px 20px;
    font-size: 13px;
    max-width: 160px;
  }
  
  .preview-table {
    font-size: 11px;
    min-width: 400px;
  }
  
  .error-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .error-line,
  .error-field,
  .error-message {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .converted-preview,
  .import-logs,
  .import-result {
    padding: 10px;
  }
  
  .stat-card {
    padding: 10px;
  }
  
  .result-card {
    padding: 8px;
  }
  
  .import-btn {
    padding: 8px 16px;
    font-size: 12px;
    max-width: 140px;
  }
  
  .preview-table {
    font-size: 10px;
    min-width: 350px;
  }
  
  .preview-table th,
  .preview-table td {
    padding: 4px 8px;
  }
}
</style>
