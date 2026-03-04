import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../services/cliente.service';
import { Cliente, ClienteRequest, Estado, Cidade, TipoPessoa, CepResponse } from '../models/cliente.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1>{{ isEdit() ? 'Editar Cliente' : 'Novo Cliente' }}</h1>
    </div>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-section">
          <h3>Dados Pessoais</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="tipoPessoa">Tipo Pessoa *</label>
              <select id="tipoPessoa" formControlName="tipoPessoa" (change)="onTipoPessoaChange()">
                <option value="FISICA">Pessoa Fisica</option>
                <option value="JURIDICA">Pessoa Juridica</option>
              </select>
            </div>
            <div class="form-group flex-2">
              <label for="nome">{{ form.get('tipoPessoa')?.value === 'FISICA' ? 'Nome *' : 'Razao Social *' }}</label>
              <input type="text" id="nome" formControlName="nome">
              @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
                <span class="error">Campo obrigatorio</span>
              }
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="cpfCnpj">{{ form.get('tipoPessoa')?.value === 'FISICA' ? 'CPF *' : 'CNPJ *' }}</label>
              <input type="text" id="cpfCnpj" formControlName="cpfCnpj"
                     [placeholder]="form.get('tipoPessoa')?.value === 'FISICA' ? '000.000.000-00' : '00.000.000/0000-00'">
              @if (form.get('cpfCnpj')?.invalid && form.get('cpfCnpj')?.touched) {
                <span class="error">Campo obrigatorio</span>
              }
            </div>
            <div class="form-group">
              <label for="telefone">Telefone</label>
              <input type="text" id="telefone" formControlName="telefone" placeholder="(00) 00000-0000">
            </div>
            <div class="form-group flex-2">
              <label for="email">E-mail *</label>
              <input type="email" id="email" formControlName="email">
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <span class="error">E-mail invalido</span>
              }
            </div>
          </div>
        </div>

        <div class="form-section" formGroupName="endereco">
          <h3>Endereco</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="cep">CEP</label>
              <input type="text" id="cep" formControlName="cep" placeholder="00000-000"
                     (blur)="buscarCep()">
              @if (buscandoCep()) {
                <small class="info">Buscando CEP...</small>
              }
            </div>
            <div class="form-group flex-3">
              <label for="logradouro">Logradouro</label>
              <input type="text" id="logradouro" formControlName="logradouro">
            </div>
            <div class="form-group">
              <label for="numero">Numero</label>
              <input type="text" id="numero" formControlName="numero">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-2">
              <label for="complemento">Complemento</label>
              <input type="text" id="complemento" formControlName="complemento">
            </div>
            <div class="form-group">
              <label for="estado">Estado</label>
              <select id="estado" formControlName="estadoId" (change)="onEstadoChange()">
                <option [ngValue]="null">Selecione...</option>
                @for (estado of estados(); track estado.codigo) {
                  <option [ngValue]="estado.codigo">{{ estado.nome }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label for="cidade">Cidade</label>
              <select id="cidade" formControlName="cidadeId">
                <option [ngValue]="null">Selecione...</option>
                @for (cidade of cidades(); track cidade.codigo) {
                  <option [ngValue]="cidade.codigo">{{ cidade.nome }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
          <a routerLink="/clientes" class="btn btn-secondary">Cancelar</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; h1 { margin: 0; color: #333; } }
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
      input, select {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        &:focus { outline: none; border-color: #667eea; }
        &.ng-invalid.ng-touched { border-color: #dc3545; }
      }
      .error { color: #dc3545; font-size: 0.75rem; }
      .info { color: #667eea; font-size: 0.75rem; }
    }
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
    }
  `]
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = signal(false);
  saving = signal(false);
  buscandoCep = signal(false);
  estados = signal<Estado[]>([]);
  cidades = signal<Cidade[]>([]);
  private clienteId: number | null = null;

  form: FormGroup = this.fb.group({
    tipoPessoa: ['FISICA' as TipoPessoa],
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpfCnpj: ['', Validators.required],
    telefone: [''],
    email: ['', [Validators.required, Validators.email]],
    endereco: this.fb.group({
      logradouro: [''],
      numero: [''],
      complemento: [''],
      cep: [''],
      estadoId: [null as number | null],
      cidadeId: [null as number | null]
    })
  });

  ngOnInit(): void {
    this.loadEstados();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clienteId = +id;
      this.isEdit.set(true);
      this.loadCliente(this.clienteId);
    }
  }

  loadEstados(): void {
    this.clienteService.getEstados().subscribe({
      next: (estados) => this.estados.set(estados),
      error: (err) => this.notificationService.error(err.error?.message || 'Erro ao carregar estados')
    });
  }

  loadCliente(id: number): void {
    this.clienteService.getById(id).subscribe({
      next: (cliente) => {
        this.form.patchValue({
          tipoPessoa: cliente.tipoPessoa,
          nome: cliente.nome,
          cpfCnpj: cliente.cpfCnpj,
          telefone: cliente.telefone,
          email: cliente.email
        });

        if (cliente.endereco) {
          const estadoId = cliente.endereco.cidade?.estado?.codigo;
          this.form.get('endereco')?.patchValue({
            logradouro: cliente.endereco.logradouro,
            numero: cliente.endereco.numero,
            complemento: cliente.endereco.complemento,
            cep: cliente.endereco.cep,
            estadoId: estadoId
          });

          if (estadoId) {
            this.clienteService.getCidadesByEstado(estadoId).subscribe({
              next: (cidades) => {
                this.cidades.set(cidades);
                this.form.get('endereco.cidadeId')?.setValue(cliente.endereco?.cidade?.codigo);
              }
            });
          }
        }
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Erro ao carregar cliente');
        this.router.navigate(['/clientes']);
      }
    });
  }

  onTipoPessoaChange(): void {
    this.form.get('cpfCnpj')?.setValue('');
  }

  buscarCep(): void {
    const cepRaw = this.form.get('endereco.cep')?.value?.replace(/\D/g, '');
    if (!cepRaw || cepRaw.length !== 8) return;

    this.buscandoCep.set(true);
    this.clienteService.buscarCep(cepRaw).subscribe({
      next: (resp: CepResponse) => {
        this.form.get('endereco')?.patchValue({
          logradouro: resp.logradouro,
          complemento: resp.complemento,
          estadoId: resp.estadoId
        });

        this.clienteService.getCidadesByEstado(resp.estadoId).subscribe({
          next: (cidades) => {
            this.cidades.set(cidades);
            this.form.get('endereco.cidadeId')?.setValue(resp.cidadeId);
            this.buscandoCep.set(false);
          },
          error: () => this.buscandoCep.set(false)
        });
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'CEP nao encontrado');
        this.buscandoCep.set(false);
      }
    });
  }

  onEstadoChange(): void {
    const estadoId = this.form.get('endereco.estadoId')?.value;
    this.form.get('endereco.cidadeId')?.setValue(null);
    this.cidades.set([]);

    if (estadoId) {
      this.clienteService.getCidadesByEstado(estadoId).subscribe({
        next: (cidades) => this.cidades.set(cidades),
        error: (err) => this.notificationService.error(err.error?.message || 'Erro ao carregar cidades')
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const formValue = this.form.value;

    const request: ClienteRequest = {
      tipoPessoa: formValue.tipoPessoa,
      nome: formValue.nome,
      cpfCnpj: formValue.cpfCnpj.replace(/\D/g, ''),
      telefone: formValue.telefone,
      email: formValue.email,
      endereco: {
        logradouro: formValue.endereco.logradouro,
        numero: formValue.endereco.numero,
        complemento: formValue.endereco.complemento,
        cep: formValue.endereco.cep?.replace(/\D/g, ''),
        cidadeId: formValue.endereco.cidadeId
      }
    };

    const operation = this.isEdit()
      ? this.clienteService.update(this.clienteId!, request)
      : this.clienteService.create(request);

    operation.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEdit() ? 'Cliente atualizado com sucesso' : 'Cliente criado com sucesso'
        );
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Erro ao salvar cliente');
        this.saving.set(false);
      }
    });
  }
}
