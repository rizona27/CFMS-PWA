<template>
  <div class="manage-holdings-view">
    <div class="top-actions">
      <button class="glass-button back-button" @click="goBack">
        <span class="back-icon">←</span>
        返回
      </button>

      <button class="glass-button" @click="toggleAllCards">
        <span class="button-icon">
          {{ areAnyCardsExpanded ? '↕' : '↔' }}
        </span>
        {{ areAnyCardsExpanded ? '折叠全部' : '展开全部' }}
      </button>

      <button class="glass-button search-button" @click="toggleSearch">
        <span class="button-icon">
          {{ isSearchExpanded ? '×' : '🔍' }}
        </span>
        {{ isSearchExpanded ? '关闭搜索' : '搜索' }}
      </button>

      <div class="client-count" v-if="groupedHoldings.length > 0">
        客户数: {{ groupedHoldings.length }}
      </div>
    </div>

    <div class="search-section" v-if="isSearchExpanded && groupedHoldings.length > 0">
      <GlobalSearchBar
        v-model="searchText"
        placeholder="输入客户名、客户号、基金代码、基金名称..."
        @clear="clearSearch"
      />
    </div>

    <div class="content-area">
      <div v-if="dataStore.holdings.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <h3 class="empty-title">当前没有持仓数据</h3>
        <p class="empty-description">请先导入持仓数据</p>
      </div>

      <div v-else-if="filteredClientGroups.length === 0 && searchText" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">未找到符合条件的客户</h3>
        <p class="empty-description">请尝试其他搜索关键词</p>
      </div>

      <div v-else class="client-groups-list">
        <div
          v-for="clientGroup in filteredClientGroups"
          :key="clientGroup.id"
          class="client-group-item"
        >
          <div class="client-header" @click="toggleClientGroup(clientGroup.id)">
            <div class="client-info">
              <div class="client-name-row">
                <span class="client-name">
                  {{ getClientDisplayName(clientGroup.displayClientName) }}
                </span>
                <span v-if="clientGroup.clientID" class="client-id">
                  ({{ clientGroup.clientID }})
                </span>
              </div>
            </div>

            <div class="client-stats-actions">
              <div class="client-stats">
                <span class="stat-value">{{ clientGroup.holdings.length }}</span>
                <span class="stat-unit">支</span>
              </div>
              
              <div v-if="isExpanded(clientGroup.id)" class="expanded-actions">
                <button class="action-button rename-button" @click.stop="openRenameDialog(clientGroup)">
                  改名
                </button>
                <button class="action-button delete-button" @click.stop="confirmDeleteClientHoldings(clientGroup)">
                  删除
                </button>
              </div>
            </div>
          </div>

          <div v-if="isExpanded(clientGroup.id)" class="client-holdings">
            <div
              v-for="holding in clientGroup.holdings"
              :key="holding.id"
              class="holding-card"
            >
              <div class="holding-content">
                <div class="fund-header">
                  <div class="fund-name-code">
                    <span class="fund-name">{{ holding.fundName }}</span>
                    <span class="fund-code">[{{ holding.fundCode }}]</span>
                  </div>
                  <button class="edit-button" @click="openEditHolding(holding)">
                    ✏️
                  </button>
                </div>

                <div class="holding-details">
                  <div class="detail-row">
                    <div class="detail-item">
                      <span class="detail-label">购买金额</span>
                      <span class="detail-value">{{ formatCurrency(holding.purchaseAmount) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">购买份额</span>
                      <span class="detail-value">{{ formatShares(holding.purchaseShares) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">购买日期</span>
                      <span class="detail-value">{{ formatDate(holding.purchaseDate) }}</span>
                    </div>
                  </div>

                  <div v-if="holding.remarks" class="remarks-row">
                    <span class="remarks-label">备注: </span>
                    <span class="remarks-content">{{ holding.remarks }}</span>
                  </div>
                </div>
              </div>
              
              <button class="delete-holding-button" @click="confirmDeleteSingleHolding(holding)">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRenameDialog" class="dialog-overlay" @click="closeRenameDialog">
      <div class="dialog-content" @click.stop>
        <h3 class="dialog-title">修改客户姓名</h3>
        <p class="dialog-message">
          将客户 "{{ renameDialogClient?.displayClientName }}{{ renameDialogClient?.clientID ? '(' + renameDialogClient.clientID + ')' : '' }}" 下的所有持仓姓名修改为:
        </p>
        <input
          v-model="newClientName"
          type="text"
          class="dialog-input"
          placeholder="新客户姓名"
        />
        <div class="dialog-actions">
          <button class="dialog-button cancel-button" @click="closeRenameDialog">
            取消
          </button>
          <button class="dialog-button confirm-button" @click="confirmRename">
            确定
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteDialog" class="dialog-overlay" @click="closeDeleteDialog">
      <div class="dialog-content" @click.stop>
        <h3 class="dialog-title">删除客户持仓</h3>
        <p class="dialog-message">
          您确定要删除客户 "{{ deleteDialogClient?.displayClientName }}{{ deleteDialogClient?.clientID ? '(' + deleteDialogClient.clientID + ')' : '' }}" 名下的所有基金持仓吗？此操作无法撤销。
        </p>
        <div class="dialog-actions">
          <button class="dialog-button cancel-button" @click="closeDeleteDialog">
            取消
          </button>
          <button class="dialog-button delete-confirm-button" @click="deleteClientHoldings">
            确定删除
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSingleDeleteDialog" class="dialog-overlay" @click="closeSingleDeleteDialog">
      <div class="dialog-content" @click.stop>
        <h3 class="dialog-title">删除单个持仓</h3>
        <p class="dialog-message">
          您确定要删除客户 "{{ singleDeleteHolding?.clientName }}{{ singleDeleteHolding?.clientID ? '(' + singleDeleteHolding.clientID + ')' : '' }}" 的持仓<br>
          "{{ singleDeleteHolding?.fundName }} [{{ singleDeleteHolding?.fundCode }}]" 吗？<br>
          此操作无法撤销。
        </p>
        <div class="dialog-actions">
          <button class="dialog-button cancel-button" @click="closeSingleDeleteDialog">
            取消
          </button>
          <button class="dialog-button delete-confirm-button" @click="deleteSingleHolding">
            确定删除
          </button>
        </div>
      </div>
    </div>

    <div v-if="showEditForm" class="edit-form-modal">
      <div class="modal-overlay" @click="closeEditForm"></div>
      <div class="modal-content">
        <EditHoldingForm
          v-if="selectedHolding"
          :holding="selectedHolding"
          @save="handleSaveHolding"
          @cancel="closeEditForm"
        />
      </div>
    </div>

    <div v-if="showToast" class="toast-message" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import type { FundHolding } from '@/stores/dataStore'
import EditHoldingForm from './EditHoldingForm.vue'
import GlobalSearchBar from '@/components/common/GlobalSearchBar.vue'

const router = useRouter()
const dataStore = useDataStore()

interface ClientGroupForManagement {
  id: string
  originalClientName: string
  displayClientName: string
  clientID: string | null
  holdings: FundHolding[]
}

const expandedClientCodes = ref<Set<string>>(new Set())
const searchText = ref('')
const isSearchExpanded = ref(false)
const showRenameDialog = ref(false)
const renameDialogClient = ref<ClientGroupForManagement | null>(null)
const newClientName = ref('')
const showDeleteDialog = ref(false)
const deleteDialogClient = ref<ClientGroupForManagement | null>(null)
const showSingleDeleteDialog = ref(false)
const singleDeleteHolding = ref<FundHolding | null>(null)
const selectedHolding = ref<FundHolding | null>(null)
const showEditForm = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

const isPrivacyModeEnabled = computed(() => dataStore.isPrivacyMode)

const groupedHoldings = computed((): ClientGroupForManagement[] => {
  const groupedDictionary = new Map<string, FundHolding[]>()

  dataStore.holdings.forEach(holding => {
    const groupKey = `${holding.clientName}|${holding.clientID}`
    if (!groupedDictionary.has(groupKey)) {
      groupedDictionary.set(groupKey, [])
    }
    groupedDictionary.get(groupKey)!.push(holding)
  })

  const clientGroups: ClientGroupForManagement[] = []

  groupedDictionary.forEach((holdings, groupKey) => {
    const components = groupKey.split('|', 2)
    const originalName = components[0]
    const clientID = components.length > 1 && components[1] !== '' ? components[1] : null

    const group: ClientGroupForManagement = {
      id: groupKey,
      originalClientName: originalName,
      displayClientName: originalName,
      clientID: clientID,
      holdings: holdings
    }
    clientGroups.push(group)
  })

  clientGroups.sort((a, b) => a.displayClientName.localeCompare(b.displayClientName))

  return clientGroups
})

const filteredClientGroups = computed((): ClientGroupForManagement[] => {
  if (!searchText.value) {
    return groupedHoldings.value
  }

  const searchLower = searchText.value.toLowerCase()
  
  return groupedHoldings.value.filter(group => {
    const displayName = getClientDisplayName(group.displayClientName, false)
    return (
      displayName.toLowerCase().includes(searchLower) ||
      group.displayClientName.toLowerCase().includes(searchLower) ||
      (group.clientID && group.clientID.toLowerCase().includes(searchLower)) ||
      group.holdings.some(holding =>
        holding.fundName.toLowerCase().includes(searchLower) ||
        holding.fundCode.toLowerCase().includes(searchLower)
      )
    )
  })
})

const areAnyCardsExpanded = computed(() => {
  return expandedClientCodes.value.size > 0
})

const getClientDisplayName = (name: string, usePrivacyMode: boolean = isPrivacyModeEnabled.value): string => {
  if (!usePrivacyMode) {
    return name
  }
  
  if (name.length <= 1) {
    return name
  } else if (name.length === 2) {
    return name.charAt(0) + '*'
  } else {
    return name.charAt(0) + '*' + name.charAt(name.length - 1)
  }
}

const isExpanded = (clientId: string): boolean => {
  return expandedClientCodes.value.has(clientId)
}

const toggleClientGroup = (clientId: string) => {
  if (expandedClientCodes.value.has(clientId)) {
    expandedClientCodes.value.delete(clientId)
  } else {
    expandedClientCodes.value.add(clientId)
  }
}

const toggleAllCards = () => {
  if (areAnyCardsExpanded.value) {
    expandedClientCodes.value.clear()
  } else {
    filteredClientGroups.value.forEach(group => {
      expandedClientCodes.value.add(group.id)
    })
  }
}

const toggleSearch = () => {
  isSearchExpanded.value = !isSearchExpanded.value
  if (!isSearchExpanded.value) {
    searchText.value = ''
  }
}

const clearSearch = () => {
  searchText.value = ''
}

const openRenameDialog = (clientGroup: ClientGroupForManagement) => {
  renameDialogClient.value = clientGroup
  newClientName.value = clientGroup.originalClientName
  showRenameDialog.value = true
}

const closeRenameDialog = () => {
  showRenameDialog.value = false
  renameDialogClient.value = null
  newClientName.value = ''
}

const confirmRename = async () => {
  if (!renameDialogClient.value || !newClientName.value.trim()) {
    return
  }

  const oldClientGroup = renameDialogClient.value
  const oldClientName = oldClientGroup.originalClientName
  const oldClientID = oldClientGroup.clientID || ''

  if (oldClientName === newClientName.value.trim()) {
    closeRenameDialog()
    return
  }

  try {
    dataStore.holdings.forEach((holding, index) => {
      if (holding.clientName === oldClientName && holding.clientID === oldClientID) {
        const updatedHolding = { ...holding }
        updatedHolding.clientName = newClientName.value.trim()
        dataStore.updateHolding(updatedHolding.id, updatedHolding)
      }
    })

    dataStore.addLog(`客户 '${oldClientName}' 已批量修改为 '${newClientName.value.trim()}'，涉及 ${oldClientGroup.holdings.length} 个持仓`, 'info')
    
    showToastMessage('客户姓名修改成功', 'success')
    closeRenameDialog()
    
  } catch (error) {
    console.error('重命名失败:', error)
    showToastMessage('重命名失败，请重试', 'error')
  }
}

const confirmDeleteClientHoldings = (clientGroup: ClientGroupForManagement) => {
  deleteDialogClient.value = clientGroup
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  deleteDialogClient.value = null
}

const deleteClientHoldings = async () => {
  if (!deleteDialogClient.value) {
    return
  }

  const client = deleteDialogClient.value
  const clientName = client.originalClientName
  const clientID = client.clientID || ''

  try {
    const holdingsToDelete = dataStore.holdings.filter(
      holding => holding.clientName === clientName && holding.clientID === clientID
    )
    
    holdingsToDelete.forEach(holding => {
      dataStore.deleteHolding(holding.id)
    })

    const deletedFundCodes = holdingsToDelete.map(h => h.fundCode).join(', ')
    dataStore.addLog(`已批量删除客户 '${client.displayClientName}${clientID ? '(' + clientID + ')' : ''}' 名下的 ${holdingsToDelete.length} 个持仓。删除的基金代码: ${deletedFundCodes}`, 'warning')
    
    showToastMessage(`已删除${holdingsToDelete.length}个持仓`, 'success')
    closeDeleteDialog()
    
  } catch (error) {
    console.error('删除失败:', error)
    showToastMessage('删除失败，请重试', 'error')
  }
}

const confirmDeleteSingleHolding = (holding: FundHolding) => {
  singleDeleteHolding.value = holding
  showSingleDeleteDialog.value = true
}

const closeSingleDeleteDialog = () => {
  showSingleDeleteDialog.value = false
  singleDeleteHolding.value = null
}

const deleteSingleHolding = async () => {
  if (!singleDeleteHolding.value) return

  const holding = singleDeleteHolding.value
  
  try {
    dataStore.deleteHolding(holding.id)
    dataStore.addLog(`ManageHoldingsView: 已删除客户 '${holding.clientName}' 的基金持仓 ${holding.fundCode} - ${holding.fundName}，金额: ${holding.purchaseAmount}`, 'warning')
    showToastMessage('持仓删除成功', 'success')
    closeSingleDeleteDialog()
  } catch (error) {
    console.error('删除失败:', error)
    showToastMessage('删除失败，请重试', 'error')
  }
}

const openEditHolding = (holding: FundHolding) => {
  selectedHolding.value = holding
  showEditForm.value = true
}

const closeEditForm = () => {
  if (confirm('确定要取消编辑吗？未保存的修改将会丢失。')) {
    showEditForm.value = false
    selectedHolding.value = null
  }
}

const handleSaveHolding = async (updatedHolding: any) => {
  try {
    const convertedHolding = dataStore.convertHoldingToFundHolding(updatedHolding)
    
    if (convertedHolding.id) {
      dataStore.updateHolding(convertedHolding.id, convertedHolding)
      dataStore.addLog(`ManageHoldingsView: 持仓修改成功 - 客户: ${convertedHolding.clientName}, 基金: ${convertedHolding.fundCode}`, 'success')
      showToastMessage('持仓更新成功', 'success')
    }
    
    showEditForm.value = false
    selectedHolding.value = null
    
  } catch (error) {
    console.error('保存失败:', error)
    dataStore.addLog(`ManageHoldingsView: 更新持仓失败 - ${error}`, 'error')
    showToastMessage('持仓更新失败，请重试', 'error')
  }
}

const goBack = () => {
  router.push('/holdings')
}

const formatCurrency = (value: number): string => {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatShares = (value: number): string => {
  return `${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}份`
}

const formatDate = (date: Date): string => {
  if (!date) return '未设置'
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const showToastMessage = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

onMounted(() => {
  dataStore.init()
})

onUnmounted(() => {
  isSearchExpanded.value = false
})
</script>

<style scoped>
.manage-holdings-view {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

:root.dark .manage-holdings-view {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 12px;
  flex-wrap: wrap;
}

.glass-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--glass-bg, rgba(255, 255, 255, 0.8));
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.2));
  border-radius: 999px;
  color: var(--text-primary, #1e293b);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.glass-button:hover {
  background: var(--glass-bg-hover, rgba(255, 255, 255, 0.9));
  border-color: var(--glass-border-hover, rgba(255, 255, 255, 0.3));
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.back-button {
  background: var(--glass-bg, rgba(255, 255, 255, 0.8));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.2));
}

.back-button:hover {
  background: var(--glass-bg-hover, rgba(255, 255, 255, 0.9));
  border-color: var(--accent-color, #3b82f6);
}

:root.dark .glass-button {
  background: var(--glass-bg-dark, rgba(30, 30, 46, 0.8));
  border: 1px solid var(--glass-border-dark, rgba(255, 255, 255, 0.1));
  color: var(--text-primary, #f1f5f9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

:root.dark .glass-button:hover {
  background: var(--glass-bg-dark-hover, rgba(40, 40, 60, 0.9));
  border-color: var(--glass-border-dark-hover, rgba(255, 255, 255, 0.2));
}

:root.dark .back-button:hover {
  border-color: var(--accent-color, #60a5fa);
}

.client-count {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
  margin-left: auto;
  padding-right: 8px;
}

:root.dark .client-count {
  color: var(--text-secondary, #94a3b8);
}

.search-section {
  padding: 0 16px 12px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
  padding: 20px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e2e8f0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:root.dark .empty-state {
  background: var(--bg-card-dark);
  border-color: var(--border-color, #334155);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  margin: 0 0 8px 0;
}

:root.dark .empty-title {
  color: var(--text-primary, #f1f5f9);
}

.empty-description {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
  margin: 0;
}

:root.dark .empty-description {
  color: var(--text-secondary, #94a3b8);
}

.client-groups-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.client-group-item {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color, #e2e8f0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

:root.dark .client-group-item {
  background: var(--bg-card-dark);
  border-color: var(--border-color, #334155);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.client-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  background: linear-gradient(to right, rgba(var(--accent-color-rgb, 59, 130, 246), 0.1), transparent);
  transition: background-color 0.2s;
  min-height: 48px;
}

.client-header:hover {
  background: linear-gradient(to right, rgba(var(--accent-color-rgb, 59, 130, 246), 0.15), transparent);
}

.client-info {
  flex: 1;
  min-width: 0;
}

.client-name-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.client-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:root.dark .client-name {
  color: var(--text-primary, #f1f5f9);
}

.client-id {
  font-size: 12px;
  color: var(--text-secondary, #64748b);
  flex-shrink: 0;
}

:root.dark .client-id {
  color: var(--text-secondary, #94a3b8);
}

.client-stats-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.client-stats {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-size: 12px;
  color: var(--text-secondary, #64748b);
  white-space: nowrap;
}

.stat-value {
  font-weight: 600;
  font-style: italic;
  color: #eab308;
}

.stat-unit {
  color: var(--text-secondary, #64748b);
}

.expanded-actions {
  display: flex;
  gap: 8px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.action-button {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rename-button {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.rename-button:hover {
  background: rgba(59, 130, 246, 0.2);
}

.delete-button {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-button:hover {
  background: rgba(239, 68, 68, 0.2);
}

.client-holdings {
  padding: 10px 16px 6px 16px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color, #e2e8f0);
  animation: slideDownExpand 0.3s ease;
}

@keyframes slideDownExpand {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.holding-card {
  display: flex;
  background: var(--secondary-bg-card, #f8fafc);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
  border: 1px solid var(--border-color, #e2e8f0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

:root.dark .holding-card {
  background: var(--secondary-bg-card-dark, #1e293b);
  border-color: var(--border-color, #334155);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.holding-content {
  flex: 1;
  padding: 16px;
}

.fund-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.fund-name-code {
  flex: 1;
  min-width: 0;
}

.fund-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:root.dark .fund-name {
  color: var(--text-primary, #f1f5f9);
}

.fund-code {
  font-size: 11px;
  font-family: 'Courier New', monospace;
  color: var(--text-secondary, #64748b);
}

:root.dark .fund-code {
  color: var(--text-secondary, #94a3b8);
}

.edit-button {
  background: none;
  border: none;
  font-size: 16px;
  color: #3b82f6;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background: rgba(59, 130, 246, 0.1);
}

.holding-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 10px;
  color: var(--text-secondary, #64748b);
}

:root.dark .detail-label {
  color: var(--text-secondary, #94a3b8);
}

.detail-value {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary, #1e293b);
}

:root.dark .detail-value {
  color: var(--text-primary, #f1f5f9);
}

.remarks-row {
  padding-top: 8px;
  border-top: 1px dashed var(--border-color, #e2e8f0);
}

.remarks-label {
  font-size: 10px;
  color: var(--text-secondary, #64748b);
  margin-right: 4px;
}

:root.dark .remarks-label {
  color: var(--text-secondary, #94a3b8);
}

.remarks-content {
  font-size: 12px;
  color: var(--text-primary, #1e293b);
}

:root.dark .remarks-content {
  color: var(--text-primary, #f1f5f9);
}

.delete-holding-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.delete-holding-button:hover {
  background: #dc2626;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.dialog-content {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

:root.dark .dialog-content {
  background: var(--bg-card-dark);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  margin: 0 0 12px 0;
}

:root.dark .dialog-title {
  color: var(--text-primary, #f1f5f9);
}

.dialog-message {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
  margin: 0 0 20px 0;
  line-height: 1.5;
}

:root.dark .dialog-message {
  color: var(--text-secondary, #94a3b8);
}

.dialog-input {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  color: var(--text-primary, #1e293b);
  background: var(--bg-input);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  margin-bottom: 20px;
  transition: all 0.2s ease;
}

:root.dark .dialog-input {
  color: var(--text-primary, #f1f5f9);
  background: var(--bg-input-dark);
  border-color: var(--border-color, #334155);
}

.dialog-input:focus {
  outline: none;
  border-color: var(--accent-color, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dialog-actions {
  display: flex;
  gap: 12px;
}

.dialog-button {
  flex: 1;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button {
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
  color: var(--text-primary, #1e293b);
  border: 1px solid var(--border-color, #e2e8f0);
}

:root.dark .cancel-button {
  background: var(--bg-hover, rgba(255, 255, 255, 0.05));
  color: var(--text-primary, #f1f5f9);
  border-color: var(--border-color, #334155);
}

.cancel-button:hover {
  background: var(--border-color, #e2e8f0);
}

.confirm-button {
  background: var(--accent-color, #3b82f6);
  color: white;
}

.confirm-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.delete-confirm-button {
  background: #ef4444;
  color: white;
}

.delete-confirm-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.edit-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

:root.dark .modal-content {
  background: var(--bg-card-dark);
}

.toast-message {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 80%;
  text-align: center;
  animation: toast-in 0.3s ease, toast-out 0.3s ease 2.7s;
  animation-fill-mode: forwards;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes toast-out {
  to {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
}

.toast-message.success {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.toast-message.error {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.toast-message.warning {
  background: rgba(245, 158, 11, 0.9);
  color: white;
}

.toast-message.info {
  background: rgba(59, 130, 246, 0.9);
  color: white;
}

@media (max-width: 768px) {
  .top-actions {
    padding: 12px 12px 8px;
    gap: 8px;
  }

  .glass-button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .search-section {
    padding: 0 12px 8px;
  }

  .client-count {
    font-size: 12px;
  }

  .client-header {
    padding: 8px 12px;
    min-height: 44px;
  }

  .client-holdings {
    padding: 8px 12px 4px 12px;
  }

  .detail-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .client-stats-actions {
    gap: 8px;
  }

  .expanded-actions {
    flex-direction: column;
    gap: 4px;
  }

  .action-button {
    width: 100%;
    text-align: center;
    font-size: 10px;
    padding: 3px 6px;
  }

  .dialog-content {
    width: 95%;
    padding: 20px;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .toast-message {
    bottom: 80px;
    max-width: 90%;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .top-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .client-count {
    margin-left: 0;
    text-align: center;
    padding-top: 8px;
    border-top: 1px solid var(--border-color, #e2e8f0);
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .client-stats-actions {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .dialog-actions {
    flex-direction: column;
  }

  .toast-message {
    bottom: 60px;
    padding: 8px 16px;
    font-size: 12px;
  }
}
</style>
