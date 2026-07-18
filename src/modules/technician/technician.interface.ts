export interface CreateServicePayload {
  categoryId: string;
  title: string;
  description?: string;
  price: number;
  durationMinutes: number;
};