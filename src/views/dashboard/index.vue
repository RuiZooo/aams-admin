<!--
 * @Author: RuiZZZ 2372456234@qq.com
 * @Date: 2026-07-06 19:47:51
 * @LastEditors: RuiZZZ 2372456234@qq.com
 * @LastEditTime: 2026-07-06 21:12:57
 * @FilePath: \aams-admin\src\views\dashboard\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="dashboard-container">
    <!-- 核心统计指标 -->
    <el-row :gutter="24" class="stat-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-title">总房间资源</div>
          <div class="stat-value">{{ stats.totalRooms }} <span class="unit">间</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-title">已用床位 / 总容量</div>
          <div class="stat-value">{{ stats.usedBeds }} <span class="unit-divider">/</span> <span class="sub-value">{{
            stats.totalBeds }}</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card highlight">
          <div class="stat-title">当前空余床位</div>
          <div class="stat-value text-primary">{{ stats.freeBeds }} <span class="unit">床</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-title">今日新办入住</div>
          <div class="stat-value">{{ stats.todayCheckin }} <span class="unit">人</span></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="main-row">
      <!-- 核心：实时房态矩阵面板 -->
      <el-col :span="18">
        <div class="matrix-panel">
          <div class="panel-header">
            <h3 class="panel-title">实时房态大盘</h3>
            <div class="panel-legend">
              <span class="legend-item"><i class="dot empty"></i> 未染色(空)</span>
              <span class="legend-item"><i class="dot male"></i> 男房</span>
              <span class="legend-item"><i class="dot female"></i> 女房</span>
              <span class="legend-item"><i class="dot disabled"></i> 锁定/维修</span>
            </div>
          </div>

          <div v-loading="roomLoading" class="matrix-grid">
            <el-tooltip v-for="room in rooms" :key="room.room_no" placement="top" :show-after="200" effect="light">
              <template #content>
                <div class="tooltip-detail">
                  <div class="t-header">{{ room.room_no }} <span>({{ room.capacity }}人间)</span></div>
                  <div class="t-row"><span>状态：</span>{{ getStatusText(room.status) }}</div>
                  <div class="t-row"><span>绑定团队：</span>{{ room.team_id || '无 (全局)' }}</div>
                  <div class="t-row"><span>小组标签：</span>{{ room.tags || '无' }}</div>
                </div>
              </template>

              <div class="room-card" :class="getRoomStatusClass(room)">
                <div class="rc-header">
                  <div class="status-indicator"></div>
                  <div v-if="room.used >= room.capacity" class="full-tag">满</div>
                </div>
                <div class="rc-body">
                  <div class="room-no">{{ room.room_no }}</div>
                </div>
                <div class="rc-footer">
                  <div class="usage-text">{{ room.used }} / {{ room.capacity }}</div>
                </div>
                <!-- 极细水位线进度条 -->
                <div class="rc-progress">
                  <div class="progress-fill" :style="{ width: (room.used / room.capacity * 100) + '%' }"></div>
                </div>
              </div>
            </el-tooltip>
          </div>
        </div>
      </el-col>

      <!-- 侧边栏：操作流水 -->
      <el-col :span="6">
        <div class="timeline-panel">
          <div class="panel-header">
            <h3 class="panel-title">动态流水</h3>
          </div>
          <div v-loading="logLoading" class="timeline-content">
            <el-empty v-if="logs.length === 0" description="暂无动态" :image-size="60" />
            <el-timeline v-else>
              <el-timeline-item v-for="log in logs" :key="log.id" :type="getLogType(log.action)"
                :timestamp="formatTime(log.created_at)" size="large">
                <div class="log-item">
                  <div class="log-action">{{ getActionName(log.action) }}</div>
                  <div class="log-detail" :title="log.message">{{ log.message }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
// 从你的 api 文件中引入真实的接口请求方法
import { getDashboardStats, getRoomOverview, getRecentLogs } from '@/api/dashboard'

const roomLoading = ref(false)
const logLoading = ref(false)

// 响应式数据赋初始空值
const stats = ref({
  totalRooms: 0,
  usedBeds: 0,
  totalBeds: 0,
  freeBeds: 0,
  todayCheckin: 0
})

const rooms = ref([])
const logs = ref([])

// 调用真实接口获取数据
const loadData = async () => {
  try {
    // 1. 获取顶部统计指标
    const statsRes = await getDashboardStats()
    console.log('Dashboard Stats Response:', statsRes) // 调试输出
    if (statsRes.code === 200 || statsRes.success) {
      stats.value = statsRes.data
    }

    // 2. 获取实时房态矩阵
    roomLoading.value = true
    const roomRes = await getRoomOverview({ limit: 100 }) // 获取前100个房间
    console.log('Room Overview Response:', roomRes) // 调试输出
    if (roomRes.code === 200 || roomRes.success) {
      // 兼容可能存在的 data.list 或直接返回 data 数组的情况
      rooms.value = roomRes.data.list || roomRes.data
    }
    roomLoading.value = false

    // 3. 获取侧边栏近期流水
    logLoading.value = true
    const logRes = await getRecentLogs({ limit: 10 })
    if (logRes.code === 200 || logRes.success) {
      logs.value = logRes.data.list || logRes.data
    }
    logLoading.value = false

  } catch (error) {
    console.error('大盘数据加载失败:', error)
    ElMessage.error('获取大盘数据失败，请检查网络或后端服务')
    roomLoading.value = false
    logLoading.value = false
  }
}

// 计算房间状态对应的 CSS Class
const getRoomStatusClass = (room) => {
  if (room.status === 'disabled' || room.status === 'locked') return 'is-disabled'
  if (room.used === 0 || room.gender === 'mixed') return 'is-empty'
  if (room.gender === 'male') return 'is-male'
  if (room.gender === 'female') return 'is-female'
  return 'is-empty'
}

// 翻译房间状态
const getStatusText = (status) => {
  const map = { active: '正常', locked: '锁定', disabled: '停用' }
  return map[status] || status
}

// 根据日志操作类型决定 Timeline 节点的颜色
const getLogType = (action) => {
  if (action.includes('checkin')) return 'success'
  if (action.includes('checkout')) return 'warning'
  if (action.includes('transfer')) return 'primary'
  return 'info'
}

// 翻译系统流水日志的操作名称
const getActionName = (action) => {
  const map = {
    'person.checkin': '办理入住',
    'person.checkin.auto': '系统自动分配',
    'person.checkout': '办理退房',
    'person.transferRoom': '人员换房',
    'room.create': '新增房间'
  }
  return map[action] || action
}

// 格式化时间显示 (只显示时分，保持极简)
const formatTime = (dateObj) => {
  if (!dateObj) return ''
  const d = new Date(dateObj)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

onMounted(() => {
  // 首次加载真实数据
  loadData()

  // 每隔 30 秒自动轮询刷新大盘数据，确保管理员看到的是实时的（可根据你的服务器压力评估是否需要开启）
  setInterval(loadData, 30000)
})
</script>

<style scoped lang="scss">
/* 严格遵守：无大面积色块，调用 Element Plus 原生变量，极简风格 */

.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 顶部统计卡片 */
.stat-row {
  margin-bottom: 8px;
}

.stat-card {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--el-border-color);
  }

  .stat-title {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
    font-weight: 500;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.2;
    letter-spacing: -0.5px;
  }

  .sub-value {
    font-size: 20px;
    color: var(--el-text-color-regular);
  }

  .unit-divider {
    font-size: 18px;
    color: var(--el-text-color-placeholder);
    margin: 0 4px;
  }

  .unit {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    font-weight: normal;
  }

  .text-primary {
    color: var(--el-color-primary);
  }
}

