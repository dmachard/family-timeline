import apiClient from './axiosInstance'

export async function fetchEvents () {
  const response = await apiClient.get(`/events`)
  return response.data
}


export async function editEvent (eventId, eventData) {
    const response = await apiClient.put(`/events/${eventId}`, eventData)
    return response.data
}

export async function deleteEvent (eventId) {
    const response = await apiClient.delete(`/events/${eventId}`)
    return response.data
}

export async function addAssociation(eventId, eventData) {
  const response = await apiClient.post(`/events/${eventId}/associations/`, eventData)
  return response.data
}