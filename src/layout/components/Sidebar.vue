<template>
  <el-menu
    active-text-color="#ffd04b"
    background-color="#304156"
    class="el-menu-vertical-demo"
    default-active="/service/info"
    text-color="#fff"
    router
  >
    <div class="logo">
      <span>记账管理系统</span>
    </div>
    
    <el-menu-item index="/data/overview">
      <el-icon><PieChart /></el-icon>
      <span>数据总览</span>
    </el-menu-item>

    <el-sub-menu index="/service">
      <template #title>
        <el-icon><Service /></el-icon>
        <span>服务管理</span>
      </template>
      <el-menu-item index="/service/info">服务信息</el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="/product">
      <template #title>
        <el-icon><Goods /></el-icon>
        <span>产品管理</span>
      </template>
      <el-menu-item index="/product/list">产品列表</el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="/expense">
      <template #title>
        <el-icon><Money /></el-icon>
        <span>费用管理</span>
      </template>
      <el-menu-item index="/expense/list">费用列表</el-menu-item>
    </el-sub-menu>

    <el-menu-item index="/knowledge">
      <el-icon><Reading /></el-icon>
      <span>知识库</span>
    </el-menu-item>

    <el-sub-menu index="/record">
      <template #title>
        <el-icon><Notebook /></el-icon>
        <span>记账管理</span>
      </template>
      <el-menu-item index="/record/list">记账列表</el-menu-item>
    </el-sub-menu>

    <el-menu-item index="/about">
      <el-icon><InfoFilled /></el-icon>
      <span>关于我们</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import {
  Service,
  Goods,
  Money,
  Reading,
  Notebook,
  InfoFilled,
  PieChart
} from '@element-plus/icons-vue'
</script>

<style scoped>
.el-menu-vertical-demo {
  height: 100vh;
  border-right: none;
}
.logo {
  height: 50px;
  line-height: 50px;
  color: #fff;
  font-size: 18px;
  padding-left: 20px;
  font-weight: bold;
  background-color: #2b3649;
}
</style>

