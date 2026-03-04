import { Routes } from '@angular/router';

export const VENDAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./venda-list/venda-list.component')
      .then(m => m.VendaListComponent)
  },
  {
    path: 'nova',
    loadComponent: () => import('./venda-form/venda-form.component')
      .then(m => m.VendaFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./venda-form/venda-form.component')
      .then(m => m.VendaFormComponent)
  }
];
