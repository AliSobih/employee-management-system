import { PaginationInfo } from "./pagination-info.model";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  pagination?: PaginationInfo;
}
