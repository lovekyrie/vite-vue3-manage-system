<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { CreateAccountingInput, ExpenseType } from '@/utils/types/accounting' // 假设 ExpenseType 也在 types/accounting 里，如果不在则可能需要调整
import { expenseTypeApi } from '@/api/index' // 导入分类API

const props = defineProps<{
  show: boolean
  editData?: CreateAccountingInput | null
}>()

const emit = defineEmits(['close-dialog', 'submit'])

const formRef = ref<FormInstance>()
const loading = ref(false)
const expenseTypes = ref<any[]>([]) // 使用 any 暂时避免类型问题，或者从 api 导入 ExpenseType

const form = reactive<CreateAccountingInput>({
  type: 'expense',
  amount: 0,
  category: '',
  description: '',
  transaction_date: new Date().toISOString().split('T')[0], // 默认今天
  payment_method: '微信',
})

const rules: FormRules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  transaction_date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  payment_method: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
}

const dialogVisible = computed({
  get: () => props.show,
  set: (val) => {
    if (!val)
      emit('close-dialog')
  },
})

// 获取分类列表
async function getExpenseTypes() {
  try {
    const res = await expenseTypeApi.getExpenseTypeList()
    if (res.code === 200) {
      expenseTypes.value = res.data
    }
  }
  catch (error) {
    console.error('获取分类失败', error)
  }
}

onMounted(() => {
  getExpenseTypes()
})

watch(() => props.editData, (val) => {
  if (val) {
    Object.assign(form, val)
    // 确保 amount 是数字
    form.amount = Number(val.amount)
  }
  else {
    // 重置表单
    form.id = undefined
    form.type = 'expense'
    form.amount = 0
    form.category = ''
    form.description = ''
    form.transaction_date = new Date().toISOString().split('T')[0]
    form.payment_method = '微信'
  }
}, { immediate: true })

async function handleSubmit() {
  if (!formRef.value)
    return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...form })
    }
  })
}

function handleClose() {
  emit('close-dialog')
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="form.id ? '编辑记账' : '新增记账'"
    width="500px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio label="income">收入</el-radio>
          <el-radio label="expense">支出</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="金额" prop="amount">
        <el-input-number v-model="form.amount" :precision="2" :step="0.1" :min="0" class="w-full" />
      </el-form-item>

      <el-form-item label="分类" prop="category">
        <!-- 这里可以使用 Select 选择已有分类，也可以输入 -->
        <el-select v-model="form.category" placeholder="请选择分类" allow-create filterable default-first-option class="w-full">
          <el-option
            v-for="item in expenseTypes"
            :key="item.id || item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
      </el-form-item>

      <el-form-item label="交易日期" prop="transaction_date">
        <el-date-picker
          v-model="form.transaction_date"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </el-form-item>

      <el-form-item label="支付方式" prop="payment_method">
        <el-select v-model="form.payment_method" placeholder="请选择支付方式" class="w-full">
          <el-option label="微信" value="微信" />
          <el-option label="支付宝" value="支付宝" />
          <el-option label="信用卡" value="信用卡" />
          <el-option label="银行卡" value="银行卡" />
          <el-option label="现金" value="现金" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.w-full {
  width: 100%;
}
</style>