/* 主体内容区 */
.main-row {
  align-items: stretch;
}

.matrix-panel,
.timeline-panel {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .panel-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

/* 图例 */
.panel-legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--el-text-color-regular);

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;

    &.empty {
      background-color: var(--el-border-color-darker);
    }

    &.male {
      background-color: var(--el-color-primary);
    }

    &.female {
      background-color: var(--el-color-danger);
    }

    &.disabled {
      background-color: var(--el-text-color-placeholder);
      opacity: 0.5;
    }
  }
}

/* 矩阵网格 */
.matrix-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 4px;
  padding-bottom: 4px;
}

/* 单个房间卡片 */
.room-card {
  position: relative;
  height: 84px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  overflow: hidden;

  &:hover {
    border-color: var(--el-border-color);
  }

  .rc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    height: 14px;

    .status-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--el-border-color-darker);
    }

    .full-tag {
      font-size: 10px;
      background-color: var(--el-text-color-primary);
      color: var(--el-bg-color);
      padding: 2px 6px;
      border-radius: 4px;
      line-height: 1;
      font-weight: bold;
    }
  }

  .rc-body {
    flex: 1;
    display: flex;
    align-items: center;

    .room-no {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .rc-footer {
    display: flex;
    justify-content: flex-start;

    .usage-text {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      font-family: monospace;
    }
  }

  /* 极细进度条 */
  .rc-progress {
    position: absolute;
    bottom: 0;
    left: 8px;
    right: 8px;
    height: 2px;
    background-color: transparent;

    .progress-fill {
      height: 100%;
      border-radius: 2px 2px 0 0;
      transition: width 0.4s ease;
    }
  }

  /* 状态动态类 */
  &.is-empty {
    .progress-fill {
      background-color: transparent;
    }
  }

  &.is-male {
    border-color: var(--el-color-primary-light-7);

    .status-indicator {
      background-color: var(--el-color-primary);
    }

    .room-no {
      color: var(--el-color-primary);
    }

    .progress-fill {
      background-color: var(--el-color-primary);
    }
  }

  &.is-female {
    border-color: var(--el-color-danger-light-7);

    .status-indicator {
      background-color: var(--el-color-danger);
    }

    .room-no {
      color: var(--el-color-danger);
    }

    .progress-fill {
      background-color: var(--el-color-danger);
    }
  }

  &.is-disabled {
    opacity: 0.5;
    background-color: var(--el-fill-color-light);

    .status-indicator {
      background-color: var(--el-text-color-placeholder);
    }

    .progress-fill {
      display: none;
    }

    cursor: not-allowed;

    &:hover {
      transform: none;
      border-color: var(--el-border-color-light);
    }
  }
}

/* Tooltip 详情样式 */
.tooltip-detail {
  padding: 4px;

  .t-header {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 6px;
    border-bottom: 1px solid var(--el-border-color-light);
    padding-bottom: 4px;
    color: var(--el-text-color-primary);

    span {
      font-size: 12px;
      font-weight: normal;
      color: var(--el-text-color-secondary);
    }
  }

  .t-row {
    font-size: 12px;
    margin-bottom: 4px;
    color: var(--el-text-color-regular);

    span {
      color: var(--el-text-color-secondary);
      display: inline-block;
      width: 60px;
    }
  }
}

/* 时间线区域 */
.timeline-content {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
  padding-top: 4px;
}

.log-item {
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  padding: 12px 16px;
  border-radius: 8px;

  .log-action {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 4px;
  }

  .log-detail {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
  }
}
</style>