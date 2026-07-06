<template>
  <div class="layout">
    <AppSidebar />

    <div class="layout-right">
      <AppHeader />

      <AppBreadcrumb />

      <div class="layout-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'
import AppBreadcrumb from './components/AppBreadcrumb.vue'
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  height: 100vh;
  background: var(--aams-bg);
  color: var(--aams-text);
}

.layout-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-main {
  flex: 1;
  padding: 16px;
  overflow: auto;
  background: var(--aams-bg-soft);
}
</style>