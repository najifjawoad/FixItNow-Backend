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