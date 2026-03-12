import apiClient from '../../../shared/api/client';

export const loginRequest = (payload) => apiClient.post('/auth/login', payload);
export const registerRequest = (payload) => apiClient.post('/auth/register', payload);
export const getMeRequest = () => apiClient.get('/auth/me');
export const updateProfileRequest = (payload) => apiClient.put('/auth/profile', payload);
