import request from './request'

// 获取统计数据
export function getDashboardStats() {
  return request({
    url: '/aams/dashboard/overview',
    method: 'GET'
  })
}

// 获取房态数据
export function getRoomOverview() {
  return request({
    url: '/aams/dashboard/rooms',
    method: 'GET'
  })
}

// 获取日志
export function getRecentLogs() {
  return request({
    url: '/aams/dashboard/logs',
    method: 'GET'
  })
}