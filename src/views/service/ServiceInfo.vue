<script setup lang="ts">
import type { Service } from '@/utils/types/service'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { queryServiceList } from '@/api/service'
import { showMessage } from '@/utils/utils'

const page = ref(1)
const limit = ref(10)
const total = ref(0)
const selectedRows = ref<Service[]>([])
const tableData = ref<Service[]>([])

onMounted(() => {
  getServiceList()
})

async function getServiceList() {
  const res = await queryServiceList({
    page: page.value,
    limit: limit.value,
  })
  tableData.value = res.data.list
  // 如果后端返回了 total，可以设置 total.value = res.total
  // 暂时使用模拟数据
  total.value = res.data.total
}

function handleSelectionChange(val: Service[]) {
  selectedRows.value = val
}

function handleAdd() {
  ElMessage.success('点击了新增')
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

function handleSizeChange(val: number) {
  limit.value = val
  getServiceList()
}

function handleCurrentChange(val: number) {
  page.value = val
  getServiceList()
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
        <div class="flex-1 overflow-y-auto">
          <el-table
            :data="tableData"
            class="flex-1 h-full"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column prop="date" label="日期" width="180" sortable />
            <el-table-column prop="name" label="姓名" width="180" />
            <el-table-column prop="phone" label="电话" width="180" />
            <el-table-column prop="address" label="地址" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="handleEdit(scope.row)">
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
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
  </div>
</template>

<style scoped>
:deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
}
</style>
