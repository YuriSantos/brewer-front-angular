import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { Usuario, UsuarioRequest, Grupo } from '../models/usuario.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1>{{ isEdit() ? 'Editar Usuario' : 'Novo Usuario' }}</h1>
    </div>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-section">
          <h3>Dados do Usuario</h3>
          <div class="form-row">
            <div class="form-group flex-2">
              <label for="nome">Nome *</label>
              <input type="text" id="nome" formControlName="nome">
              @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
                <span class="error">Campo obrigatorio (minimo 3 caracteres)</span>
              }
            </div>
            <div class="form-group">
              <label for="dataNascimento">Data de Nascimento</label>
              <input type="date" id="dataNascimento" formControlName="dataNascimento">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-2">
              <label for="email">E-mail *</label>
              <input type="email" id="email" formControlName="email">
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <span class="error">E-mail invalido</span>
              }
            </div>
            <div class="form-group">
              <label for="ativo">Status</label>
              <select id="ativo" formControlName="ativo">
                <option [ngValue]="true">Ativo</option>
                <option [ngValue]="false">Inativo</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Senha</h3>
          @if (isEdit()) {
            <p class="info">Deixe em branco para manter a senha atual.</p>
          }
          <div class="form-row">
            <div class="form-group">
              <label for="senha">{{ isEdit() ? 'Nova Senha' : 'Senha *' }}</label>
              <input type="password" id="senha" formControlName="senha">
              @if (form.get('senha')?.invalid && form.get('senha')?.touched) {
                <span class="error">Minimo 6 caracteres</span>
              }
            </div>
            <div class="form-group">
              <label for="confirmacaoSenha">Confirmacao da Senha</label>
              <input type="password" id="confirmacaoSenha" formControlName="confirmacaoSenha">
              @if (form.get('confirmacaoSenha')?.touched && !senhasConferem()) {
                <span class="error">Senhas nao conferem</span>
              }
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Grupos *</h3>
          <div class="grupos-container">
            @for (grupo of grupos(); track grupo.id) {
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  [checked]="isGrupoSelected(grupo.id)"
                  (change)="toggleGrupo(grupo.id)">
                {{ grupo.nome }}
              </label>
            }
          </div>
          @if (form.get('gruposIds')?.invalid && form.get('gruposIds')?.touched) {
            <span class="error">Selecione pelo menos um grupo</span>
          }
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || !senhasConferem() || saving()">
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
          <a routerLink="/usuarios" class="btn btn-secondary">Cancelar</a>
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
      .info {
        color: #666;
        font-size: 0.875rem;
        margin-bottom: 1rem;
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
      min-width: 200px;
      &.flex-2 { flex: 2; }
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
    }
    .grupos-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f8f9fa;
      border-radius: 4px;
      cursor: pointer;
      &:hover { background: #e9ecef; }
      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
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
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = signal(false);
  saving = signal(false);
  grupos = signal<Grupo[]>([]);
  selectedGruposIds = signal<number[]>([]);
  private usuarioId: number | null = null;

  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.minLength(6)]],
    confirmacaoSenha: [''],
    ativo: [true],
    dataNascimento: [''],
    gruposIds: [[] as number[], [Validators.required, Validators.minLength(1)]]
  });

  ngOnInit(): void {
    this.loadGrupos();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.usuarioId = +id;
      this.isEdit.set(true);
      this.loadUsuario(this.usuarioId);
      this.form.get('senha')?.clearValidators();
      this.form.get('senha')?.updateValueAndValidity();
    } else {
      this.form.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('senha')?.updateValueAndValidity();
    }
  }

  loadGrupos(): void {
    this.usuarioService.getGrupos().subscribe({
      next: (grupos) => this.grupos.set(grupos),
      error: (err) => this.notificationService.error(err.error?.message || 'Erro ao carregar grupos')
    });
  }

  loadUsuario(id: number): void {
    this.usuarioService.getById(id).subscribe({
      next: (usuario) => {
        this.form.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          ativo: usuario.ativo,
          dataNascimento: usuario.dataNascimento
        });
        const gruposIds = usuario.grupos.map(g => g.id);
        this.selectedGruposIds.set(gruposIds);
        this.form.get('gruposIds')?.setValue(gruposIds);
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Erro ao carregar usuario');
        this.router.navigate(['/usuarios']);
      }
    });
  }

  isGrupoSelected(id: number): boolean {
    return this.selectedGruposIds().includes(id);
  }

  toggleGrupo(id: number): void {
    const current = this.selectedGruposIds();
    if (current.includes(id)) {
      this.selectedGruposIds.set(current.filter(g => g !== id));
    } else {
      this.selectedGruposIds.set([...current, id]);
    }
    this.form.get('gruposIds')?.setValue(this.selectedGruposIds());
    this.form.get('gruposIds')?.markAsTouched();
  }

  senhasConferem(): boolean {
    const senha = this.form.get('senha')?.value;
    const confirmacao = this.form.get('confirmacaoSenha')?.value;
    if (!senha && !confirmacao) return true;
    return senha === confirmacao;
  }

  save(): void {
    if (this.form.invalid || !this.senhasConferem()) return;

    this.saving.set(true);
    const formValue = this.form.value;

    const request: UsuarioRequest = {
      nome: formValue.nome,
      email: formValue.email,
      ativo: formValue.ativo,
      dataNascimento: formValue.dataNascimento || undefined,
      gruposIds: this.selectedGruposIds()
    };

    if (formValue.senha) {
      request.senha = formValue.senha;
      request.confirmacaoSenha = formValue.confirmacaoSenha;
    }

    const operation = this.isEdit()
      ? this.usuarioService.update(this.usuarioId!, request)
      : this.usuarioService.create(request);

    operation.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEdit() ? 'Usuario atualizado com sucesso' : 'Usuario criado com sucesso'
        );
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Erro ao salvar usuario');
        this.saving.set(false);
      }
    });
  }
}
