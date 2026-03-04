import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../services/cliente.service';
import { Cliente, ClienteFilter } from '../models/cliente.model';
import { Page } from '../../../core/models/page.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-header">
      <h1>Clientes</h1>
      <a routerLink="novo" class="btn btn-primary">Novo Cliente</a>
    </div>

    <div class="filter-container">
      <form (ngSubmit)="search()" class="filter-form">
        <div class="form-group">
          <label for="nome">Nome</label>
          <input type="text" id="nome" [(ngModel)]="filter.nome" name="nome" placeholder="Nome do cliente">
        </div>
        <div class="form-group">
          <label for="cpfCnpj">CPF/CNPJ</label>
          <input type="text" id="cpfCnpj" [(ngModel)]="filter.cpfCnpj" name="cpfCnpj" placeholder="CPF ou CNPJ">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Pesquisar</button>
          <button type="button" class="btn btn-secondary" (click)="clearFilter()">Limpar</button>
        </div>
      </form>
    </div>

    <div class="table-container">
      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (clientes().length === 0) {
        <p class="text-center">Nenhum cliente encontrado.</p>
      } @else {
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF/CNPJ</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Cidade/UF</th>
              <th class="actions">Acoes</th>
            </tr>
          </thead>
          <tbody>
            @for (cliente of clientes(); track cliente.id) {
              <tr>
                <td>{{ cliente.nome }}</td>
                <td>{{ formatCpfCnpj(cliente.cpfCnpj) }}</td>
                <td>{{ cliente.email }}</td>
                <td>{{ cliente.telefone || '-' }}</td>
                <td>{{ getCidadeUf(cliente) }}</td>
                <td class="actions">
                  <a [routerLink]="[cliente.id]" class="btn btn-sm btn-info">Editar</a>
                  <button class="btn btn-sm btn-danger" (click)="confirmDelete(cliente)">Excluir</button>
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
      input {
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
      .actions { text-align: right; white-space: nowrap; }
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
      &.btn-danger { background: #dc3545; color: white; }
      &.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  `]
})
export class ClienteListComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private notificationService = inject(NotificationService);

  clientes = signal<Cliente[]>([]);
  page = signal<Page<Cliente> | null>(null);
  currentPage = signal(0);
  loading = signal(false);
  filter: ClienteFilter = {};

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.loading.set(true);
    this.clienteService.list(this.filter, this.currentPage()).subscribe({
      next: (page) => {
        this.clientes.set(page.content);
        this.page.set(page);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Erro ao carregar clientes');
        this.loading.set(false);
      }
    });
  }

  search(): void {
    this.currentPage.set(0);
    this.loadClientes();
  }

  clearFilter(): void {
    this.filter = {};
    this.search();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadClientes();
  }

  confirmDelete(cliente: Cliente): void {
    if (confirm(`Deseja realmente excluir o cliente "${cliente.nome}"?`)) {
      this.clienteService.delete(cliente.id).subscribe({
        next: () => {
          this.notificationService.success('Cliente excluido com sucesso');
          this.loadClientes();
        },
        error: () => {
          this.notificationService.error('Erro ao excluir cliente');
        }
      });
    }
  }

  formatCpfCnpj(value: string): string {
    if (!value) return '-';
    const digits = value.replace(/\D/g, '');
    if (digits.length === 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (digits.length === 14) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  }

  getCidadeUf(cliente: Cliente): string {
    if (cliente.endereco?.cidade) {
      const cidade = cliente.endereco.cidade;
      return `${cidade.nome}/${cidade.estado?.sigla || ''}`;
    }
    return '-';
  }
}
