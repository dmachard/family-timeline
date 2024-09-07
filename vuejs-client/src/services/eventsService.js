import apiClient from './axiosInstance'

export async function fetchEvents () {
  const response = await apiClient.get(`/events`)
  return response.data
}


export async function editEvent (eventId, eventData, personId) {
  const response = await apiClient.put(`/events/${eventId}`, eventData, {
    params: { personId }
  })
  return response.data
}

export async function deleteEvent (eventId, personId) {
  const response = await apiClient.delete(`/events/${eventId}`, {
    params: { personId }
  })
  return response.data
}

export async function addAssociation(eventId, eventData, personId) {
  const response = await apiClient.post(`/events/${eventId}/associations/`, eventData, {
    params: { personId }
  })
  return response.data
}