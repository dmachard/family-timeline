import apiClient from './axiosInstance'

export async function fetchAttachments () {
  const response = await apiClient.get(`/attachments`)
  return response.data
}

export async function deleteAttachment (attachmentId) {
  const response = await apiClient.delete(`/attachments/${attachmentId}`)
  return response.data
}

export async function createAttachment (attachmentData) {
  const response = await apiClient.post('/attachments/', attachmentData)
  return response.data
}