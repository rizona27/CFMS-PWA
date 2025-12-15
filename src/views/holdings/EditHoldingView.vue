<template>
  <div class="edit-holdings-view">
    <!-- 固定顶部工具栏 -->
    <div class="fixed-header">
      <div class="header-section">
        <div class="header-row">
          <div class="action-buttons">
            <!-- 返回按钮 - 药丸形状 -->
            <button class="back-button-pill" @click="goBack">
              <span class="back-icon">←</span>
              返回
            </button>
            
            <!-- 展开/折叠按钮 - 圆形图标 -->
            <button
              class="action-btn"
              :class="{ active: areAnyCardsExpanded }"
              @click="toggleAllCards"
              :title="areAnyCardsExpanded ? '折叠所有' : '展开所有'"
            >
              {{ areAnyCardsExpanded ? '⇲' : '⇱' }}
            </button>
            
            <!-- 搜索按钮 - 圆形图标 -->
            <button
              class="action-btn"
              :class="{ active: isSearchExpanded }"
              @click="toggleSearch"
              :title="isSearchExpanded ? '隐藏搜索' : '显示搜索'"
            >
              🔍
            </button>
          </div>
          
          <!-- 客户数量显示 -->
          <div class="status-pill-group">
            <div class="client-count-pill">
              客户数: {{ groupedHoldings.length }}
            </div>
          </div>
        </div>
        
        <!-- 搜索栏 -->
        <div v-if="isSearchExpanded" class="search-box">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchText"
              type="text"
              placeholder="输入客户名、客户号、基金代码、基金名称..."
              class="search-input"
            />
            <button
              v-if="searchText"
              class="clear-search"
              @click="clearSearch"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="content-wrapper">
      <div class="content-area">
        <EmptyState v-if="dataStore.holdings.length === 0" fullHeight />

        <NoFilterResults v-else-if="filteredClientGroups.length === 0 && searchText" />

        <div v-else class="client-groups-list">
          <div
            v-for="clientGroup in filteredClientGroups"
            :key="clientGroup.id"
            class="client-card-wrapper"
          >
            <!-- 客户药丸条 -->
            <div
              class="client-pill-card"
              :class="{ expanded: isExpanded(clientGroup.id) }"
              @click="toggleClientGroup(clientGroup.id)"
              :style="{ '--client-pill-gradient': getClientPillGradient(clientGroup.displayClientName) }"
            >
              <div class="client-pill-content">
                <div class="client-pill-info">
                  <div class="client-name-id-display-single">
                    <span class="client-name-text-single">
                      {{ getClientDisplayName(clientGroup.displayClientName) }}
                    </span>
                    <span v-if="clientGroup.clientIDs && clientGroup.clientIDs.length > 0 && !isPrivacyModeEnabled" class="client-id-text-single">
                      ({{ clientGroup.clientIDs.length > 1 ? `多个客户号` : clientGroup.clientIDs[0] }})
                    </span>
                    <span v-if="!isPrivacyModeEnabled" class="client-holdings-count">
                      {{ clientGroup.holdings.length }}支
                    </span>
                  </div>
                  
                  <div v-if="isExpanded(clientGroup.id)" class="expanded-actions-pill">
                    <button class="action-button rename-button" @click.stop="openRenameDialog(clientGroup)">
                      改名
                    </button>
                    <button class="action-button delete-button" @click.stop="confirmDeleteClientHoldings(clientGroup)">
                      删除
                    </button>
                  </div>
                </div>
                
                <!-- 展开的持仓卡片 -->
                <div v-if="isExpanded(clientGroup.id)" class="group-content-single">
                  <div
                    v-for="holding in clientGroup.holdings"
                    :key="holding.id"
                    class="holding-card-compact"
                  >
                    <div class="holding-header-compact">
                      <div class="holding-info-compact">
                        <div class="fund-name-row">
                          <h4 class="fund-name">{{ holding.fundName }}</h4>
                          <span class="fund-code-inline">[{{ holding.fundCode }}]</span>
                        </div>
                        <div v-if="holding.clientID && !isPrivacyModeEnabled" class="client-id-display">
                          客户号: {{ holding.clientID }}
                        </div>
                      </div>
                      <div class="holding-actions-icons">
                        <!-- 编辑按钮 -->
                        <button class="icon-button edit-icon" @click.stop="openEditHolding(holding)" title="编辑">
                          <span>✏️</span>
                        </button>
                        <!-- 删除按钮 -->
                        <button class="icon-button delete-icon" @click.stop="confirmDeleteSingleHolding(holding)" title="删除">
                          <span>🗑️</span>
                        </button>
                      </div>
                    </div>
                    
                    <div class="holding-details-compact">
                      <div class="detail-row detail-row-two-items">
                        <span class="detail-label">金额:</span>
                        <span class="detail-value">{{ formatCurrency(holding.purchaseAmount) }}</span>
                        <span class="detail-label detail-label-spacer">份额:</span>
                        <span class="detail-value">{{ formatShares(holding.purchaseShares) }}</span>
                      </div>
                      
                      <div class="detail-row detail-row-three-items">
                        <span class="detail-label">日期:</span>
                        <span class="detail-value">{{ formatDate(holding.purchaseDate) }}</span>
                        <span v-if="holding.remarks" class="detail-label detail-label-spacer">备注:</span>
                        <span v-if="holding.remarks" class="detail-value remarks-text">
                          {{ holding.remarks.length > 10 ? holding.remarks.substring(0, 10) + '...' : holding.remarks }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 重命名对话框 -->
    <div v-if="showRenameDialog" class="dialog-overlay" @click="closeRenameDialog">
      <div class="dialog-content" @click.stop>
        <h3 class="dialog-title">修改客户姓名</h3>
        <p class="dialog-message">
          将客户 "{{ renameDialogClient?.displayClientName }}" 名下的 <strong>{{ renameDialogClient?.holdings.length }} 个持仓</strong> 的客户姓名统一修改为:
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

    <!-- 删除客户持仓对话框 -->
    <div v-if="showDeleteDialog" class="dialog-overlay" @click="closeDeleteDialog">
      <div class="dialog-content" @click.stop>
        <h3 class="dialog-title">删除客户持仓</h3>
        <p class="dialog-message">
          您确定要删除客户 "{{ deleteDialogClient?.displayClientName }}" 名下的所有基金持仓吗？此操作无法撤销。
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

    <!-- 删除单个持仓对话框 -->
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

    <!-- 编辑表单 -->
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

    <!-- 提示消息 -->
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
import EmptyState from '@/components/common/EmptyState.vue'
import NoFilterResults from '@/components/common/NoFilterResults.vue'

const router = useRouter()
const dataStore = useDataStore()

interface ClientGroupForManagement {
  id: string
  originalClientName: string
  displayClientName: string
  clientIDs: string[]  // 存储所有客户号
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
  const groupedDictionary = new Map<string, {
    holdings: FundHolding[]
    clientIDs: Set<string>
  }>()

  // 首先验证所有持仓数据
  dataStore.holdings.forEach(holding => {
    if (!holding.id) {
      console.warn('发现无ID持仓:', holding)
      holding.id = crypto.randomUUID()
    }
    
    // 只使用客户名作为分组键
    const groupKey = holding.clientName.trim()
    if (!groupedDictionary.has(groupKey)) {
      groupedDictionary.set(groupKey, {
        holdings: [],
        clientIDs: new Set()
      })
    }
    
    const group = groupedDictionary.get(groupKey)!
    group.holdings.push(holding)
    if (holding.clientID?.trim()) {
      group.clientIDs.add(holding.clientID.trim())
    }
  })

  const clientGroups: ClientGroupForManagement[] = []

  groupedDictionary.forEach(({ holdings, clientIDs }, groupKey) => {
    // 按购买日期排序
    const sortedHoldings = [...holdings].sort((a, b) =>
      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    )
    
    const group: ClientGroupForManagement = {
      id: groupKey,
      originalClientName: groupKey,
      displayClientName: groupKey,
      clientIDs: Array.from(clientIDs),
      holdings: sortedHoldings
    }
    
    // 验证分组数据
    validateClientGroupData(group)
    
    clientGroups.push(group)
  })

  // 按客户名排序
  return clientGroups.sort((a, b) => a.displayClientName.localeCompare(b.displayClientName))
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
      group.clientIDs.some(id => id.toLowerCase().includes(searchLower)) ||
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

const getClientPillGradient = (clientName: string): string => {
  let hash = 0
  for (let i = 0; i < clientName.length; i++) {
    hash = ((hash << 5) - hash) + clientName.charCodeAt(i)
    hash |= 0
  }
  hash = Math.abs(hash)
  
  const hue = hash % 360
  const saturation = 65 + (hash % 25)
  const lightnessLight = 88 + (hash % 7)
  const lightnessDark = 28 + (hash % 7)
  
  const lightGradient = `linear-gradient(90deg,
    hsl(${hue}, ${saturation}%, ${lightnessLight}%) 0%,
    hsl(${hue}, ${saturation}%, 94%) 50%,
    hsl(${hue}, ${saturation}%, 98%) 100%)`
  
  const darkGradient = `linear-gradient(90deg,
    hsl(${hue}, ${saturation - 15}%, ${lightnessDark}%) 0%,
    hsl(${hue}, ${saturation - 15}%, 32%) 50%,
    hsl(${hue}, ${saturation - 15}%, 36%) 100%)`
  
  return `var(--client-pill-light, ${lightGradient}) var(--client-pill-dark, ${darkGradient})`
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
  const newName = newClientName.value.trim()

  if (oldClientName === newName) {
    closeRenameDialog()
    return
  }

  try {
    // 验证新名称是否已存在其他客户
    const existingGroups = groupedHoldings.value.filter(group =>
      group.originalClientName === newName
    )
    
    if (existingGroups.length > 0) {
      // 检查是否要合并
      const confirmMerge = confirm(`客户 "${newName}" 已存在，是否合并持仓？`)
      if (!confirmMerge) {
        return
      }
    }

    // 🔴 修复：获取所有同客户名的持仓
    const holdingsToUpdate = dataStore.holdings.filter(holding =>
      holding.clientName === oldClientName
    )

    if (holdingsToUpdate.length === 0) {
      showToastMessage('未找到该客户的持仓记录', 'error')
      return
    }

    console.log(`🔄 准备重命名客户 "${oldClientName}" 到 "${newName}"，涉及 ${holdingsToUpdate.length} 个持仓`)
    
    // 🔴 修复：批量更新，确保数据一致性
    let successCount = 0
    const errors: string[] = []
    
    // 先备份旧数据
    const oldHoldingsData = holdingsToUpdate.map(h => ({
      id: h.id,
      clientName: h.clientName,
      clientID: h.clientID,
      fundCode: h.fundCode,
      fundName: h.fundName
    }))
    
    // 批量更新所有持仓
    for (const holding of holdingsToUpdate) {
      try {
        console.log(`📝 更新持仓 ${holding.id}: ${holding.clientName} -> ${newName}`)
        
        // 创建更新对象，保留所有原始数据
        const updateData = {
          clientName: newName,
          clientID: holding.clientID,
          fundCode: holding.fundCode,
          fundName: holding.fundName,
          purchaseAmount: holding.purchaseAmount,
          purchaseShares: holding.purchaseShares,
          purchaseDate: holding.purchaseDate,
          remarks: holding.remarks,
          currentNav: holding.currentNav,
          navDate: holding.navDate,
          isPinned: holding.isPinned,
          pinnedTimestamp: holding.pinnedTimestamp,
          isValid: holding.isValid,
          navReturn1m: holding.navReturn1m,
          navReturn3m: holding.navReturn3m,
          navReturn6m: holding.navReturn6m,
          navReturn1y: holding.navReturn1y
        }
        
        // 使用 updateHolding 方法
        dataStore.updateHolding(holding.id, updateData)
        successCount++
        
      } catch (error) {
        const errorMsg = `持仓 ${holding.fundCode} 更新失败: ${error instanceof Error ? error.message : '未知错误'}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }
    
    // 🔴 强制保存数据到 localStorage
    setTimeout(() => {
      dataStore.saveData(true)
      console.log('💾 强制保存数据完成')
    }, 100)
    
    // 记录操作日志
    if (successCount > 0) {
      dataStore.addLog(`客户 "${oldClientName}" 已批量修改为 "${newName}"，成功更新 ${successCount} 个持仓`, 'info')
      showToastMessage(`成功修改 ${successCount} 个持仓的客户姓名`, 'success')
    }
    
    if (errors.length > 0) {
      console.warn('部分持仓更新失败:', errors)
      dataStore.addLog(`客户重命名: ${errors.length} 个持仓更新失败`, 'warning')
    }
    
    closeRenameDialog()
    
    // 🔴 修复：刷新界面 - 延迟确保数据更新
    setTimeout(() => {
      expandedClientCodes.value.clear()
      // 如果重命名后客户名已存在，展开新分组
      if (groupedHoldings.value.some(g => g.originalClientName === newName)) {
        expandedClientCodes.value.add(newName)
      }
      
      // 调试：验证数据是否正确更新
      console.log('🔍 重命名后数据验证:')
      const updatedHoldings = dataStore.holdings.filter(h =>
        oldHoldingsData.some(old => old.id === h.id)
      )
      updatedHoldings.forEach(h => {
        console.log(`  - ${h.id}: ${h.clientName} (应为: ${newName}) ${h.clientName === newName ? '✅' : '❌'}`)
      })
      
    }, 200)
    
  } catch (error) {
    console.error('❌ 重命名失败:', error)
    showToastMessage(`重命名失败: ${error instanceof Error ? error.message : '请重试'}`, 'error')
  }
}

// 🔴 添加：数据验证函数
const validateClientGroupData = (clientGroup: ClientGroupForManagement) => {
  const holdings = dataStore.holdings.filter(h => h.clientName === clientGroup.originalClientName)
  const issues = []
  
  // 检查数据一致性
  if (holdings.length !== clientGroup.holdings.length) {
    issues.push(`数据不一致: 实际持仓 ${holdings.length} 个，显示持仓 ${clientGroup.holdings.length} 个`)
  }
  
  // 检查是否有重复ID
  const holdingIds = holdings.map(h => h.id)
  const uniqueIds = new Set(holdingIds)
  if (holdingIds.length !== uniqueIds.size) {
    issues.push(`存在重复的持仓ID`)
  }
  
  if (issues.length > 0) {
    console.warn(`客户 "${clientGroup.originalClientName}" 数据问题:`, issues)
    return false
  }
  
  return true
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

  try {
    // 找到该客户名下的所有持仓
    const holdingsToDelete = dataStore.holdings.filter(holding =>
      holding.clientName === clientName
    )
    
    // 批量删除所有持仓
    holdingsToDelete.forEach(holding => {
      dataStore.deleteHolding(holding.id)
    })

    const deletedFundCodes = holdingsToDelete.map(h => h.fundCode).join(', ')
    dataStore.addLog(`已批量删除客户 '${client.displayClientName}' 名下的 ${holdingsToDelete.length} 个持仓。删除的基金代码: ${deletedFundCodes}`, 'warning')
    
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
  if (value >= 10000 && value % 10000 === 0) return `${(value / 10000).toFixed(0)}万`
  else if (value >= 10000) return `${(value / 10000).toFixed(2)}万`
  else return `${value.toFixed(2)}元`
}

const formatShares = (value: number): string => {
  return `${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}份`
}

const formatDate = (date: Date): string => {
  if (!date) return '未设置'
  const year = date.getFullYear() % 100
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

const showToastMessage = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// 🔴 添加：数据刷新函数
const refreshData = () => {
  console.log('🔄 刷新数据...')
  // 清除展开状态
  expandedClientCodes.value.clear()
  
  // 强制重新计算
  const groups = groupedHoldings.value
  console.log(`刷新后分组: ${groups.length} 个客户`)
  groups.forEach(group => {
    console.log(`  - ${group.originalClientName}: ${group.holdings.length} 个持仓`)
  })
}

onMounted(() => {
  dataStore.init()
  
  // 延迟验证数据
  setTimeout(() => {
    console.log('🔍 页面加载完成，验证数据...')
    console.log(`总持仓数: ${dataStore.holdings.length}`)
    console.log(`分组数: ${groupedHoldings.value.length}`)
    
    // 检查是否有重复的客户名
    const clientNames = dataStore.holdings.map(h => h.clientName)
    const uniqueNames = new Set(clientNames)
    if (clientNames.length !== uniqueNames.size) {
      console.warn('⚠️ 发现重复客户名')
      // 找出重复的客户名
      const nameCounts: Record<string, number> = {}
      clientNames.forEach(name => {
        nameCounts[name] = (nameCounts[name] || 0) + 1
      })
      Object.entries(nameCounts).forEach(([name, count]) => {
        if (count > 1) {
          console.warn(`  - "${name}": ${count} 次`)
        }
      })
    }
  }, 500)
})

onUnmounted(() => {
  isSearchExpanded.value = false
})
</script>

<style scoped>
.edit-holdings-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: background-color 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fixed-header {
  flex-shrink: 0;
  background: var(--bg-primary);
  z-index: 100;
  position: relative;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: 0;
  background: var(--bg-primary);
}

.header-section {
  padding: 8px 16px 8px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  background: var(--bg-primary);
  position: relative;
  z-index: 100;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.back-button-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 20px;
  color: var(--text-primary, #1e293b);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button-pill:hover {
  background: var(--accent-color, #3b82f6);
  color: white;
  border-color: var(--accent-color, #3b82f6);
  transform: translateX(-2px);
}

.back-icon {
  font-size: 16px;
  line-height: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  background: var(--bg-card);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.action-btn:hover {
  border-color: var(--accent-color);
  background: var(--accent-color);
  color: white;
}

.action-btn.active {
  border-color: var(--accent-color);
  background: var(--accent-color);
  color: white;
}

.status-pill-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.client-count-pill {
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  min-width: 70px;
  text-align: center;
  background: var(--bg-hover);
  color: var(--text-primary);
}

.search-box {
  margin-top: 8px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 8px 36px 8px 32px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease;
  background: var(--bg-card);
  color: var(--text-primary);
}

.search-input:focus {
  border-color: var(--accent-color);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: var(--text-secondary);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.clear-search:hover {
  background: var(--text-primary);
}

.content-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  padding-bottom: 100px;
}

.content-area {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 8px 16px 16px;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
  overscroll-behavior: contain;
  padding-bottom: 120px;
}

.client-groups-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.client-card-wrapper {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.client-pill-card {
  background: var(--bg-card);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 48px;
}

.client-pill-card:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.client-pill-card.expanded {
  background: var(--bg-hover);
  border-radius: 24px;
  border-color: var(--accent-color);
}

.client-pill-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--client-pill-gradient);
  opacity: 0.7;
  z-index: 0;
  transition: opacity 0.3s ease;
  border-radius: 24px;
}

.client-pill-card:hover::before {
  opacity: 0.8;
}

.client-pill-card.expanded::before {
  opacity: 0.6;
  border-radius: 24px;
}

.client-pill-content {
  position: relative;
  z-index: 1
}

.client-pill-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  min-height: 40px;
}

.client-name-id-display-single {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
}

.client-name-text-single {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50%;
}

.client-id-text-single {
  font-size: 14px;
  color: var(--text-secondary);
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: normal;
  opacity: 0.8;
}

.client-holdings-count {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-left: auto;
  padding-left: 8px;
  color: #f97316;
  font-style: italic;
  min-width: 35px;
}

.expanded-actions-pill {
  display: flex;
  gap: 6px;
  animation: fadeIn 0.2s ease;
  align-items: center;
  margin-left: 8px;
  flex-shrink: 0;
}

.action-button {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rename-button {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.rename-button:hover {
  background: rgba(59, 130, 246, 0.25);
  transform: translateY(-1px);
}

.delete-button {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.delete-button:hover {
  background: rgba(239, 68, 68, 0.25);
  transform: translateY(-1px);
}

.group-content-single {
  margin-top: 0;
  padding: 8px 16px 12px;
  border-top: 1px solid var(--border-color);
  animation: slideDown 0.3s ease;
  position: relative;
  z-index: 1;
  background: var(--bg-card);
  border-radius: 0 0 24px 24px;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.holding-card-compact {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  margin-bottom: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.holding-card-compact:hover {
  border-color: var(--accent-color);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.holding-header-compact {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
  gap: 6px;
}

.holding-info-compact {
  flex: 1;
  min-width: 0;
}

.fund-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  flex-wrap: wrap;
}

.fund-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.fund-code-inline {
  font-size: 11px;
  color: var(--text-secondary);
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: normal;
}

.client-id-display {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.holding-actions-icons {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}

.icon-button {
  width: 26px;
  height: 26px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: var(--text-primary);
  flex-shrink: 0;
}

.icon-button:hover {
  transform: translateY(-1px);
}

.edit-icon:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.delete-icon:hover {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.holding-details-compact {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--bg-hover);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  flex-wrap: wrap;
  min-height: 16px;
}

.detail-row-two-items {
  display: grid;
  grid-template-columns: auto 1fr auto 1fr;
  align-items: center;
  gap: 6px;
}

.detail-row-three-items {
  display: grid;
  grid-template-columns: auto 1fr auto 1fr;
  align-items: center;
  gap: 6px;
}

.detail-label-spacer {
  margin-left: 6px;
}

.detail-label {
  color: var(--text-secondary);
  min-width: 28px;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}

.detail-value {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remarks-text {
  font-size: 10px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  max-width: 500px;
  max-height: 85vh;
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
  .header-section {
    padding: 6px 12px 6px;
  }
  
  .content-area {
    padding: 6px 12px 12px;
    padding-bottom: 120px;
  }
  
  .client-card-wrapper {
    margin-bottom: 2px;
  }
  
  .client-pill-info {
    padding: 6px 12px;
    min-height: 38px;
  }
  
  .client-name-text-single {
    max-width: 40%;
    font-size: 15px;
  }
  
  .client-id-text-single {
    font-size: 13px;
  }
  
  .client-holdings-count {
    font-size: 13px;
    min-width: 30px;
  }
  
  .action-button {
    padding: 3px 8px;
    font-size: 11px;
    height: 26px;
  }
  
  .expanded-actions-pill {
    gap: 4px;
  }
  
  .holding-header-compact {
    margin-bottom: 4px;
  }
  
  .holding-card-compact {
    padding: 6px;
    margin-bottom: 4px;
  }
  
  .detail-row {
    font-size: 10px;
  }
  
  .detail-row-two-items,
  .detail-row-three-items {
    gap: 4px;
  }
  
  .detail-label {
    min-width: 26px;
    font-size: 9px;
  }
  
  .detail-value {
    font-size: 10px;
  }
  
  .icon-button {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }
  
  .client-count-pill {
    min-width: 60px;
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }
  
  .toast-message {
    bottom: 80px;
    max-width: 90%;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .content-area {
    padding: 8px 10px 10px;
    padding-bottom: 120px;
  }
  
  .client-card-wrapper {
    margin-bottom: 1px;
  }
  
  .client-pill-card {
    border-radius: 20px;
    min-height: 40px;
  }
  
  .client-pill-card.expanded {
    border-radius: 20px;
  }
  
  .client-pill-info {
    padding: 5px 10px;
    min-height: 36px;
  }
  
  .client-name-text-single {
    font-size: 14px;
    max-width: 35%;
  }
  
  .client-id-text-single {
    font-size: 12px;
  }
  
  .client-holdings-count {
    font-size: 12px;
    min-width: 28px;
  }
  
  .holding-card-compact {
    padding: 5px;
    margin-bottom: 3px;
  }
  
  .group-content-single {
    padding: 6px 10px 8px;
  }
  
  .fund-name {
    font-size: 12px;
  }
  
  .fund-code-inline {
    font-size: 10px;
  }
  
  .detail-row-two-items,
  .detail-row-three-items {
    grid-template-columns: auto 1fr auto 1fr;
    gap: 3px;
  }
  
  .icon-button {
    width: 22px;
    height: 22px;
    font-size: 10px;
  }
  
  .remarks-text {
    max-width: 70%;
    font-size: 9px;
  }
  
  .dialog-content {
    width: 95%;
    padding: 20px;
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

@media (hover: none) and (pointer: coarse) {
  .client-pill-card:active {
    background: var(--bg-hover);
  }
  
  .holding-card-compact:active {
    transform: scale(0.98);
  }
  
  .icon-button:active {
    transform: scale(0.95);
  }
  
  .action-button:active {
    transform: scale(0.95);
  }
}

:root.dark .back-button-pill {
  background: var(--bg-hover, rgba(255, 255, 255, 0.05));
  border-color: var(--border-color, #334155);
  color: var(--text-primary, #f1f5f9);
}

:root.dark .back-button-pill:hover {
  background: var(--accent-color, #60a5fa);
  border-color: var(--accent-color, #60a5fa);
}

:root.dark .action-btn {
  background: var(--bg-card);
  border-color: var(--border-color);
}

:root.dark .action-btn:hover {
  background: var(--accent-color);
  border-color: var(--accent-color);
}

:root.dark .client-count-pill {
  background: var(--bg-hover);
  border-color: var(--border-color);
  color: var(--text-primary);
}

:root.dark .client-pill-card::before {
  opacity: 0.8;
}

:root.dark .client-pill-card:hover::before {
  opacity: 0.9;
}

:root.dark .client-pill-card.expanded::before {
  opacity: 0.7;
}

:root.dark .client-pill-card.expanded {
  background: rgba(30, 41, 59, 0.5);
  border-color: var(--accent-color);
}

:root.dark .client-holdings-count {
  color: #fbbf24;
}

:root.dark .rename-button {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

:root.dark .delete-button {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}
</style>
