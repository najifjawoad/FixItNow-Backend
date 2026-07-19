export interface GetServicesFilters  {
  categoryId?: string;
  search?: string;      // matches against title
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;   // filters technician.avgRating
  sortBy?: "price" | "rating" | "newest";
  sortOrder?: "asc" | "desc";
  page?: string;
  limit?: string;
};

export type GetTechniciansFilters = {
  search?: string;         // matches against user.name
  skill?: string;          // matches against skills array
  minExperience?: string;
  minRating?: string;
  verified?: string;       // "true" | "false"
  sortBy?: "rating" | "experience" | "newest";
  sortOrder?: "asc" | "desc";
  page?: string;
  limit?: string;
};