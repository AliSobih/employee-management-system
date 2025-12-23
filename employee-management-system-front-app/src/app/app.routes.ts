import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/departments/departments.routes').then((m) => m.DEPARTMENTS_ROUTES),
  },
  {
    path: 'employees',
    loadChildren: () =>
      import('./features/employees/employees.routes').then((m) => m.EMPLOYEES_ROUTES),
  }
];
