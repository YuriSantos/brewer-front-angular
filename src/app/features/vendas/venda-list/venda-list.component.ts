import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VendaService } from '../services/venda.service';
import { Venda, VendaFilter, StatusVenda, STATUS_VENDA_LABELS, STATUS_VENDA_COLORS } from '../models/venda.model';
import { Page } from '../../../core/models/page.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-venda-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="page-header">
      <h1>Vendas</h1>
      <a routerLink="nova" class="btn btn-primary">Nova Venda</a>
    </div>

    <div class="filter-container">
      <form (ngSubmit)="search()" class="filter-form">
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" [(ngModel)]="filter.status" name="status">
            <option [ngValue]="undefined">Todos</option>
            <option value="ORCAMENTO">Orcamento</option>
            <option value="EMITIDA">Emitida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
        <div class="form-group">
          <label for="clienteNome">Cliente</label>
          <input type="text" id="clienteNome" [(ngModel)]="filter.clienteNome" name="clienteNome" placeholder="Nome do cliente">
        </div>
        <div class="form-group">
          <label for="dataInicio">Data Inicio</label>
          <input type="date" id="dataInicio" [(ngModel)]="filter.dataInicio" name="dataInicio">
        </div>
        <div class="form-group">
          <label for="dataFim">Data Fim</label>
          <input type="date" id="dataFim" [(ngModel)]="filter.dataFim" name="dataFim">
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
      } @else if (vendas().length === 0) {
        <p class="text-center">Nenhuma venda encontrada.</p>
      } @else {
        <table class="table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Data</th>
              <th>Cliente</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th class="actions">Acoes</th>
            </tr>
          </thead>
          <tbody>
            @for (venda of vendas(); track venda.id) {
              <tr>
                <td>#{{ venda.id }}</td>
                <td>{{ venda.dataCriacao | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ venda.cliente.nome }}</td>
                <td>{{ venda.valorTotal | currency:'BRL':'symbol':'1.2-2' }}</td>
                <td>
                  <span class="badge" [style.background]="getStatusColor(venda.status)">
                    {{ getStatusLabel(venda.status) }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="[venda.id]" class="btn btn-sm btn-info">Ver</a>
                  @if (venda.status === 'ORCAMENTO') {
                    <button class="btn btn-sm btn-success" (click)="emitir(venda)">Emitir</button>
                    <button class="btn btn-sm btn-danger" (click)="cancelar(venda)">Cancelar</button>
                  }
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
      min-width: 150px;
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
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
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
      &.btn-danger { background: #dc3545; color: white; }
      &.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  `]
})
export class VendaListComponent implements OnInit {
  private vendaService = inject(VendaService);
  private notificationService = inject(NotificationService);
  private confirmService = inject(ConfirmService);

  vendas = signal<Venda[]>([]);
  page = signal<Page<Venda> | null>(null);
  currentPage = signal(0);
  loading = signal(false);
  filter: VendaFilter = {};

  ngOnInit(): void {
    this.loadVendas();
  }

  loadVendas(): void {
    this.loading.set(true);
    this.vendaService.list(this.filter, this.currentPage()).subscribe({
      next: (page) => {
        this.vendas.set(page.content);
        this.page.set(page);
        this.loading.set(false);
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Erro ao carregar vendas');
        this.loading.set(false);
      }
    });
  }

  search(): void {
    this.currentPage.set(0);
    this.loadVendas();
  }

  clearFilter(): void {
    this.filter = {};
    this.search();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadVendas();
  }

  getStatusLabel(status: StatusVenda): string {
    return STATUS_VENDA_LABELS[status];
  }

  getStatusColor(status: StatusVenda): string {
    return STATUS_VENDA_COLORS[status];
  }

  async emitir(venda: Venda): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Emitir Venda',
      message: `Deseja realmente emitir a venda #${venda.id}?`,
      confirmText: 'Emitir',
      type: 'warning'
    });
    if (confirmed) {
      this.vendaService.emitir(venda.id).subscribe({
        next: () => {
          this.notificationService.success('Venda emitida com sucesso');
          this.loadVendas();
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Erro ao emitir venda');
        }
      });
    }
  }

  async cancelar(venda: Venda): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Cancelar Venda',
      message: `Deseja realmente cancelar a venda #${venda.id}?`,
      confirmText: 'Cancelar Venda',
      type: 'danger'
    });
    if (confirmed) {
      this.vendaService.cancelar(venda.id).subscribe({
        next: () => {
          this.notificationService.success('Venda cancelada com sucesso');
          this.loadVendas();
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Erro ao cancelar venda');
        }
      });
    }
  }
}
