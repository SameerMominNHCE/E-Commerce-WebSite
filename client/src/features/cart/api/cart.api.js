import apiClient from '../../../shared/api/client';

export const fetchCartRequest = () => apiClient.get('/cart');
export const addToCartRequest = (payload) => apiClient.post('/cart/add', payload);
export const updateCartItemRequest = (itemId, payload) =>
  apiClient.put(`/cart/update/${itemId}`, payload);
export const removeCartItemRequest = (itemId) => apiClient.delete(`/cart/remove/${itemId}`);
export const clearCartRequest = () => apiClient.delete('/cart/clear');
