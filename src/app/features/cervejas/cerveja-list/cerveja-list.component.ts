import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CervejaService } from '../services/cerveja.service';
import { Cerveja, CervejaFilter } from '../models/cerveja.model';
import { Page } from '../../../core/models/page.model';

@Component({
  selector: 'app-cerveja-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-header">
      <h1>Cervejas</h1>
      <a routerLink="nova" class="btn btn-primary">Nova Cerveja</a>
    </div>

    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label>SKU</label>
          <input type="text" [(ngModel)]="filter.sku" placeholder="SKU">
        </div>
        <div class="filter-group">
          <label>Nome</label>
          <input type="text" [(ngModel)]="filter.nome" placeholder="Nome">
        </div>
        <div class="filter-group">
          <button class="btn btn-secondary" (click)="pesquisar()">Pesquisar</button>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Nome</th>
            <th>Estilo</th>
            <th>Sabor</th>
            <th>Origem</th>
            <th>Valor</th>
            <th>Estoque</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          @for (cerveja of cervejas(); track cerveja.codigo) {
            <tr>
              <td>{{ cerveja.sku }}</td>
              <td>{{ cerveja.nome }}</td>
              <td>{{ cerveja.estilo.nome }}</td>
              <td>{{ cerveja.saborDescricao }}</td>
              <td>{{ cerveja.origemDescricao }}</td>
              <td>{{ formatCurrency(cerveja.valor) }}</td>
              <td>{{ cerveja.quantidadeEstoque }}</td>
              <td>
                <a [routerLink]="[cerveja.codigo]" class="btn btn-sm btn-link">Editar</a>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="8" class="text-center">Nenhuma cerveja encontrada</td>
            </tr>
          }
        </tbody>
      </table>

      @if (page()) {
        <div class="pagination">
          <button
            [disabled]="page()!.first"
            (click)="mudarPagina(page()!.page - 1)"
            class="btn btn-sm"
          >
            Anterior
          </button>
          <span>Pagina {{ page()!.page + 1 }} de {{ page()!.totalPages }}</span>
          <button
            [disabled]="page()!.last"
            (click)="mudarPagina(page()!.page + 1)"
            class="btn btn-sm"
          >
            Proxima
          </button>
        </div>
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

    .filter-card {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .filter-row {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      label {
        font-size: 0.85rem;
        color: #666;
      }

      input {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #eee;
      }

      th {
        background: #f8f9fa;
        font-weight: 600;
        color: #333;
      }

      tr:hover td {
        background: #f8f9fa;
      }

      .text-center {
        text-align: center;
        color: #666;
      }
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-top: 1px solid #eee;

      span {
        color: #666;
      }
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;

      &.btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      &.btn-secondary {
        background: #6c757d;
        color: white;
      }

      &.btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.85rem;
      }

      &.btn-link {
        background: transparent;
        color: #667eea;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  `]
})
export class CervejaListComponent implements OnInit {
  private cervejaService = inject(CervejaService);

  cervejas = signal<Cerveja[]>([]);
  page = signal<Page<Cerveja> | null>(null);
  filter: CervejaFilter = {};

  ngOnInit(): void {
    this.pesquisar();
  }

  pesquisar(pagina: number = 0): void {
    this.cervejaService.listar(this.filter, pagina).subscribe({
      next: (page) => {
        this.cervejas.set(page.content);
        this.page.set(page);
      }
    });
  }

  mudarPagina(pagina: number): void {
    this.pesquisar(pagina);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
