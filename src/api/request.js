import axios from 'axios'

const service = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截
service.interceptors.request.use(config => {
  return config
})

// 响应拦截
service.interceptors.response.use(
  res => res.data,
  err => {
    console.error('API Error:', err)
    return Promise.reject(err)
  }
)

export default service