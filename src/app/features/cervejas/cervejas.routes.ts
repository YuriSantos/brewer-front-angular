import { Routes } from '@angular/router';

export const CERVEJAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cerveja-list/cerveja-list.component')
      .then(m => m.CervejaListComponent)
  },
  {
    path: 'nova',
    loadComponent: () => import('./cerveja-form/cerveja-form.component')
      .then(m => m.CervejaFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./cerveja-form/cerveja-form.component')
      .then(m => m.CervejaFormComponent)
  }
];
