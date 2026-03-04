import { Routes } from '@angular/router';

export const ESTILOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./estilo-list/estilo-list.component')
      .then(m => m.EstiloListComponent)
  }
];
