import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap, of, Subscription } from 'rxjs';
import { VendaService } from '../services/venda.service';
import { Venda, VendaRequest, ItemVenda, ItemVendaRequest, STATUS_VENDA_LABELS, STATUS_VENDA_COLORS } from '../models/venda.model';
import { ClienteService } from '../../clientes/services/cliente.service';
import { CervejaService } from '../../cervejas/services/cerveja.service';
import { Cliente } from '../../clientes/models/cliente.model';
import { Cerveja } from '../../cervejas/models/cerveja.model';
import { NotificationService } from '../../../core/services/notification.service';

interface ItemForm {
  cerveja: Cerveja | null;
  quantidade: number;
  valorUnitario: number;
}

@Component({
  selector: 'app-venda-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe],
  template: `
    <div class="page-header">
      <h1>{{ isEdit() ? 'Venda #' + vendaId : 'Nova Venda' }}</h1>
      @if (venda()?.status) {
        <span class="badge" [style.background]="getStatusColor(venda()!.status)">
          {{ getStatusLabel(venda()!.status) }}
        </span>
      }
    </div>

    <div class="form-container">
      <div class="form-section">
        <h3>Cliente</h3>
        <div class="form-row">
          <div class="form-group flex-3">
            <label for="clienteSearch">Buscar Cliente *</label>
            <div class="autocomplete">
              <input
                type="text"
                id="clienteSearch"
                [(ngModel)]="clienteSearch"
                (input)="onClienteInput()"
                placeholder="Digite pelo menos 3 caracteres"
                [disabled]="isEdit()">
              @if (clientesFound().length > 0 && !selectedCliente()) {
                <ul class="autocomplete-list">
                  @for (cliente of clientesFound(); track cliente.id) {
                    <li (click)="selectCliente(cliente)">
                      {{ cliente.nome }} - {{ formatCpfCnpj(cliente.cpfCnpj) }}
                    </li>
                  }
                </ul>
              }
            </div>
          </div>
        </div>
        @if (selectedCliente()) {
          <div class="selected-cliente">
            <strong>{{ selectedCliente()!.nome }}</strong>
            <span>{{ formatCpfCnpj(selectedCliente()!.cpfCnpj) }}</span>
            @if (!isEdit()) {
              <button type="button" class="btn btn-sm btn-secondary" (click)="clearCliente()">Alterar</button>
            }
          </div>
        }
      </div>

      <div class="form-section">
        <h3>Itens da Venda</h3>
        @if (!isEdit() || venda()?.status === 'ORCAMENTO') {
          <div class="item-form">
            <div class="form-row">
              <div class="form-group flex-3">
                <label for="cervejaSearch">Cerveja</label>
                <div class="autocomplete">
                  <input
                    type="text"
                    id="cervejaSearch"
                    [(ngModel)]="cervejaSearch"
                    (input)="onCervejaInput()"
                    placeholder="Digite pelo menos 3 caracteres">
                  @if (cervejasFound().length > 0 && !currentItem.cerveja) {
                    <ul class="autocomplete-list">
                      @for (cerveja of cervejasFound(); track cerveja.codigo) {
                        <li (click)="selectCerveja(cerveja)">
                          {{ cerveja.sku }} - {{ cerveja.nome }} ({{ cerveja.valor | currency:'BRL':'symbol':'1.2-2' }})
                        </li>
                      }
                    </ul>
                  }
                </div>
              </div>
              <div class="form-group">
                <label for="quantidade">Quantidade</label>
                <input type="number" id="quantidade" [(ngModel)]="currentItem.quantidade" min="1">
              </div>
              <div class="form-group">
                <button type="button" class="btn btn-success" (click)="addItem()" [disabled]="!currentItem.cerveja || currentItem.quantidade < 1">
                  Adicionar
                </button>
              </div>
            </div>
            @if (currentItem.cerveja) {
              <div class="selected-cerveja">
                {{ currentItem.cerveja.sku }} - {{ currentItem.cerveja.nome }}
                <span class="valor">{{ currentItem.valorUnitario | currency:'BRL':'symbol':'1.2-2' }}</span>
                <button type="button" class="btn btn-sm btn-secondary" (click)="clearCerveja()">X</button>
              </div>
            }
          </div>
        }

        @if (itens().length === 0) {
          <p class="text-center">Nenhum item adicionado.</p>
        } @else {
          <table class="table">
            <thead>
              <tr>
                <th>Cerveja</th>
                <th class="right">Qtd</th>
                <th class="right">Valor Unit.</th>
                <th class="right">Subtotal</th>
                @if (!isEdit() || venda()?.status === 'ORCAMENTO') {
                  <th></th>
                }
              </tr>
            </thead>
            <tbody>
              @for (item of itens(); track $index) {
                <tr>
                  <td>{{ item.cerveja.sku }} - {{ item.cerveja.nome }}</td>
                  <td class="right">{{ item.quantidade }}</td>
                  <td class="right">{{ item.valorUnitario | currency:'BRL':'symbol':'1.2-2' }}</td>
                  <td class="right">{{ item.quantidade * item.valorUnitario | currency:'BRL':'symbol':'1.2-2' }}</td>
                  @if (!isEdit() || venda()?.status === 'ORCAMENTO') {
                    <td>
                      <button type="button" class="btn btn-sm btn-danger" (click)="removeItem($index)">Remover</button>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <div class="form-section">
        <h3>Valores</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="valorFrete">Valor Frete</label>
            <input type="number" id="valorFrete" [(ngModel)]="valorFrete" min="0" step="0.01"
                   [disabled]="isEdit() && venda()?.status !== 'ORCAMENTO'">
          </div>
          <div class="form-group">
            <label for="valorDesconto">Valor Desconto</label>
            <input type="number" id="valorDesconto" [(ngModel)]="valorDesconto" min="0" step="0.01"
                   [disabled]="isEdit() && venda()?.status !== 'ORCAMENTO'">
          </div>
        </div>

        <div class="totais">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>{{ subtotal() | currency:'BRL':'symbol':'1.2-2' }}</span>
          </div>
          <div class="total-row">
            <span>Frete:</span>
            <span>{{ valorFrete | currency:'BRL':'symbol':'1.2-2' }}</span>
          </div>
          <div class="total-row">
            <span>Desconto:</span>
            <span>- {{ valorDesconto | currency:'BRL':'symbol':'1.2-2' }}</span>
          </div>
          <div class="total-row total">
            <span>Total:</span>
            <span>{{ total() | currency:'BRL':'symbol':'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>Observacoes</h3>
        <div class="form-group">
          <textarea id="observacao" [(ngModel)]="observacao" rows="3"
                    [disabled]="isEdit() && venda()?.status !== 'ORCAMENTO'"></textarea>
        </div>
      </div>

      <div class="form-actions">
        @if (!isEdit()) {
          <button type="button" class="btn btn-primary" (click)="save()" [disabled]="!canSave() || saving()">
            {{ saving() ? 'Salvando...' : 'Salvar Orcamento' }}
          </button>
        } @else if (venda()?.status === 'ORCAMENTO') {
          <button type="button" class="btn btn-primary" (click)="save()" [disabled]="!canSave() || saving()">
            {{ saving() ? 'Salvando...' : 'Atualizar' }}
          </button>
          <button type="button" class="btn btn-success" (click)="emitir()" [disabled]="saving()">
            Emitir Venda
          </button>
          <button type="button" class="btn btn-danger" (click)="cancelar()" [disabled]="saving()">
            Cancelar Venda
          </button>
        }
        <a routerLink="/vendas" class="btn btn-secondary">Voltar</a>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      h1 { margin: 0; color: #333; }
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      color: white;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .form-container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .form-section {
      margin-bottom: 2rem;
      h3 {
        margin: 0 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #667eea;
        color: #333;
      }
    }
    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      align-items: flex-end;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
      min-width: 150px;
      &.flex-2 { flex: 2; }
      &.flex-3 { flex: 3; }
      label { font-weight: 500; color: #555; font-size: 0.875rem; }
      input, select, textarea {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        &:focus { outline: none; border-color: #667eea; }
        &:disabled { background: #f5f5f5; }
      }
    }
    .autocomplete {
      position: relative;
      .autocomplete-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 100;
        list-style: none;
        margin: 0;
        padding: 0;
        li {
          padding: 0.5rem;
          cursor: pointer;
          &:hover { background: #f0f0f0; }
        }
      }
    }
    .selected-cliente, .selected-cerveja {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
      margin-top: 0.5rem;
      span { color: #666; }
      .valor { font-weight: 600; color: #28a745; }
    }
    .item-form {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
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
      .right { text-align: right; }
    }
    .totais {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
      .total-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
        &.total {
          font-weight: 700;
          font-size: 1.2rem;
          color: #333;
          border-bottom: none;
        }
      }
    }
    .text-center { text-align: center; color: #666; padding: 1rem; }
    .form-actions {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      font-size: 1rem;
      &.btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        &:disabled { opacity: 0.5; cursor: not-allowed; }
      }
      &.btn-secondary { background: #6c757d; color: white; }
      &.btn-success { background: #28a745; color: white; }
      &.btn-danger { background: #dc3545; color: white; }
      &.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
    }
  `]
})
export class VendaFormComponent implements OnInit, OnDestroy {
  private vendaService = inject(VendaService);
  private clienteService = inject(ClienteService);
  private cervejaService = inject(CervejaService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = signal(false);
  saving = signal(false);
  venda = signal<Venda | null>(null);
  vendaId: number | null = null;

  clienteSearch = '';
  clientesFound = signal<Cliente[]>([]);
  selectedCliente = signal<Cliente | null>(null);

  cervejaSearch = '';
  cervejasFound = signal<Cerveja[]>([]);
  currentItem: ItemForm = { cerveja: null, quantidade: 1, valorUnitario: 0 };

  private clienteSearch$ = new Subject<string>();
  private cervejaSearch$ = new Subject<string>();
  private subscriptions: Subscription[] = [];

  itens = signal<ItemVenda[]>([]);
  valorFrete = 0;
  valorDesconto = 0;
  observacao = '';

  subtotal = computed(() => {
    return this.itens().reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
  });

  total = computed(() => {
    return this.subtotal() + this.valorFrete - this.valorDesconto;
  });

  ngOnInit(): void {
    this.setupSearchSubscriptions();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vendaId = +id;
      this.isEdit.set(true);
      this.loadVenda(this.vendaId);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private setupSearchSubscriptions(): void {
    this.subscriptions.push(
      this.clienteSearch$.pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        switchMap(term => {
          if (term.length < 3) {
            return of([]);
          }
          return this.clienteService.search(term);
        })
      ).subscribe({
        next: clientes => this.clientesFound.set(clientes),
        error: () => this.clientesFound.set([])
      }),

      this.cervejaSearch$.pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        switchMap(term => {
          if (term.length < 3) {
            return of([]);
          }
          return this.cervejaService.pesquisar(term);
        })
      ).subscribe({
        next: (cervejas: Cerveja[]) => this.cervejasFound.set(cervejas),
        error: () => this.cervejasFound.set([])
      })
    );
  }

