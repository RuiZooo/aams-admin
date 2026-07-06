<template>
  <div class="sidebar">
    <div class="logo">AAMS</div>

    <el-menu
        class="menu"
        router
        background-color="transparent"
        text-color="var(--aams-text)"
        active-text-color="var(--aams-primary)"
    >
      <el-menu-item index="/dashboard">
        Dashboard
      </el-menu-item>

      <el-menu-item index="/room">
        房间管理
      </el-menu-item>

      <el-menu-item index="/person">
        人员管理
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped lang="scss">
.sidebar {
  width: 220px;
  height: 100vh;
  border-right: 1px solid var(--aams-border);
  background: var(--aams-bg);
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-bottom: 1px solid var(--aams-border);
}

.menu {
  border: none;
}
</style>