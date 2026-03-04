import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstiloService } from '../services/estilo.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Estilo } from '../../cervejas/models/cerveja.model';

@Component({
  selector: 'app-estilo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Estilos de Cerveja</h1>
      <button class="btn btn-primary" (click)="abrirModal()">Novo Estilo</button>
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Nome</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          @for (estilo of estilos(); track estilo.codigo) {
            <tr>
              <td>{{ estilo.codigo }}</td>
              <td>{{ estilo.nome }}</td>
              <td>
                <button class="btn btn-sm btn-link" (click)="editar(estilo)">Editar</button>
                <button class="btn btn-sm btn-danger" (click)="excluir(estilo)">Excluir</button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="3" class="text-center">Nenhum estilo encontrado</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (modalAberto()) {
      <div class="modal-overlay" (click)="fecharModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ estiloSelecionado()?.codigo ? 'Editar' : 'Novo' }} Estilo</h2>
          <div class="form-group">
            <label>Nome</label>
            <input type="text" [(ngModel)]="nomeEstilo" class="form-control">
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" (click)="salvar()" [disabled]="!nomeEstilo">Salvar</button>
            <button class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      h1 { margin: 0; color: #333; }
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #eee;
      }

      th { background: #f8f9fa; font-weight: 600; }
      tr:hover td { background: #f8f9fa; }
      .text-center { text-align: center; color: #666; }
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
      &.btn-secondary { background: #6c757d; color: white; }
      &.btn-danger { background: #dc3545; color: white; }
      &.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.85rem; }
      &.btn-link { background: transparent; color: #667eea; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      width: 100%;
      max-width: 400px;

      h2 { margin: 0 0 1rem; }
    }

    .form-group {
      margin-bottom: 1rem;

      label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
      .form-control {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
      }
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
  `]
})
export class EstiloListComponent implements OnInit {
  private estiloService = inject(EstiloService);
  private notification = inject(NotificationService);
  private confirmService = inject(ConfirmService);

  estilos = signal<Estilo[]>([]);
  modalAberto = signal(false);
  estiloSelecionado = signal<Estilo | null>(null);
  nomeEstilo = '';

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.estiloService.listarTodos().subscribe(data => this.estilos.set(data));
  }

  abrirModal(): void {
    this.estiloSelecionado.set(null);
    this.nomeEstilo = '';
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
  }

  editar(estilo: Estilo): void {
    this.estiloSelecionado.set(estilo);
    this.nomeEstilo = estilo.nome;
    this.modalAberto.set(true);
  }

  salvar(): void {
    const estilo = this.estiloSelecionado();
    const operation = estilo?.codigo
      ? this.estiloService.atualizar(estilo.codigo, { nome: this.nomeEstilo })
      : this.estiloService.criar({ nome: this.nomeEstilo });

    operation.subscribe({
      next: () => {
        this.notification.success('Estilo salvo com sucesso!');
        this.fecharModal();
        this.carregar();
      },
      error: (err) => this.notification.error(err.error?.message || 'Erro ao salvar')
    });
  }

  async excluir(estilo: Estilo): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Excluir Estilo',
      message: `Deseja excluir o estilo "${estilo.nome}"?`,
      confirmText: 'Excluir',
      type: 'danger'
    });
    if (confirmed) {
      this.estiloService.excluir(estilo.codigo).subscribe({
        next: () => {
          this.notification.success('Estilo excluido com sucesso!');
          this.carregar();
        },
        error: (err) => this.notification.error(err.error?.message || 'Erro ao excluir')
      });
    }
  }
}