  loadVenda(id: number): void {
    this.vendaService.getById(id).subscribe({
      next: (venda) => {
        this.venda.set(venda);
        this.selectedCliente.set(venda.cliente);
        this.clienteSearch = venda.cliente.nome;
        this.itens.set(venda.itens);
        this.valorFrete = venda.valorFrete || 0;
        this.valorDesconto = venda.valorDesconto || 0;
        this.observacao = venda.observacao || '';
      },
      error: () => {
        this.notificationService.error('Erro ao carregar venda');
        this.router.navigate(['/vendas']);
      }
    });
  }

  onClienteInput(): void {
    this.clienteSearch$.next(this.clienteSearch);
    if (this.clienteSearch.length < 3) {
      this.clientesFound.set([]);
    }
  }

  selectCliente(cliente: Cliente): void {
    this.selectedCliente.set(cliente);
    this.clienteSearch = cliente.nome;
    this.clientesFound.set([]);
  }

  clearCliente(): void {
    this.selectedCliente.set(null);
    this.clienteSearch = '';
  }

  onCervejaInput(): void {
    this.cervejaSearch$.next(this.cervejaSearch);
    if (this.cervejaSearch.length < 3) {
      this.cervejasFound.set([]);
    }
  }

  selectCerveja(cerveja: Cerveja): void {
    this.currentItem.cerveja = cerveja;
    this.currentItem.valorUnitario = cerveja.valor;
    this.cervejaSearch = `${cerveja.sku} - ${cerveja.nome}`;
    this.cervejasFound.set([]);
  }

