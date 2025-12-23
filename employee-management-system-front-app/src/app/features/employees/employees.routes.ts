import { Routes } from '@angular/router';

export const EMPLOYEES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/employees-page/employees-page.component')
        .then(m => m.EmployeesPageComponent),
    children: [
      {
        path: 'employeesList',
        loadComponent: () =>
          import('./pages/employee-list/employee-list.component')
            .then(m => m.EmployeeListComponent)
      },
      {
        path: '',
        redirectTo: 'employeesList',
        pathMatch: 'full'
      }
    ]
  }
];
