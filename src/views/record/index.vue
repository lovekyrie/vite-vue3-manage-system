<script setup lang="ts">
import type { AccountingRecord, CreateAccountingInput } from '@/utils/types/accounting'
import { Bottom, Top, Wallet } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import {
  createAccounting,
  deleteAccounting,
  getAccountingStats,
  queryAccountingList,
  updateAccounting,
} from '@/api/accounting'
import EditDialog from './components/edit.vue'

// --- 统计数据逻辑 ---
const stats = reactive({
  income: 0,
  expense: 0,
  balance: 0,
})

async function fetchStats() {
  try {
    const res = await getAccountingStats()
    if (res.code === 200) {
      // 假设返回的数据结构，如果不匹配需要调整
      stats.income = res.data.total_income || 0
      stats.expense = res.data.total_expense || 0
      stats.balance = res.data.balance || 0
    }
  }
  catch (error) {
    console.error('获取统计数据失败', error)
  }
}

// --- 表格与分页逻辑 ---
const tableData = ref<AccountingRecord[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(10)
const total = ref(0)

async function getList() {
  loading.value = true
  try {
    const res = await queryAccountingList({
      page: page.value,
      limit: limit.value,
    })
    if (res.code === 200) {
      tableData.value = res.data.list || [] // 假设返回结构中有 list
      total.value = res.data.total || 0
    }
  }
  catch (error) {
    console.error('获取列表失败', error)
  }
  finally {
    loading.value = false
  }
}

function handleSizeChange(val: number) {
  limit.value = val
  getList()
}

function handleCurrentChange(val: number) {
  page.value = val
  getList()
}

function handleRefresh() {
  getList()
  fetchStats()
}

// --- 增删改操作逻辑 ---
const showDialog = ref(false)
const currentEditData = ref<CreateAccountingInput | null>(null)

function handleAdd() {
  currentEditData.value = null
  showDialog.value = true
}

function handleEdit(row: AccountingRecord) {
  currentEditData.value = {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    category: row.category,
    description: row.description,
    transaction_date: row.transaction_date,
    payment_method: row.payment_method,
  }
  showDialog.value = true
}

function handleDelete(row: AccountingRecord) {
  ElMessageBox.confirm('确认删除该条记录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const res = await deleteAccounting(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        getList()
        fetchStats()
      }
    }
    catch (error) {
      console.error(error)
    }
  })
}

async function handleSubmit(data: CreateAccountingInput) {
  try {
    let res
    if (data.id) {
      res = await updateAccounting(data.id, data)
    }
    else {
      res = await createAccounting(data)
    }

    if (res.code === 200) {
      ElMessage.success(data.id ? '修改成功' : '新增成功')
      showDialog.value = false
      getList()
      fetchStats()
    }
  }
  catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  getList()
  fetchStats()
})
</script>

<template>
  <div class="record-container">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <el-card class="stats-card income" shadow="hover">
        <div class="stats-content">
          <div class="stats-icon income-icon">
            <el-icon><Top /></el-icon>
          </div>
          <div class="stats-info">
            <div class="label">
              总收入
            </div>
            <div class="value">
              ¥{{ stats.income.toFixed(2) }}
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card expense" shadow="hover">
        <div class="stats-content">
          <div class="stats-icon expense-icon">
            <el-icon><Bottom /></el-icon>
          </div>
          <div class="stats-info">
            <div class="label">
              总支出
            </div>
            <div class="value">
              ¥{{ stats.expense.toFixed(2) }}
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card balance" shadow="hover">
        <div class="stats-content">
          <div class="stats-icon balance-icon">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="stats-info">
            <div class="label">
              结余
            </div>
            <div class="value">
              ¥{{ stats.balance.toFixed(2) }}
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 列表部分 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="title">记账记录</span>
          <div class="actions">
            <el-button @click="handleRefresh">
              刷新
            </el-button>
            <el-button type="primary" @click="handleAdd">
              + 新增记账
            </el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" :style="{ width: '100%' }">
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span :class="row.type === 'income' ? 'text-income' : 'text-expense'">
              {{ row.type === 'income' ? '+' : '-' }}¥{{ Number(row.amount).toFixed(2) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="transaction_date" label="交易日期" width="120" />
        <el-table-column prop="payment_method" label="支付方式" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180" />

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="limit"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑/新增弹窗 -->
    <EditDialog
      :show="showDialog"
      :edit-data="currentEditData"
      @close-dialog="showDialog = false"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.record-container {
  padding: 20px;
}

.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stats-card {
  flex: 1;
}

.stats-content {
  display: flex;
  align-items: center;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.income-icon {
  background-color: #f0f9eb;
  color: #67c23a;
}

.expense-icon {
  background-color: #fef0f0;
  color: #f56c6c;
}

.balance-icon {
  background-color: #ecf5ff;
  color: #409eff;
}

.stats-info .label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stats-info .value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: bold;
}

.text-income {
  color: #67c23a;
  font-weight: bold;
}

.text-expense {
  color: #f56c6c;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
