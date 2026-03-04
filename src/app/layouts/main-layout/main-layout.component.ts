import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <nav class="sidebar">
        <div class="sidebar-header">
          <h2>Brewer</h2>
        </div>

        <ul class="nav-menu">
          <li>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="icon">📊</span>
              Dashboard
            </a>
          </li>
          <li>
            <a routerLink="/cervejas" routerLinkActive="active">
              <span class="icon">🍺</span>
              Cervejas
            </a>
          </li>
          <li>
            <a routerLink="/estilos" routerLinkActive="active">
              <span class="icon">🏷️</span>
              Estilos
            </a>
          </li>
          <li>
            <a routerLink="/clientes" routerLinkActive="active">
              <span class="icon">👥</span>
              Clientes
            </a>
          </li>
          <li>
            <a routerLink="/vendas" routerLinkActive="active">
              <span class="icon">🛒</span>
              Vendas
            </a>
          </li>
          @if (authService.hasRole('CADASTRAR_USUARIO')) {
            <li>
              <a routerLink="/usuarios" routerLinkActive="active">
                <span class="icon">⚙️</span>
                Usuarios
              </a>
            </li>
          }
        </ul>

        <div class="sidebar-footer">
          <div class="user-info">
            <span class="user-name">{{ authService.getUser()?.nome }}</span>
            <span class="user-email">{{ authService.getUser()?.email }}</span>
          </div>
          <button class="logout-btn" (click)="logout()">Sair</button>
        </div>
      </nav>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 250px;
      background: #1a1a2e;
      color: white;
      display: flex;
      flex-direction: column;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      h2 {
        margin: 0;
        font-size: 1.5rem;
      }
    }

    .nav-menu {
      list-style: none;
      padding: 1rem 0;
      margin: 0;
      flex: 1;

      li a {
        display: flex;
        align-items: center;
        padding: 0.75rem 1.5rem;
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        &.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .icon {
          margin-right: 0.75rem;
          font-size: 1.2rem;
        }
      }
    }

    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);

      .user-info {
        margin-bottom: 0.75rem;

        .user-name {
          display: block;
          font-weight: 500;
        }

        .user-email {
          display: block;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }
      }

      .logout-btn {
        width: 100%;
        padding: 0.5rem;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      background: #f5f5f5;
      overflow-y: auto;
    }
  `]
})
export class MainLayoutComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
