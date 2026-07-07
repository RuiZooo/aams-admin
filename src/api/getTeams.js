import request from './request'

// 获取房间列表 (支持分页和条件查询)
export function getTeams() {
  return request({
    url: '/aams/teams',
    method: 'GET',
  })
}