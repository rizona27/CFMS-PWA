<template>
  <div class="mapping-step">
    <!-- 文件原始数据预览 -->
    <div class="original-preview">
      <div class="preview-header">
        <h3>原始数据预览（前5行）</h3>
        <div class="preview-info">
          共 {{ rawData.length }} 行数据
        </div>
      </div>
      <div class="preview-container">
        <div class="table-wrapper">
          <table class="preview-table">
            <thead>
              <tr>
                <th v-for="(header, index) in rawHeaders" :key="index" class="col-header">
                  <div class="header-content">
                    <span class="col-title">{{ header || `列${index + 1}` }}</span>
                    <span class="col-index">列{{ index + 1 }}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in rawData.slice(0, 5)" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="cell-data">
                  {{ cell || '(空)' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 字段映射配置 -->
    <div class="field-mapping">
      <div class="mapping-header">
        <h3>字段映射配置</h3>
        <div class="mapping-stats">
          <span class="stat-item" :class="{ 'completed': allRequiredFieldsMapped }">
            {{ requiredMappedCount }}/{{ requiredFieldsCount }} 必填字段
          </span>
        </div>
      </div>
      
      <div class="mapping-content">
        <div class="required-fields">
          <div class="fields-section-title">
            <span class="section-badge required">必填</span>
          </div>
          <div class="fields-grid">
            <div
              v-for="field in requiredFieldConfigs"
              :key="field.id"
              class="field-card"
              :class="{ 'mapped': field.columnIndex !== null && field.columnIndex >= 0 }"
            >
              <div class="field-header">
                <div class="field-title">
                  <span class="field-name">{{ field.label }} <span class="field-desc">({{ field.description }})</span></span>
                </div>
                <div class="field-status">
                  <span v-if="field.columnIndex !== null && field.columnIndex >= 0" class="status-mapped">
                    已映射
                  </span>
                  <span v-else class="status-required">
                    必填
                  </span>
                </div>
              </div>
              
              <div class="field-controls">
                <div class="select-wrapper">
                  <select
                    v-model="field.columnIndex"
                    @change="handleFieldChange(field)"
                    class="column-select"
                  >
                    <option value="-1">-- 请选择 --</option>
                    <option
                      v-for="(header, index) in rawHeaders"
                      :key="index"
                      :value="index"
                    >
                      {{ header || `列${index + 1}` }}
                    </option>
                  </select>
                  <div class="select-arrow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                <div v-if="field.columnIndex !== null && field.columnIndex >= 0" class="sample-data">
                  <span class="sample-label">示例：</span>
                  <span class="sample-value">{{ getFullSampleData(field.columnIndex) || '(无数据)' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="optional-fields">
          <div class="fields-section-title">
            <span class="section-badge optional">可选</span>
          </div>
          <div class="fields-grid">
            <div
              v-for="field in optionalFieldConfigs"
              :key="field.id"
              class="field-card optional"
              :class="{ 'mapped': field.columnIndex !== null && field.columnIndex >= 0 }"
            >
              <div class="field-header">
                <div class="field-title">
                  <span class="field-name">{{ field.label }} <span class="field-desc">({{ field.description }})</span></span>
                </div>
                <div class="field-status">
                  <span v-if="field.columnIndex !== null && field.columnIndex >= 0" class="status-mapped">
                    已映射
                  </span>
                  <span v-else class="status-optional">
                    可选
                  </span>
                </div>
              </div>
              
              <div class="field-controls">
                <div class="select-wrapper">
                  <select
                    v-model="field.columnIndex"
                    @change="handleFieldChange(field)"
                    class="column-select"
                  >
                    <option value="-1">-- 请选择 --</option>
                    <option
                      v-for="(header, index) in rawHeaders"
                      :key="index"
                      :value="index"
                    >
                      {{ header || `列${index + 1}` }}
                    </option>
                  </select>
                  <div class="select-arrow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                <div v-if="field.columnIndex !== null && field.columnIndex >= 0" class="sample-data">
                  <span class="sample-label">示例：</span>
                  <span class="sample-value">{{ getFullSampleData(field.columnIndex) || '(无数据)' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 智能推荐 -->
    <div v-if="hasUnmappedRequiredFields && autoSuggestions.length > 0" class="auto-suggestion">
      <div class="suggestion-header">
        <h3>智能推荐</h3>
        <p>系统检测到以下可能的映射关系：</p>
      </div>
      <div class="suggestions">
        <button
          v-for="suggestion in autoSuggestions"
          :key="suggestion.fieldId"
          @click="handleApplySuggestion(suggestion)"
          class="suggestion-btn"
        >
          <span class="suggestion-text">{{ suggestion.message }}</span>
        </button>
      </div>
    </div>
    
    <div class="step-actions">
      <button class="prev-btn" @click="handlePrevStep">
        上一步
      </button>
      <button
        class="next-btn"
        @click="handleNextStep"
        :disabled="!allRequiredFieldsMapped"
      >
        下一步：预览导入
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FieldConfig {
  id: string
  label: string
  required: boolean
  description: string
  columnIndex: number | null
}

interface AutoSuggestion {
  fieldId: string
  columnIndex: number
  message: string
}

interface Props {
  rawHeaders: string[]
  rawData: any[][]
  fieldConfigs: FieldConfig[]
  allRequiredFieldsMapped: boolean
  hasUnmappedRequiredFields: boolean
  autoSuggestions: AutoSuggestion[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'field-mapping-change': [field: FieldConfig]
  'apply-suggestion': [suggestion: AutoSuggestion]
  'prev-step': []
  'next-step': []
}>()

const requiredFieldConfigs = computed(() => {
  return props.fieldConfigs.filter(field => field.required)
})

const optionalFieldConfigs = computed(() => {
  return props.fieldConfigs.filter(field => !field.required)
})

const requiredFieldsCount = computed(() => {
  return requiredFieldConfigs.value.length
})

const requiredMappedCount = computed(() => {
  return requiredFieldConfigs.value.filter(
    field => field.columnIndex !== null && field.columnIndex >= 0
  ).length
})

const handleFieldChange = (field: FieldConfig) => {
  emit('field-mapping-change', field)
}

const handleApplySuggestion = (suggestion: AutoSuggestion) => {
  emit('apply-suggestion', suggestion)
}

const handlePrevStep = () => {
  emit('prev-step')
}

const handleNextStep = () => {
  emit('next-step')
}

const getFullSampleData = (columnIndex: number | null): string => {
  if (columnIndex === null || columnIndex < 0 || props.rawData.length === 0) {
    return ''
  }
  
  const samples = []
  for (let i = 0; i < Math.min(3, props.rawData.length); i++) {
    const sample = props.rawData[i]?.[columnIndex]
    if (sample !== undefined && sample !== null && sample !== '') {
      samples.push(sample.toString())
    }
  }
  
  if (samples.length === 0) {
    return ''
  }
  
  if (samples.length > 1) {
    return samples.slice(0, 3).join(' | ')
  }
  
  return samples[0]
}
</script>

<style scoped>
.mapping-step {
  padding: 8px 0;
}

.original-preview {
  margin-bottom: 24px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

:root.dark .original-preview {
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
  max-height: 200px;
  font-size: 12px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
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

.col-header {
  min-width: 100px;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.col-title {
  font-weight: 600;
  color: #374151;
  font-size: 12px;
}

:root.dark .col-title {
  color: #e5e7eb;
}

.col-index {
  font-size: 10px;
  color: #9ca3af;
}

.cell-data {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 11px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-mapping {
  margin-bottom: 24px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

:root.dark .field-mapping {
  background: rgba(30, 41, 59, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

.mapping-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mapping-header h3 {
  color: #374151;
  font-size: 14px;
  margin: 0;
  font-weight: 600;
}

:root.dark .mapping-header h3 {
  color: #e5e7eb;
}

.mapping-stats {
  display: flex;
  gap: 8px;
}

.stat-item {
  font-size: 12px;
  padding: 4px 8px;
  background: #e5e7eb;
  border-radius: 12px;
  color: #6b7280;
  font-weight: 500;
}

:root.dark .stat-item {
  background: rgba(255, 255, 255, 0.1);
  color: #9ca3af;
}

.stat-item.completed {
  background: #10b981;
  color: white;
}

.mapping-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.fields-section-title {
  margin-bottom: 12px;
}

.section-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.section-badge.required {
  background: #fee2e2;
  color: #dc2626;
}

.section-badge.optional {
  background: #e0e7ff;
  color: #4f46e5;
}

:root.dark .section-badge.required {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

:root.dark .section-badge.optional {
  background: rgba(79, 70, 229, 0.2);
  color: #a5b4fc;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.field-card {
  background: white;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  min-height: 100px;
}

:root.dark .field-card {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(255, 255, 255, 0.1);
}

.field-card.mapped {
  border-color: #10b981;
  background: #f0fdf4;
}

:root.dark .field-card.mapped {
  border-color: #34d399;
  background: rgba(16, 185, 129, 0.1);
}

.field-card.optional.mapped {
  border-color: #3b82f6;
  background: #eff6ff;
}

:root.dark .field-card.optional.mapped {
  border-color: #60a5fa;
  background: rgba(59, 130, 246, 0.1);
}

.field-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:root.dark .field-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.field-title {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 2px;
}

.field-name {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

:root.dark .field-name {
  color: #f3f4f6;
}

.field-desc {
  font-weight: normal;
  color: #6b7280;
  font-size: 11px;
}

:root.dark .field-desc {
  color: #9ca3af;
}

.field-status {
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 500;
  flex-shrink: 0;
}

.status-mapped {
  color: #10b981;
}

.status-required {
  color: #dc2626;
}

.status-optional {
  color: #6b7280;
}

:root.dark .status-optional {
  color: #9ca3af;
}

.field-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.select-wrapper {
  position: relative;
}

.column-select {
  width: 100%;
  padding: 6px 12px;
  padding-right: 30px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  color: #374151;
  background: white;
  transition: all 0.2s ease;
  appearance: none;
  cursor: pointer;
}

:root.dark .column-select {
  background: rgba(30, 41, 59, 0.9);
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.2);
}

.column-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

:root.dark .column-select:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

:root.dark .select-arrow {
  color: #9ca3af;
}

.sample-data {
  background: #f8fafc;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 11px;
  color: #6b7280;
  display: flex;
  gap: 4px;
  align-items: flex-start;
}

:root.dark .sample-data {
  background: rgba(255, 255, 255, 0.05);
  color: #9ca3af;
}

.sample-label {
  font-weight: 500;
  flex-shrink: 0;
}

.sample-value {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auto-suggestion {
  background: #f0f9ff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #bae6fd;
}

:root.dark .auto-suggestion {
  background: rgba(14, 165, 233, 0.1);
  border-color: rgba(14, 165, 233, 0.3);
}

.suggestion-header {
  margin-bottom: 8px;
}

.suggestion-header h3 {
  color: #0369a1;
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 600;
}

:root.dark .suggestion-header h3 {
  color: #38bdf8;
}

.suggestion-header p {
  color: #0c4a6e;
  margin: 0;
  font-size: 11px;
}

:root.dark .suggestion-header p {
  color: #7dd3fc;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-btn {
  background: white;
  color: #0369a1;
  border: 1px solid #bae6fd;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

:root.dark .suggestion-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.3);
}

.suggestion-btn:hover {
  background: #e0f2fe;
}

:root.dark .suggestion-btn:hover {
  background: rgba(56, 189, 248, 0.2);
}

.suggestion-text {
  text-align: left;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

:root.dark .step-actions {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.prev-btn,
.next-btn {
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
}

.prev-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
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

.next-btn {
  background: #3b82f6;
  color: white;
  min-width: 120px;
  justify-content: center;
}

.next-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .original-preview,
  .field-mapping,
  .auto-suggestion {
    padding: 12px;
    border-radius: 6px;
  }
  
  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .fields-grid {
    grid-template-columns: 1fr;
  }
  
  .field-card {
    padding: 10px;
    min-height: 90px;
  }
  
  .suggestions {
    flex-direction: column;
  }
  
  .suggestion-btn {
    width: 100%;
    text-align: left;
  }
  
  .step-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .prev-btn,
  .next-btn {
    width: 100%;
    justify-content: center;
  }
  
  .next-btn {
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .original-preview,
  .field-mapping,
  .auto-suggestion {
    padding: 10px;
  }
  
  .preview-table {
    font-size: 11px;
  }
  
  .preview-table th,
  .preview-table td {
    padding: 4px 8px;
  }
  
  .field-name {
    font-size: 12px;
  }
  
  .column-select {
    padding: 4px 10px;
    padding-right: 28px;
    font-size: 11px;
  }
}
</style>
