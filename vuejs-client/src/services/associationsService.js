import apiClient from './axiosInstance'

export async function fetchAssociations () {
  const response = await apiClient.get(`/associations`)
  return response.data
}

export async function deleteAssociation(associationId) {
  const response = await apiClient.delete(`/associations/${associationId}`);
  return response.data;
}