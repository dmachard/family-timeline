import apiClient from './axiosInstance'

export async function fetchPersons () {
  const response = await apiClient.get('/persons')
  return response.data
}

export async function fetchTotalPersons () {
  const response = await apiClient.get('/persons/total')
  return response.data.total
}

export async function fetchRootPersons () {
  const response = await apiClient.get('/persons/root')
  return response.data
}

export async function fetchPerson (personId) {
  const response = await apiClient.get(`/persons/${personId}`)
  return response.data
}

export async function fetchOldestAncestor (personId) {
  const response = await apiClient.get(`/persons/${personId}/oldest-ancestor`)
  return response.data
}

export async function fetchParents (personId) {
  const response = await apiClient.get(`/persons/${personId}/parents`)
  return response.data
}

export async function fetchSpouses (personId) {
  const response = await apiClient.get(`/persons/${personId}/spouses`)
  return response.data
}

export async function fetchChildren (personId, spouseId) {
  const response = await apiClient.get(`/persons/${personId}/children/${spouseId}`)
  return response.data
}
