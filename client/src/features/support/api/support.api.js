import apiClient from '../../../shared/api/client';

export const sendContactMessageRequest = (payload) =>
  apiClient.post('/support/contact', payload);
export const createSupportTicketRequest = (payload) =>
  apiClient.post('/support/ticket', payload);
