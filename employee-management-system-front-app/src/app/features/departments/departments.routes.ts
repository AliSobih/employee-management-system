import { Routes } from '@angular/router';

export const DEPARTMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/departments-page/departments-page.component')
        .then(m => m.DepartmentsPageComponent),
    children: [
      {
        path: 'departmentsList',
        loadComponent: () =>
          import('./pages/department-list/department-list.component')
            .then(m => m.DepartmentListComponent)
      },
      {
        path: '',
        redirectTo: 'departmentsList',
        pathMatch: 'full'
      }
    ]
  }
];
