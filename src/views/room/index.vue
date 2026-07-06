<template>
  <div class="room-container">
    <!-- 顶部搜索与操作区 -->
    <div class="panel header-panel">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="房间号">
          <el-input v-model="queryParams.keyword" placeholder="搜房间号/标签" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="房间性别">
          <el-select v-model="queryParams.gender" placeholder="全部" clearable style="width: 120px">
            <el-option label="男房" value="male" />
            <el-option label="女房" value="female" />
            <el-option label="纯空房/未染色" value="mixed" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" value="active" />
            <el-option label="锁定保留" value="locked" />
            <el-option label="停用维修" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="action-btn">
        <el-button type="success" @click="openAddDialog">
          <el-icon>
            <Plus />
          </el-icon> 新增房间
        </el-button>
      </div>
    </div>

    <!-- 数据表格区 -->
    <div class="panel table-panel">
      <el-table v-loading="loading" :data="roomList" style="width: 100%" border>
        <el-table-column prop="room_no" label="房间号" width="120" align="center">
          <template #default="{ row }">
            <span class="room-no-text">{{ row.room_no }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别属性" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.gender === 'male'" type="primary" effect="light">男房</el-tag>
            <el-tag v-else-if="row.gender === 'female'" type="danger" effect="light">女房</el-tag>
            <el-tag v-else type="info" effect="plain">未染色(空)</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="床位使用 (已用 / 容量)" width="180" align="center">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.used >= row.capacity }">
              {{ row.used }} / {{ row.capacity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="team_id" label="绑定团队ID" width="120" align="center" />
        <el-table-column prop="tags" label="小组标签" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success">正常</el-tag>
            <el-tag v-else-if="row.status === 'locked'" type="warning">锁定</el-tag>
            <el-tag v-else type="danger">停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" link :disabled="row.used > 0" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.pageSize" :total="total"
          :page-sizes="[20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @size-change="fetchData"
          @current-change="fetchData" />
      </div>
    </div>

    <!-- 弹窗：新增/编辑房间 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增房间' : '编辑房间'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="房间号" prop="room_no">
          <el-input v-model="form.room_no" placeholder="例如: A栋-101" />
        </el-form-item>
        <el-form-item label="房间容量" prop="capacity">
          <el-input-number v-model="form.capacity" :min="1" :max="20" />
        </el-form-item>
        <el-form-item label="性别类型" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="mixed">纯空房(mixed)</el-radio>
            <el-radio label="male"
              :disabled="dialogType === 'edit' && form.used > 0 && originGender === 'female'">男房</el-radio>
            <el-radio label="female"
              :disabled="dialogType === 'edit' && form.used > 0 && originGender === 'male'">女房</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="绑定大团队" prop="team_id">
          <el-input v-model.number="form.team_id" placeholder="输入团队ID (可为空)" clearable />
        </el-form-item>
        <el-form-item label="小组标签" prop="tags">
          <el-input v-model="form.tags" placeholder="例如: 一分队 (可为空)" clearable />
        </el-form-item>
        <el-form-item label="房间状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="正常营业 (active)" value="active" />
            <el-option label="锁定保留 (locked)" value="locked" />
            <el-option label="停用维修 (disabled)" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 注意：由于配置了 unplugin-auto-import，ref, reactive, onMounted 等无需手动 import
import { getRoomList, createRoom, updateRoom, deleteRoom } from '@/api/rooms'

const loading = ref(false)
const roomList = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  gender: '',
  status: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRoomList(queryParams)
    if (res.code === 200 || res.success) {
      roomList.value = res.data.list
      total.value = res.data.pagination.total
    }
  } catch (error) {
    ElMessage.error('获取房间数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.gender = ''
  queryParams.status = ''
  handleSearch()
}

// 弹窗表单逻辑
const dialogVisible = ref(false)
const dialogType = ref('add')
const submitLoading = ref(false)
const formRef = ref(null)
const originGender = ref('')

const form = reactive({
  id: null,
  room_no: '',
  capacity: 8,
  gender: 'mixed',
  team_id: null,
  tags: '',
  status: 'active',
  used: 0
})

const rules = {
  room_no: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  capacity: [{ required: true, message: '请设置房间容量', trigger: 'blur' }]
}

const resetForm = () => {
  form.id = null
  form.room_no = ''
  form.capacity = 8
  form.gender = 'mixed'
  form.team_id = null
  form.tags = ''
  form.status = 'active'
  form.used = 0
}

const openAddDialog = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  dialogType.value = 'edit'
  originGender.value = row.gender
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (dialogType.value === 'add') {
          await createRoom(form)
          ElMessage.success('新增房间成功')
        } else {
          await updateRoom(form.id, form)
          ElMessage.success('更新房间成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除房间 [${row.room_no}] 吗？删除后无法恢复。`,
    '高危操作提示',
    { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      await deleteRoom(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => { })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.room-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel {
  background: var(--aams-bg);
  border: 1px solid var(--aams-border);
  border-radius: 10px;
  padding: 16px;
}

.header-panel {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.search-form {
  flex: 1;
}

.action-btn {
  margin-left: 16px;
}

.room-no-text {
  font-weight: 600;
  color: var(--aams-primary);
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>