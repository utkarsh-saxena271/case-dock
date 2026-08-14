import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.BASE_URL,
  withCredentials: true
})

export default instance