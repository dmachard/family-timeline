import apiClient from './axiosInstance'

export async function fetchEnrichedPersons () {
  const response = await apiClient.get('/persons/enriched')
  return response.data
}

export async function fetchPersons () {
  const response = await apiClient.get('/persons')
  return response.data
}

export async function fetchMiddleNames () {
  const response = await apiClient.get('/persons/middle-names')
  return response.data
}

export async function addPerson(personData) {
  const response = await apiClient.post('/persons', personData);
  return response.data;
}

export async function deletePerson(personId) {
  const response = await apiClient.delete(`/persons/${personId}`);
  return response.data;
}