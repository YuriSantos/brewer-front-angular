import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'cervejas',
        loadChildren: () => import('./features/cervejas/cervejas.routes')
          .then(m => m.CERVEJAS_ROUTES)
      },
      {
        path: 'clientes',
        loadChildren: () => import('./features/clientes/clientes.routes')
          .then(m => m.CLIENTES_ROUTES)
      },
      {
        path: 'vendas',
        loadChildren: () => import('./features/vendas/vendas.routes')
          .then(m => m.VENDAS_ROUTES)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./features/usuarios/usuarios.routes')
          .then(m => m.USUARIOS_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['CADASTRAR_USUARIO'] }
      },
      {
        path: 'estilos',
        loadChildren: () => import('./features/estilos/estilos.routes')
          .then(m => m.ESTILOS_ROUTES)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
