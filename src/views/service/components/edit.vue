<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'
import type { Service } from '@/utils/types/service'
import { reactive, ref, watch } from 'vue'
import { getServiceById } from '@/api/service'
import { formatDate, showMessage } from '@/utils/utils'
import { phoneValid } from '@/utils/validator'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  serviceId: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['closeDialog', 'submit'])

const dialogVisible = ref<boolean>(props.show)
watch(() => props.show, (val) => {
  dialogVisible.value = val
})
watch(() => props.serviceId, (val) => {
  if (val) {
    getServiceInfo(val)
  }
})
const form = ref<Service>({
  date: formatDate(), // 默认当前日期
  name: '',
  phone: '',
  address: '',
})
const formRef = ref<FormInstance>()

const formRules = reactive<FormRules>({
  date: [
    { required: true, message: '请选择日期', trigger: 'change', type: 'date' },
  ],
  name: [
    { required: true, message: '请输入名字', trigger: 'change' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字', trigger: 'blur' },
  ],
  phone: [
    { required: true, validator: phoneValid, trigger: 'blur' },
  ],
})

function closeDialog() {
  emit('closeDialog')
}
async function submit() {
  try {
    if (formRef.value) {
      const res = await formRef.value.validate()
      if (res) {
        emit('submit', { ...form.value })
      }
    }
  }
  catch (error: any) {
    showMessage(`请输入正确的内容再提交`, 'warning')
    throw new Error(error)
  }
}
async function getServiceInfo(id: number) {
  const res = await getServiceById(id)
  if (res.code === 200) {
    form.value = res.data
  }
}
</script>

<template>
  <el-dialog v-model="dialogVisible" title="新增" :before-close="closeDialog">
    <ElForm ref="formRef" :model="form" label-width="120px" :rules="formRules">
      <el-form-item label="日期" prop="date">
        <el-date-picker v-model="form.date" type="date" placeholder="请选择日期" />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="form.phone" type="tel" />
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="form.address" />
      </el-form-item>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">
          取消
        </el-button>
        <el-button type="primary" @click="submit">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>