  clearCerveja(): void {
    this.currentItem.cerveja = null;
    this.currentItem.valorUnitario = 0;
    this.cervejaSearch = '';
  }

  addItem(): void {
    if (!this.currentItem.cerveja || this.currentItem.quantidade < 1) return;

    const existingIndex = this.itens().findIndex(i => i.cerveja.id === this.currentItem.cerveja!.codigo);
    if (existingIndex >= 0) {
      const updatedItens = [...this.itens()];
      updatedItens[existingIndex].quantidade += this.currentItem.quantidade;
      this.itens.set(updatedItens);
    } else {
      const newItem: ItemVenda = {
        quantidade: this.currentItem.quantidade,
        valorUnitario: this.currentItem.valorUnitario,
        cerveja: {
          id: this.currentItem.cerveja.codigo,
          sku: this.currentItem.cerveja.sku,
          nome: this.currentItem.cerveja.nome,
          foto: this.currentItem.cerveja.foto
        }
      };
      this.itens.set([...this.itens(), newItem]);
    }

    this.currentItem = { cerveja: null, quantidade: 1, valorUnitario: 0 };
    this.cervejaSearch = '';
  }

  removeItem(index: number): void {
    const updatedItens = [...this.itens()];
    updatedItens.splice(index, 1);
    this.itens.set(updatedItens);
  }

