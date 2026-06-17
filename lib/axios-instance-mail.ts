import axios from "axios"
import { cookies } from "next/headers"

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  timeout: 30000, // 30 seconds
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
})

axiosInstance.interceptors.request.use(async (config) => {
  const _cookies = await cookies()
  const AUTH_TOKEN = _cookies.get("MAIL_AUTH_TOKEN")
  if (AUTH_TOKEN) {
    config.headers.Authorization = `Bearer ${AUTH_TOKEN.value}`
  }
  return config
})

export { axiosInstance }
