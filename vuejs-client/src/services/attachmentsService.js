import apiClient from './axiosInstance'

export async function fetchAttachments () {
  const response = await apiClient.get(`/attachments`)
  return response.data
}

export async function deleteAttachment (attachmentId, personId) {
  const response = await apiClient.delete(`/attachments/${attachmentId}`, {
    params: { personId }
  })
  return response.data
}

export async function createAttachment (attachmentData, personId) {
  const response = await apiClient.post('/attachments/', attachmentData, {
    params: { personId }
  })
  return response.data
}