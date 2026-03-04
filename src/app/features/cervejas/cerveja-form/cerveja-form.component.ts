import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CervejaService } from '../services/cerveja.service';
import { EstiloService } from '../../estilos/services/estilo.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Estilo, EnumOption } from '../models/cerveja.model';

@Component({
  selector: 'app-cerveja-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>{{ isEditing() ? 'Editar' : 'Nova' }} Cerveja</h1>
    </div>

    <div class="form-card">
      <form [formGroup]="form" (ngSubmit)="salvar()">
        <div class="form-row">
          <div class="form-group col-4">
            <label>SKU *</label>
            <input type="text" formControlName="sku" class="form-control">
            @if (form.get('sku')?.errors?.['required'] && form.get('sku')?.touched) {
              <small class="error">SKU e obrigatorio</small>
            }
          </div>
          <div class="form-group col-8">
            <label>Nome *</label>
            <input type="text" formControlName="nome" class="form-control">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-12">
            <label>Descricao *</label>
            <textarea formControlName="descricao" class="form-control" rows="3"></textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-3">
            <label>Valor *</label>
            <input type="number" formControlName="valor" class="form-control" step="0.01">
          </div>
          <div class="form-group col-3">
            <label>Teor Alcoolico *</label>
            <input type="number" formControlName="teorAlcoolico" class="form-control" step="0.1">
          </div>
          <div class="form-group col-3">
            <label>Comissao (%) *</label>
            <input type="number" formControlName="comissao" class="form-control" step="0.1">
          </div>
          <div class="form-group col-3">
            <label>Qtd. Estoque *</label>
            <input type="number" formControlName="quantidadeEstoque" class="form-control">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-4">
            <label>Origem *</label>
            <select formControlName="origem" class="form-control">
              <option value="">Selecione...</option>
              @for (origem of origens(); track origem.codigo) {
                <option [value]="origem.codigo">{{ origem.descricao }}</option>
              }
            </select>
          </div>
          <div class="form-group col-4">
            <label>Sabor *</label>
            <select formControlName="sabor" class="form-control">
              <option value="">Selecione...</option>
              @for (sabor of sabores(); track sabor.codigo) {
                <option [value]="sabor.codigo">{{ sabor.descricao }}</option>
              }
            </select>
          </div>
          <div class="form-group col-4">
            <label>Estilo *</label>
            <select formControlName="codigoEstilo" class="form-control">
              <option value="">Selecione...</option>
              @for (estilo of estilos(); track estilo.codigo) {
                <option [value]="estilo.codigo">{{ estilo.nome }}</option>
              }
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || salvando()">
            {{ salvando() ? 'Salvando...' : 'Salvar' }}
          </button>
          <a routerLink="/cervejas" class="btn btn-secondary">Cancelar</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 1.5rem;
      h1 { margin: 0; color: #333; }
    }

    .form-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;

      &.col-3 { flex: 0 0 calc(25% - 0.75rem); }
      &.col-4 { flex: 0 0 calc(33.333% - 0.67rem); }
      &.col-8 { flex: 0 0 calc(66.666% - 0.5rem); }
      &.col-12 { flex: 0 0 100%; }

      label {
        margin-bottom: 0.25rem;
        font-weight: 500;
        color: #333;
      }

      .form-control {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: #667eea;
        }
      }

      .error {
        color: #dc3545;
        font-size: 0.8rem;
        margin-top: 0.25rem;
      }
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .btn {
      padding: 0.5rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;

      &.btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      &.btn-secondary {
        background: #6c757d;
        color: white;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  `]
})
export class CervejaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cervejaService = inject(CervejaService);
  private estiloService = inject(EstiloService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  isEditing = signal(false);
  salvando = signal(false);
  sabores = signal<EnumOption[]>([]);
  origens = signal<EnumOption[]>([]);
  estilos = signal<Estilo[]>([]);

  ngOnInit(): void {
    this.initForm();
    this.carregarDados();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditing.set(true);
      this.carregarCerveja(+id);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      sku: ['', [Validators.required]],
      nome: ['', [Validators.required]],
      descricao: ['', [Validators.required, Validators.maxLength(50)]],
      valor: [null, [Validators.required, Validators.min(0.50)]],
      teorAlcoolico: [null, [Validators.required, Validators.max(100)]],
      comissao: [null, [Validators.required, Validators.max(100)]],
      quantidadeEstoque: [null, [Validators.required, Validators.max(9999)]],
      origem: ['', [Validators.required]],
      sabor: ['', [Validators.required]],
      codigoEstilo: [null, [Validators.required]]
    });
  }

  private carregarDados(): void {
    this.cervejaService.getSabores().subscribe(data => this.sabores.set(data));
    this.cervejaService.getOrigens().subscribe(data => this.origens.set(data));
    this.estiloService.listarTodos().subscribe(data => this.estilos.set(data));
  }

  private carregarCerveja(id: number): void {
    this.cervejaService.buscarPorId(id).subscribe({
      next: cerveja => this.form.patchValue({
        ...cerveja,
        codigoEstilo: cerveja.estilo?.codigo
      }),
      error: () => this.router.navigate(['/cervejas'])
    });
  }

  salvar(): void {
    if (this.form.invalid) return;

    this.salvando.set(true);
    const cerveja = {
      ...this.form.value,
      codigoEstilo: +this.form.value.codigoEstilo
    };
    const id = this.route.snapshot.params['id'];

    const operation = id
      ? this.cervejaService.atualizar(+id, cerveja)
      : this.cervejaService.criar(cerveja);

    operation.subscribe({
      next: () => {
        this.notification.success('Cerveja salva com sucesso!');
        this.router.navigate(['/cervejas']);
      },
      error: (error) => {
        this.notification.error(error.error?.message || 'Erro ao salvar cerveja');
        this.salvando.set(false);
      }
    });
  }
}
