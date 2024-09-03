import apiClient from './axiosInstance'

export async function fetchRelatives () {
  const response = await apiClient.get('/relatives')
  return response.data
}

export async function addRelative(relativeData) {
  try {
    const response = await apiClient.post('/relatives', relativeData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      throw new Error('No response from server.');
    } else {
      throw new Error('An error occurred');
    }
  }
}


export async function deleteRelative (relativeId) {
  const response = await apiClient.delete(`/relatives/${relativeId}`)
  return response.data
}
