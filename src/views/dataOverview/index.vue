<script setup lang="ts">
import type { AccountingRecord } from '@/utils/types/accounting'
import { Money, Wallet } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { queryAccountingList } from '@/api/accounting'

// --- 状态数据 ---
const loading = ref(false)
const dateRange = ref('')
const department = ref('')

// 统计概览 (模拟预算数据)
const stats = reactive({
  totalExpense: 0,
  totalBudget: 8888888.00, // 模拟年度预算
  budgetLeft: 0,
  budgetRatio: 0,
})

// 模拟的排行榜数据
const departmentRank = ref<{ name: string, value: number }[]>([])
const employeeRank = ref<{ name: string, value: number }[]>([])

// 图表 DOM 引用
const budgetChartRef = ref<HTMLElement>()
const distributionChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()
const deptRankChartRef = ref<HTMLElement>()
const empRankChartRef = ref<HTMLElement>()

// 图表实例
let charts: echarts.ECharts[] = []
let distributionChartInst: echarts.ECharts | null = null // 专门保存分布图实例
let distChartTimer: any = null // 分布图轮播定时器

// 费用分布详情列表
const distributionList = ref<{ name: string, value: number, percent: string, color: string }[]>([])

// 趋势表数据
const trendTableData = ref<any[]>([])

// --- 辅助函数：格式化金额 ---
function formatMoney(val: number) {
  return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// --- 数据获取与处理 ---
async function fetchData() {
  loading.value = true
  try {
    const res = await queryAccountingList({ page: 1, limit: 10000 })
    if (res.code === 200) {
      const list = res.data.list || []
      processData(list)
      nextTick(() => {
        initCharts()
      })
    }
  }
  catch (error) {
    console.error('获取数据失败', error)
  }
  finally {
    loading.value = false
  }
}

function processData(list: AccountingRecord[]) {
  // 1. 计算总支出
  let expense = 0
  const categoryMap = new Map<string, number>()

  // 模拟月份趋势数据
  const monthMap = new Map<string, number>()

  list.forEach((item) => {
    if (item.type === 'expense') {
      const amount = Number(item.amount)
      expense += amount

      // 分类聚合
      const cat = item.category || '其他'
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + amount)

      // 月份聚合
      const month = item.transaction_date.substring(0, 7) // YYYY-MM
      monthMap.set(month, (monthMap.get(month) || 0) + amount)
    }
  })

  stats.totalExpense = expense
  stats.budgetLeft = stats.totalBudget - expense
  stats.budgetRatio = Math.min(Math.round((expense / stats.totalBudget) * 100), 100)

  // 2. 准备分布列表数据
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#A0CFFF']
  let totalCat = 0
  const distArray = Array.from(categoryMap.entries()).map(([name, value]) => {
    totalCat += value
    return { name, value }
  }).sort((a, b) => b.value - a.value)

  distributionList.value = distArray.map((item, index) => ({
    ...item,
    percent: `${((item.value / totalCat) * 100).toFixed(1)}%`,
    color: colors[index % colors.length],
  }))

  // 3. 准备趋势表数据 (模拟)
  trendTableData.value = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, value]) => ({
      month,
      amount: value,
      // 模拟分类拆解
      c1: value * 0.3,
      c2: value * 0.2,
      c3: value * 0.1,
      c4: value * 0.4,
    }))
    .slice(-6) // 取最近6个月

  // 4. 模拟排行榜数据 (由于没有部门/员工字段，这里用分类模拟部门，用随机名模拟员工)
  departmentRank.value = distArray.slice(0, 5)
  // 生成更多模拟数据以展示滚动条
  const baseNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '卫十二', '蒋十三', '沈十四']
  employeeRank.value = baseNames.map((name, index) => ({
    name,
    value: expense * (0.15 - index * 0.005), // 递减金额
  }))
}

