import apiClient from '../../../shared/api/client';

export const getProductReviewsRequest = (productId, params) =>
  apiClient.get(`/reviews/product/${productId}`, { params });
export const addReviewRequest = (payload) => apiClient.post('/reviews/add', payload);
export const markReviewHelpfulRequest = (reviewId) =>
  apiClient.put(`/reviews/${reviewId}/helpful`, {});
