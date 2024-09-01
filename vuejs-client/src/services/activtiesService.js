import apiClient from './axiosInstance'

export async function fetchActivities () {
  const response = await apiClient.get('/activities')
  return response.data
}