import { DayOfWeek } from "../../../generated/prisma/enums";

export interface CreateServicePayload {
  categoryId: string;
  title: string;
  description?: string;
  price: number;
  durationMinutes: number;
};

export interface AddAvailabilityPayload {
  dayOfWeek: DayOfWeek
  startTime: string; 
  endTime: string;   
};