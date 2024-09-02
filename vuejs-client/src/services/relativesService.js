import apiClient from './axiosInstance'

export async function fetchRelatives () {
  const response = await apiClient.get('/relatives')
  return response.data
}

export async function addRelative (relativeData) {
  const response = await apiClient.post('/relatives', relativeData)
  return response.data
}

export async function deleteRelative (relativeId) {
  const response = await apiClient.delete(`/relatives/${relativeId}`)
  return response.data
}
