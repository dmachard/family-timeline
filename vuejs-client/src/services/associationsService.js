import apiClient from './axiosInstance'

export async function fetchAssociations () {
  const response = await apiClient.get(`/associations`)
  return response.data
}

export async function deleteAssociation(associationId, personId) {
  const response = await apiClient.delete(`/associations/${associationId}`, {
    params: { personId }
  });
  return response.data;
}