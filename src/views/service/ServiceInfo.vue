<script setup lang="ts">
import type { Service } from '@/utils/types/service'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { addService, queryServiceList } from '@/api/service'
import { showMessage } from '@/utils/utils'
import EditDialog from './components/edit.vue'

const { tableData, tableColumns } = useTable()
const { page, limit, total, handleSizeChange, handleCurrentChange } = usePagination()
const { selectedRows, handleSelectionChange, handleEdit, handleDelete } = useTableOperations()
const { showDialog, handleAdd, handleCloseDialog, handleAddSubmit, handleBatchDelete } = useBtnOperations()

onMounted(() => {
  getServiceList()
})

async function getServiceList() {
  const res = await queryServiceList({
    page: page.value,
    limit: limit.value,
  })
  tableData.value = res.data.list
  total.value = res.data.total
}

function useTable() {
  const tableData = ref<Service[]>([])
  const tableColumns = [
    { type: 'selection', width: 55 },
    { type: 'index', width: 55, label: '序号' },
    { prop: 'date', label: '日期' },
    { prop: 'name', label: '姓名' },
    { prop: 'phone', label: '电话' },
    { prop: 'address', label: '地址', width: 250 },
    { prop: 'opreator', label: '操作' },
  ]

  return {
    tableData,
    tableColumns,
  }
}

function useTableOperations() {
  const selectedRows = ref<Service[]>([])
  function handleSelectionChange(val: Service[]) {
    selectedRows.value = val
  }

  function handleEdit(row: Service) {
    console.log('Edit', row)
    ElMessage.info(`编辑: ${row.name}`)
  }

  function handleDelete(row: Service) {
    console.log('Delete', row)
    ElMessageBox.confirm(
      '确认删除该条数据吗?',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
      .then(() => {
        showMessage('删除成功', 'success')
      })
      .catch(() => {
      // cancel
      })
  }
  return {
    selectedRows,
    handleSelectionChange,
    handleEdit,
    handleDelete,
  }
}

function usePagination() {
  const page = ref(1)
  const limit = ref(10)
  const total = ref(0)
  function handleSizeChange(val: number) {
    limit.value = val
    getServiceList()
  }

  function handleCurrentChange(val: number) {
    page.value = val
    getServiceList()
  }
  return {
    page,
    limit,
    total,
    handleSizeChange,
    handleCurrentChange,
  }
}

function useBtnOperations() {
  const showDialog = ref(false)

  function handleAdd() {
    showDialog.value = true
  }

  function handleCloseDialog() {
    showDialog.value = false
  }

  async function handleAddSubmit(data: Service) {
    const res = await addService(data)
    if (res.code === 200) {
      showMessage('新增成功', 'success')
      getServiceList()
      handleCloseDialog()
    }
  }

  function handleBatchDelete() {
    ElMessageBox.confirm(
      '确认删除选中的数据吗?',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
      .then(() => {
        showMessage('删除成功', 'success')
      })
      .catch(() => {
      // cancel
      })
  }
  return {
    showDialog,
    handleCloseDialog,
    handleAddSubmit,
    handleAdd,
    handleBatchDelete,
  }
}
</script>

<template>
  <div class="h-full">
    <!-- Breadcrumb currently in Layout or just header here -->
    <!-- Assuming Layout handles the top bar, but if not, I'll add a simple header or card -->

    <el-card class="h-full !rounded-lg flex flex-col">
      <template #header>
        <div class="flex justify-end items-center">
          <el-button type="primary" @click="handleAdd">
            新增
          </el-button>
          <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
            删除
          </el-button>
        </div>
      </template>

      <div class="flex-1 h-full overflow-hidden flex flex-col">
        <el-table
          :data="tableData"
          height="100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column v-for="column in tableColumns" :key="column.prop" v-bind="column">
            <template v-if="column.prop" #default="scope">
              <div v-if="column.prop === 'opreator'">
                <el-button type="info" size="small" @click="handleEdit(scope.row)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                  删除
                </el-button>
              </div>
              <span v-else>{{ scope.row[column.prop] }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-end mt-4">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="limit"
            :page-sizes="[10, 20, 50, 100]"
            :small="false"
            :disabled="false"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
    <EditDialog :show="showDialog" @close-dialog="handleCloseDialog" @submit="handleAddSubmit" />
  </div>
</template>

<style scoped>
:deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
}
</style>
