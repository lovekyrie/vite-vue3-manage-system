<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
        <Sidebar />
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-content">
            <!-- Placeholder for header content (e.g., user info, breadcrumbs) -->
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.el-aside {
  background-color: #304156;
  color: var(--el-text-color-primary);
  height: 100vh;
}

.el-header {
  background-color: #fff;
  color: var(--el-text-color-primary);
  line-height: 60px;
  border-bottom: 1px solid #dcdfe6;
}

.el-main {
  background-color: #f0f2f5;
  padding: 24px;
  height: calc(100vh - 60px);
}
</style>
