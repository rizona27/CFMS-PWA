<template>
  <div class="upload-step">
    <div class="upload-area">
      <div
        class="upload-zone"
        @click="triggerFileInput"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        :class="{ 'drag-over': isDragOver }"
      >
        <div class="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 10L12 5L7 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>点击选择文件上传</h3>
        <p class="file-format">支持 .csv, .xlsx, .xls 格式</p>
        <input
          type="file"
          ref="fileInput"
          accept=".csv,.xlsx,.xls"
          @change="handleFileInput"
          style="display: none"
        />
      </div>
      
      <div v-if="selectedFile" class="file-selected">
        <div class="file-card">
          <div class="file-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="file-info">
            <h4>{{ selectedFile.name }}</h4>
            <p>{{ formatFileSize(selectedFile.size) }} · {{ getFileExtension(selectedFile) }}</p>
            <p v-if="fileFormatDetected" class="file-detected">
              检测到格式: <strong>{{ fileFormatDetected }}</strong>
            </p>
          </div>
          <div class="status-indicator success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <button class="remove-btn" @click="handleClearSelection">
            <div class="remove-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
    
    <div class="step-actions">
      <button
        class="next-btn"
        @click="handleNextStep"
        :disabled="!selectedFile || !fileProcessed"
      >
        下一步：配置映射
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  selectedFile: File | null
  fileProcessed: boolean
  fileFormatDetected: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'file-selected': [event: Event]
  'clear-selection': []
  'next-step': []
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileInput = (event: Event) => {
  emit('file-selected', event)
}

const handleClearSelection = () => {
  emit('clear-selection')
}

const handleNextStep = () => {
  emit('next-step')
}

const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files.length) {
    const input = fileInput.value
    if (input) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(event.dataTransfer.files[0])
      input.files = dataTransfer.files
      input.dispatchEvent(new Event('change'))
    }
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileExtension = (file: File): string => {
  return file.name.split('.').pop()?.toUpperCase() || '未知'
}
</script>

<style scoped>
.upload-step {
  padding: 8px 0;
}

.upload-area {
  margin-bottom: 24px;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
  margin-bottom: 16px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

:root.dark .upload-zone {
  background: rgba(30, 41, 59, 0.5);
  border-color: rgba(255, 255, 255, 0.2);
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: #3b82f6;
  background: #f0f4ff;
  transform: translateY(-2px);
}

:root.dark .upload-zone:hover,
:root.dark .upload-zone.drag-over {
  background: rgba(30, 41, 59, 0.8);
  border-color: #3b82f6;
}

.upload-icon {
  color: #3b82f6;
  margin-bottom: 12px;
}

:root.dark .upload-icon {
  color: #60a5fa;
}

.upload-zone h3 {
  color: #374151;
  font-size: 16px;
  margin-bottom: 6px;
  font-weight: 600;
}

:root.dark .upload-zone h3 {
  color: #e5e7eb;
}

.upload-zone p {
  color: #6b7280;
  margin-bottom: 4px;
  font-size: 14px;
}

:root.dark .upload-zone p {
  color: #9ca3af;
}

.file-format {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
}

.file-selected {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.file-card {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  position: relative;
}

:root.dark .file-card {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(255, 255, 255, 0.1);
}

.file-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

:root.dark .file-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.file-icon {
  color: #3b82f6;
  margin-right: 16px;
  flex-shrink: 0;
}

:root.dark .file-icon {
  color: #60a5fa;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-info h4 {
  color: #1f2937;
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:root.dark .file-info h4 {
  color: #f3f4f6;
}

.file-info p {
  color: #6b7280;
  margin: 0;
  font-size: 12px;
}

:root.dark .file-info p {
  color: #9ca3af;
}

.file-detected {
  color: #3b82f6 !important;
  font-size: 12px;
  margin-top: 4px !important;
  font-weight: 500;
}

:root.dark .file-detected {
  color: #60a5fa !important;
}

.status-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.status-indicator.success {
  background: #10b981;
  color: white;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
  position: relative;
}

.remove-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.remove-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.remove-btn svg {
  width: 14px;
  height: 14px;
}

.remove-btn svg path {
  stroke: white;
}

.step-actions {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

:root.dark .step-actions {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.next-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: #3b82f6;
  color: white;
  min-width: 160px;
}

.next-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .upload-zone {
    padding: 24px 16px;
    border-radius: 10px;
    min-height: 150px;
  }
  
  .upload-icon {
    width: 36px;
    height: 36px;
    margin-bottom: 8px;
  }
  
  .upload-zone h3 {
    font-size: 14px;
  }
  
  .upload-zone p {
    font-size: 12px;
  }
  
  .file-card {
    padding: 12px;
  }
  
  .file-info h4 {
    font-size: 13px;
  }
  
  .file-info p {
    font-size: 11px;
  }
  
  .status-indicator {
    width: 18px;
    height: 18px;
    margin-right: 10px;
  }
  
  .next-btn {
    padding: 10px 20px;
    font-size: 13px;
    min-width: 140px;
  }
}

@media (max-width: 480px) {
  .upload-zone {
    padding: 20px 12px;
    min-height: 120px;
  }
  
  .file-card {
    padding: 10px;
  }
  
  .file-icon {
    margin-right: 10px;
  }
  
  .remove-btn {
    width: 28px;
    height: 28px;
  }
  
  .remove-btn svg {
    width: 12px;
    height: 12px;
  }
  
  .next-btn {
    width: 100%;
    min-width: 0;
  }
}
</style>