// 导出 ECharts 图片
function exportData() {
  if (distributionChartInst) {
    const url = distributionChartInst.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff',
    })

    const link = document.createElement('a')
    link.href = url
    link.download = `费用分布图_${new Date().toLocaleDateString()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  else {
    console.warn('图表实例未初始化')
  }
}

// --- 图表初始化 ---
function initCharts() {
  // 清理旧实例
  charts.forEach(c => c.dispose())
  charts = []

  // 1. 预算占比 (Gauge)
  if (budgetChartRef.value) {
    const chart = echarts.init(budgetChartRef.value)
    chart.setOption({
      series: [{
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        pointer: { show: false },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: { borderWidth: 1, borderColor: '#464646', color: '#67C23A' },
        },
        axisLine: { lineStyle: { width: 20, color: [[1, '#E6EBF8']] } },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        data: [{
          value: stats.budgetRatio,
          name: '预算使用率',
          title: { offsetCenter: ['0%', '-15%'], fontSize: 12, color: '#909399' },
          detail: {
            offsetCenter: ['0%', '10%'],
            fontSize: 24,
            fontWeight: 'bold',
            color: '#303133',
            formatter: '{value}%',
          },
        }],
      }],
    })
    charts.push(chart)
  }

  // 2. 费用分布 (Pie) - 自动轮播 + 渐变色
  if (distributionChartRef.value) {
    const chart = echarts.init(distributionChartRef.value)
    distributionChartInst = chart // 保存实例引用

    // 定义渐变色
    const getGradientColor = (start: string, end: string) => {
      return new echarts.graphic.LinearGradient(0, 0, 1, 1, [
        { offset: 0, color: start },
        { offset: 1, color: end },
      ])
    }

    // 颜色配置（模拟图片效果）
    const colors = [
      getGradientColor('#409EFF', '#79bbff'), // 蓝
      getGradientColor('#67C23A', '#95d475'), // 绿
      getGradientColor('#E6A23C', '#f3d19e'), // 黄
      getGradientColor('#909399', '#b1b3b8'), // 灰
      getGradientColor('#F56C6C', '#fab6b6'), // 红
    ]

    const option = {
      color: colors,
      tooltip: {
        trigger: 'item',
        confine: true, // 将 tooltip 限制在图表容器内
        position(pos: number[], params: any, dom: any, rect: any, size: any) {
          // tooltip will be fixed on the right if mouse hovering on the left,
          // and on the left if hovering on the right.
          const obj: Record<string, number> = { top: 60 }
          obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5
          return obj
        },
        formatter: '{b}: <br/>金额: {c} <br/>占比: {d}%',
      },
      legend: { show: false },
      series: [{
        name: '费用分布',
        type: 'pie',
        radius: ['45%', '70%'], // 内空外实
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          scale: true,
          scaleSize: 10,
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            formatter: '{b}\n{d}%', // 中间显示名称和百分比
          },
        },
        labelLine: { show: false },
        data: distributionList.value.map(item => ({ name: item.name, value: item.value })),
      }],
    }

    chart.setOption(option)
    charts.push(chart)

    // --- 自动轮播逻辑 ---
    let currentIndex = -1
    const dataLen = distributionList.value.length

    const startLoop = () => {
      if (distChartTimer)
        clearInterval(distChartTimer)
      if (dataLen === 0)
        return

      distChartTimer = setInterval(() => {
        // 取消上一个高亮
        if (currentIndex !== -1) {
          chart.dispatchAction({
            type: 'downplay',
            seriesIndex: 0,
            dataIndex: currentIndex,
          })
        }

        currentIndex = (currentIndex + 1) % dataLen

        // 高亮当前
        chart.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: currentIndex,
        })

        // 显示 Tooltip
        chart.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          dataIndex: currentIndex,
        })
      }, 3000) // 3秒切换
    }

    const stopLoop = () => {
      if (distChartTimer) {
        clearInterval(distChartTimer)
        distChartTimer = null
      }
      // 鼠标移入时，取消当前轮播的高亮状态，让用户自由触发
      if (currentIndex !== -1) {
        chart.dispatchAction({
          type: 'downplay',
          seriesIndex: 0,
          dataIndex: currentIndex,
        })
      }
    }

    // 启动轮播
    startLoop()

    // 鼠标悬浮交互
    chart.on('mouseover', stopLoop)
    chart.on('mouseout', () => {
      // 恢复轮播前，修正 currentIndex，避免跳变
      // 这里简单处理，直接从当前位置继续
      startLoop()
    })
  }

  // 3. 费用趋势 (Bar + Line)
  if (trendChartRef.value) {
    const chart = echarts.init(trendChartRef.value)
    const xData = trendTableData.value.map(i => i.month)
    const yDataBar = trendTableData.value.map(i => i.amount)
    const yDataLine = trendTableData.value.map(() => (Math.random() * 20 - 10).toFixed(1)) // 模拟环比

    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { data: ['消费金额', '环比'], bottom: 0 },
      grid: { left: '3%', right: '3%', bottom: '10%', containLabel: true },
      xAxis: { type: 'category', data: xData },
      yAxis: [
        { type: 'value', name: '金额', splitLine: { lineStyle: { type: 'dashed' } } },
        { type: 'value', name: '环比', axisLabel: { formatter: '{value} %' }, splitLine: { show: false } },
      ],
      series: [
        {
          name: '消费金额',
          type: 'bar',
          data: yDataBar,
          barWidth: '30%',
          itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] },
        },
        {
          name: '环比',
          type: 'line',
          yAxisIndex: 1,
          data: yDataLine,
          smooth: true,
          itemStyle: { color: '#67C23A' },
        },
      ],
    })
    charts.push(chart)
  }

  // 4. 部门排行 (Bar Horizontal)
  if (deptRankChartRef.value) {
    const chart = echarts.init(deptRankChartRef.value)
    const data = [...departmentRank.value].reverse()
    chart.setOption({
      grid: { left: '3%', right: '5%', bottom: '3%', top: '3%', containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        data: data.map(i => i.name),
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [{
        type: 'bar',
        data: data.map(i => i.value),
        barWidth: 15,
        itemStyle: { color: '#409EFF', borderRadius: [0, 10, 10, 0] },
        label: { show: true, position: 'right', formatter: (p: any) => `${(p.value / 10000).toFixed(2)}万` },
      }],
    })
    charts.push(chart)
  }

  // 5. 员工排行 (Bar Horizontal) - 带滚动条
  if (empRankChartRef.value) {
    const chart = echarts.init(empRankChartRef.value)
    // 不反转数据，保持第一名在 index 0
    const data = [...employeeRank.value]

    chart.setOption({
      grid: { left: '3%', right: '8%', bottom: '3%', top: '3%', containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        data: data.map(i => i.name),
        axisTick: { show: false },
        axisLine: { show: false },
        inverse: true, // 让第一名显示在最上面
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          yAxisIndex: 0,
          left: '95%', // 放在右侧
          width: 12,
          startValue: 0, // 从第1个开始
          endValue: 8, // 到第9个结束 (显示9条)
          zoomLock: true, // 锁定缩放，只能平移
          brushSelect: false,
          showDataShadow: false,
          showDetail: false, // 隐藏滚动条旁边的文字详情
          handleSize: '80%',
          borderColor: 'transparent',
          backgroundColor: '#f5f7fa',
          fillerColor: '#dcdfe6',
          handleStyle: {
            color: '#dcdfe6',
            borderColor: '#dcdfe6',
          },
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          startValue: 0,
          endValue: 8,
          zoomOnMouseWheel: false, // 禁用滚轮缩放
          moveOnMouseWheel: true, // 启用滚轮平移
        },
      ],
      series: [{
        type: 'bar',
        data: data.map(i => i.value),
        barWidth: 15,
        itemStyle: { color: '#67C23A', borderRadius: [0, 10, 10, 0] },
        label: { show: true, position: 'right', formatter: (p: any) => `${(p.value / 10000).toFixed(2)}万` },
      }],
    })
    charts.push(chart)
  }
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (distChartTimer)
    clearInterval(distChartTimer)
  charts.forEach(c => c.dispose())
})

function handleResize() {
  charts.forEach(c => c.resize())
}
</script>

<template>
  <div class="dashboard-container">
    <!-- 顶部筛选栏 (模拟) -->
    <div class="header-actions">
      <span class="page-title">消费概览 <span class="sub-text">统计截止: 2025-11-21</span></span>
      <div class="filters">
        <el-date-picker v-model="dateRange" type="month" placeholder="筛选日期" size="small" style="width: 120px; margin-right: 10px;" />
        <el-select v-model="department" placeholder="所有部门" size="small" style="width: 120px;">
          <el-option label="技术部" value="tech" />
          <el-option label="市场部" value="market" />
        </el-select>
      </div>
    </div>

    <!-- 第一行：概览 + 预算 + 分布 -->
    <div class="grid-row row-1">
      <!-- 左侧：两个指标卡片 -->
      <div class="col-small col-flex-v">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-header">
            <div class="icon-box bg-blue">
              <el-icon><Money /></el-icon>
            </div>
            <span class="kpi-title">总报销金额</span>
            <span class="unit">单位:元</span>
          </div>
          <div class="kpi-value">
            {{ formatMoney(stats.totalExpense) }}
          </div>
          <div class="kpi-footer">
            预算剩余 {{ formatMoney(stats.budgetLeft) }}
          </div>
        </el-card>

        <el-card shadow="never" class="kpi-card">
          <div class="kpi-header">
            <div class="icon-box bg-blue-light">
              <el-icon><Wallet /></el-icon>
            </div>
            <span class="kpi-title">2025年总预算</span>
            <span class="unit">单位:元</span>
          </div>
          <div class="kpi-value">
            {{ formatMoney(stats.totalBudget) }}
          </div>
        </el-card>
      </div>

      <!-- 中间：预算占比 -->
      <div class="col-small">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="card-title">
              总报销金额/总预算
            </div>
          </template>
          <div ref="budgetChartRef" class="chart-box" />
        </el-card>
      </div>

      <!-- 右侧：费用分布 -->
      <div class="col-large">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="card-title flex items-center justify-between">
              <p>费用分布 <span class="sub-text">时间维度: 2025年</span></p>
              <el-button type="primary" size="small" @click="exportData">
                导出
              </el-button>
            </div>
          </template>
          <div class="distribution-container">
            <div ref="distributionChartRef" class="dist-chart" />
            <div class="dist-list">
              <div class="list-header">
                <span>分类名称</span>
                <span>费用金额(元)</span>
              </div>
              <div v-for="(item, idx) in distributionList" :key="idx" class="list-item">
                <div class="item-name">
                  <span class="dot" :style="{ background: item.color }" />
                  {{ item.name }}
                </div>
                <div class="item-value">
                  {{ formatMoney(item.value) }}
                </div>
                <div class="item-percent">
                  {{ item.percent }}
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 第二行：趋势 + 表格 -->
    <div class="grid-row row-2">
      <div class="col-trend">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="flex justify-between items-center">
              <div class="card-title">
                费用趋势
              </div>
              <el-radio-group size="small">
                <el-radio-button label="月度" />
                <el-radio-button label="季度" />
                <el-radio-button label="年度" />
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-box-lg" />
        </el-card>
      </div>

      <div class="col-table">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="card-title">
              费用趋势表格
            </div>
          </template>
          <el-table :data="trendTableData" height="300" size="small" :style="{ width: '100%' }">
            <el-table-column prop="month" label="筛选日期(月)" width="100" />
            <el-table-column prop="amount" label="报销金额(元)" min-width="100">
              <template #default="{ row }">
                {{ formatMoney(row.amount) }}
              </template>
            </el-table-column>
            <el-table-column prop="c1" label="出行费" min-width="80">
              <template #default="{ row }">
                {{ formatMoney(row.c1) }}
              </template>
            </el-table-column>
            <el-table-column prop="c2" label="住宿费" min-width="80">
              <template #default="{ row }">
                {{ formatMoney(row.c2) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </div>

    <!-- 第三行：排行榜 -->
    <div class="grid-row row-3">
      <div class="col-half">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="card-title">
              部门排行 TOP
            </div>
          </template>
          <div ref="deptRankChartRef" class="chart-box-md" />
        </el-card>
      </div>
      <div class="col-half">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="card-title">
              员工排行 TOP
            </div>
          </template>
          <div ref="empRankChartRef" class="chart-box-md" />
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.sub-text {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
  margin-left: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

/* Grid Layout System */
.grid-row {
  display: flex;
  gap: 16px;
}

.h-full { height: 100%; }

/* Row 1 */
.row-1 { height: 280px; }
.col-small { flex: 1; min-width: 240px; }
.col-large { flex: 2; min-width: 480px; }
.col-flex-v { display: flex; flex-direction: column; gap: 16px; }

.kpi-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.kpi-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 10px;
  font-size: 20px;
}
.bg-blue { background: #409EFF; }
.bg-blue-light { background: #79bbff; }

.kpi-title { font-size: 14px; font-weight: bold; color: #303133; margin-right: auto; }
.unit { font-size: 12px; color: #909399; }

.kpi-value { font-size: 28px; font-weight: bold; color: #303133; margin-bottom: 8px; font-family: 'DIN', sans-serif; }
.kpi-footer { font-size: 12px; color: #909399; background: #f4f4f5; padding: 2px 8px; border-radius: 4px; display: inline-block; }

/* Distribution Area */
.distribution-container {
  display: flex;
  height: 100%;
  align-items: center;
}
.dist-chart { flex: 1; height: 100%; }
.dist-list { flex: 1; height: 100%; overflow-y: auto; padding-right: 10px; font-size: 13px; }
.list-header { display: flex; justify-content: space-between; color: #909399; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #EBEEF5; }
.list-item { display: flex; align-items: center; margin-bottom: 12px; }
.item-name { flex: 1; display: flex; align-items: center; }
.dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }
.item-value { width: 100px; text-align: right; font-weight: bold; }
.item-percent { width: 60px; text-align: right; color: #909399; }

/* Row 2 */
.row-2 { height: 380px; }
.col-trend { flex: 3; }
.col-table { flex: 2; }

/* Row 3 */
.row-3 { height: 320px; }
.col-half { flex: 1; }

/* Chart Containers */
.chart-box { width: 100%; height: 100%; min-height: 200px; }
.chart-box-lg { width: 100%; height: 100%; min-height: 300px; }
.chart-box-md { width: 100%; height: 100%; min-height: 240px; }

:deep(.el-card__body) {
  height: calc(100% - 55px); /* 减去 header 高度 */
  padding: 16px;
  box-sizing: border-box;
}
:deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #EBEEF5;
}
</style>
