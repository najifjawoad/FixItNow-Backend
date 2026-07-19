import { DayOfWeek } from "../../../generated/prisma/enums";

export interface CreateServicePayload {
  categoryId: string;
  title: string;
  description?: string;
  price: number;
  durationMinutes: number;
};

export interface AddAvailabilityPayload {
  date: string;
  startTime: string; 
  endTime: string;   
};

