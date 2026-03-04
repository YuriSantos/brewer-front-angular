import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cliente-list/cliente-list.component')
      .then(m => m.ClienteListComponent)
  },
  {
    path: 'novo',
    loadComponent: () => import('./cliente-form/cliente-form.component')
      .then(m => m.ClienteFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./cliente-form/cliente-form.component')
      .then(m => m.ClienteFormComponent)
  }
];
