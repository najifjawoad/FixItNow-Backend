export interface CreateBookingPayload  {
  serviceId: string;
  scheduledAt: string; 
  address: string;
  notes?: string;
};