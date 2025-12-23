import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Employee } from '../../features/employees/models/employee.model';
import { EmployeeSearchCriteria } from '../../features/employees/models/employee-search-criteria';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private endpoint ='/api/v1/employees';

  constructor(private apiService: ApiService) {}

  createEmployee(employee: Employee): Observable<ApiResponse<Employee>> {
    return this.apiService.post<ApiResponse<Employee>>(this.endpoint, employee);
  }

  updateEmployee(id: number, employee: Employee): Observable<ApiResponse<Employee>> {
    return this.apiService.put<ApiResponse<Employee>>(`${this.endpoint}/${id}`, employee);
  }

  getAllEmployees(): Observable<ApiResponse<Employee[]>> {
    return this.apiService.get<ApiResponse<Employee[]>>(this.endpoint);
  }

  getAllActiveEmployees(): Observable<ApiResponse<Employee[]>> {
    return this.apiService.get<ApiResponse<Employee[]>>(`${this.endpoint}/active`);
  }

  searchEmployees(criteria: EmployeeSearchCriteria): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>(`${this.endpoint}/search`, criteria);
  }

  deleteEmployee(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }

  restoreEmployee(id: number): Observable<ApiResponse<void>> {
    return this.apiService.patch<ApiResponse<void>>(`${this.endpoint}/${id}/restore`);
  }

  uploadEmployeeImage(id: number, file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    console.log('Uploading file:', `${this.endpoint}/${id}/image`);
    return this.apiService.post<ApiResponse<string>>(`${this.endpoint}/${id}/image`, formData);
  }

  removeEmployeeImage(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(`${this.endpoint}/${id}/image`);
  }

  checkCodeExists(code: string): Observable<ApiResponse<boolean>> {
    return this.apiService.get<ApiResponse<boolean>>(`${this.endpoint}/exists/code/${code}`);
  }
}