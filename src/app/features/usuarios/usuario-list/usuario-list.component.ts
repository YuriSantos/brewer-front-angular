import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { Usuario, UsuarioFilter, Grupo } from '../models/usuario.model';
import { Page } from '../../../core/models/page.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-header">
      <h1>Usuarios</h1>
      <a routerLink="novo" class="btn btn-primary">Novo Usuario</a>
    </div>

    <div class="filter-container">
      <form (ngSubmit)="search()" class="filter-form">
        <div class="form-group">
          <label for="nome">Nome</label>
          <input type="text" id="nome" [(ngModel)]="filter.nome" name="nome" placeholder="Nome do usuario">
        </div>
        <div class="form-group">
          <label for="email">E-mail</label>
          <input type="text" id="email" [(ngModel)]="filter.email" name="email" placeholder="E-mail">
        </div>
        <div class="form-group">
          <label for="grupo">Grupo</label>
          <select id="grupo" [(ngModel)]="selectedGrupoId" name="grupo">
            <option [ngValue]="null">Todos</option>
            @for (grupo of grupos(); track grupo.id) {
              <option [ngValue]="grupo.id">{{ grupo.nome }}</option>
            }
          </select>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Pesquisar</button>
          <button type="button" class="btn btn-secondary" (click)="clearFilter()">Limpar</button>
        </div>
      </form>
    </div>

    @if (selectedIds().length > 0) {
      <div class="bulk-actions">
        <span>{{ selectedIds().length }} usuario(s) selecionado(s)</span>
        <button class="btn btn-success btn-sm" (click)="activateSelected()">Ativar</button>
        <button class="btn btn-warning btn-sm" (click)="deactivateSelected()">Desativar</button>
      </div>
    }

    <div class="table-container">
      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (usuarios().length === 0) {
        <p class="text-center">Nenhum usuario encontrado.</p>
      } @else {
        <table class="table">
          <thead>
            <tr>
              <th class="checkbox-col">
                <input type="checkbox" [checked]="allSelected()" (change)="toggleSelectAll()">
              </th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Grupos</th>
              <th>Status</th>
              <th class="actions">Acoes</th>
            </tr>
          </thead>
          <tbody>
            @for (usuario of usuarios(); track usuario.id) {
              <tr>
                <td class="checkbox-col">
                  <input type="checkbox" [checked]="isSelected(usuario.id)" (change)="toggleSelect(usuario.id)">
                </td>
                <td>{{ usuario.nome }}</td>
                <td>{{ usuario.email }}</td>
                <td>{{ getGruposNomes(usuario) }}</td>
                <td>
                  <span class="badge" [class.ativo]="usuario.ativo" [class.inativo]="!usuario.ativo">
                    {{ usuario.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="[usuario.id]" class="btn btn-sm btn-info">Editar</a>
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (page()) {
          <div class="pagination">
            <button
              class="btn btn-sm"
              [disabled]="page()!.first"
              (click)="goToPage(currentPage() - 1)">
              Anterior
            </button>
            <span>Pagina {{ currentPage() + 1 }} de {{ page()!.totalPages }}</span>
            <button
              class="btn btn-sm"
              [disabled]="page()!.last"
              (click)="goToPage(currentPage() + 1)">
              Proxima
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      h1 { margin: 0; color: #333; }
    }
    .filter-container {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
    }
    .filter-form {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: flex-end;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 200px;
      label { font-weight: 500; color: #555; font-size: 0.875rem; }
      input, select {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        &:focus { outline: none; border-color: #667eea; }
      }
    }
    .form-actions {
      display: flex;
      gap: 0.5rem;
    }
    .bulk-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #e3f2fd;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      span { color: #1565c0; font-weight: 500; }
    }
    .table-container {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      th, td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      th { background: #f8f9fa; font-weight: 600; color: #555; }
      tbody tr:hover { background: #f8f9fa; }
      .checkbox-col { width: 40px; text-align: center; }
      .actions { text-align: right; white-space: nowrap; }
    }
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      &.ativo { background: #28a745; }
      &.inativo { background: #dc3545; }
    }
    .loading, .text-center { text-align: center; color: #666; padding: 2rem; }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      span { color: #666; }
    }
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      font-size: 0.875rem;
      &.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
      &.btn-secondary { background: #6c757d; color: white; }
      &.btn-info { background: #17a2b8; color: white; }
      &.btn-success { background: #28a745; color: white; }
      &.btn-warning { background: #ffc107; color: #333; }
      &.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  `]
})
export class UsuarioListComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private notificationService = inject(NotificationService);

  usuarios = signal<Usuario[]>([]);
  grupos = signal<Grupo[]>([]);
  page = signal<Page<Usuario> | null>(null);
  currentPage = signal(0);
  loading = signal(false);
  selectedIds = signal<number[]>([]);

  filter: UsuarioFilter = {};
  selectedGrupoId: number | null = null;

  ngOnInit(): void {
    this.loadGrupos();
    this.loadUsuarios();
  }

  loadGrupos(): void {
    this.usuarioService.getGrupos().subscribe({
      next: (grupos) => this.grupos.set(grupos),
      error: () => this.notificationService.error('Erro ao carregar grupos')
    });
  }

  loadUsuarios(): void {
    this.loading.set(true);
    const searchFilter: UsuarioFilter = {
      ...this.filter,
      gruposIds: this.selectedGrupoId ? [this.selectedGrupoId] : undefined
    };

    this.usuarioService.list(searchFilter, this.currentPage()).subscribe({
      next: (page) => {
        this.usuarios.set(page.content);
        this.page.set(page);
        this.selectedIds.set([]);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Erro ao carregar usuarios');
        this.loading.set(false);
      }
    });
  }

  search(): void {
    this.currentPage.set(0);
    this.loadUsuarios();
  }

  clearFilter(): void {
    this.filter = {};
    this.selectedGrupoId = null;
    this.search();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadUsuarios();
  }

  getGruposNomes(usuario: Usuario): string {
    return usuario.grupos.map(g => g.nome).join(', ') || '-';
  }

  isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  toggleSelect(id: number): void {
    const current = this.selectedIds();
    if (current.includes(id)) {
      this.selectedIds.set(current.filter(i => i !== id));
    } else {
      this.selectedIds.set([...current, id]);
    }
  }

  allSelected(): boolean {
    return this.usuarios().length > 0 && this.selectedIds().length === this.usuarios().length;
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set([]);
    } else {
      this.selectedIds.set(this.usuarios().map(u => u.id));
    }
  }

  activateSelected(): void {
    if (this.selectedIds().length === 0) return;
    this.usuarioService.updateStatus(this.selectedIds(), true).subscribe({
      next: () => {
        this.notificationService.success('Usuarios ativados com sucesso');
        this.loadUsuarios();
      },
      error: () => this.notificationService.error('Erro ao ativar usuarios')
    });
  }

  deactivateSelected(): void {
    if (this.selectedIds().length === 0) return;
    this.usuarioService.updateStatus(this.selectedIds(), false).subscribe({
      next: () => {
        this.notificationService.success('Usuarios desativados com sucesso');
        this.loadUsuarios();
      },
      error: () => this.notificationService.error('Erro ao desativar usuarios')
    });
  }
}