  canSave(): boolean {
    return !!this.selectedCliente() && this.itens().length > 0;
  }

  save(): void {
    if (!this.canSave()) return;

    this.saving.set(true);
    const request: VendaRequest = {
      clienteId: this.selectedCliente()!.id,
      valorFrete: this.valorFrete,
      valorDesconto: this.valorDesconto,
      observacao: this.observacao,
      itens: this.itens().map(item => ({
        cervejaId: item.cerveja.id,
        quantidade: item.quantidade
      }))
    };

    const operation = this.isEdit()
      ? this.vendaService.update(this.vendaId!, request)
      : this.vendaService.create(request);

    operation.subscribe({
      next: (venda) => {
        this.notificationService.success(
          this.isEdit() ? 'Venda atualizada com sucesso' : 'Orcamento criado com sucesso'
        );
        if (!this.isEdit()) {
          this.router.navigate(['/vendas', venda.id]);
        } else {
          this.loadVenda(this.vendaId!);
        }
        this.saving.set(false);
      },
      error: () => {
        this.notificationService.error('Erro ao salvar venda');
        this.saving.set(false);
      }
    });
  }

  emitir(): void {
    if (confirm('Deseja realmente emitir esta venda?')) {
      this.saving.set(true);
      this.vendaService.emitir(this.vendaId!).subscribe({
        next: () => {
          this.notificationService.success('Venda emitida com sucesso');
          this.loadVenda(this.vendaId!);
          this.saving.set(false);
        },
        error: () => {
          this.notificationService.error('Erro ao emitir venda');
          this.saving.set(false);
        }
      });
    }
  }

  cancelar(): void {
    if (confirm('Deseja realmente cancelar esta venda?')) {
      this.saving.set(true);
      this.vendaService.cancelar(this.vendaId!).subscribe({
        next: () => {
          this.notificationService.success('Venda cancelada com sucesso');
          this.loadVenda(this.vendaId!);
          this.saving.set(false);
        },
        error: () => {
          this.notificationService.error('Erro ao cancelar venda');
          this.saving.set(false);
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

  getStatusLabel(status: string): string {
    return STATUS_VENDA_LABELS[status as keyof typeof STATUS_VENDA_LABELS] || status;
  }

  getStatusColor(status: string): string {
    return STATUS_VENDA_COLORS[status as keyof typeof STATUS_VENDA_COLORS] || '#6c757d';
  }
}
