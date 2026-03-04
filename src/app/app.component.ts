import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './core/services/notification.service';
import { ConfirmService } from './core/services/confirm.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="toast-container">
      @for (n of notificationService.notifications$(); track n.id) {
        <div class="toast" [class]="'toast-' + n.type" (click)="notificationService.remove(n.id)">
          <span class="toast-icon">
            @switch (n.type) {
              @case ('success') { ✅ }
              @case ('error') { ❌ }
              @case ('warning') { ⚠️ }
              @case ('info') { ℹ️ }
            }
          </span>
          <span class="toast-message">{{ n.message }}</span>
          <button class="toast-close" (click)="notificationService.remove(n.id)">×</button>
        </div>
      }
    </div>

    @if (confirmService.state().visible) {
      <div class="confirm-overlay" (click)="confirmService.respond(false)">
        <div class="confirm-dialog" [class]="'confirm-' + confirmService.state().type" (click)="$event.stopPropagation()">
          <div class="confirm-header">
            <h3>{{ confirmService.state().title }}</h3>
          </div>
          <div class="confirm-body">
            <p>{{ confirmService.state().message }}</p>
          </div>
          <div class="confirm-footer">
            <button class="btn btn-cancel" (click)="confirmService.respond(false)">
              {{ confirmService.state().cancelText }}
            </button>
            <button class="btn btn-confirm" [class]="'btn-confirm-' + confirmService.state().type" (click)="confirmService.respond(true)">
              {{ confirmService.state().confirmText }}
            </button>
          </div>
        </div>
      </div>
    }

    <router-outlet />
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 420px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: white;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      animation: slideIn 0.3s ease;
    }

    .toast-success { background: #28a745; }
    .toast-error { background: #dc3545; }
    .toast-warning { background: #ffc107; color: #333; }
    .toast-info { background: #17a2b8; }

    .toast-message { flex: 1; }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.8;
      &:hover { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .confirm-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      animation: fadeIn 0.2s ease;
    }

    .confirm-dialog {
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      min-width: 380px;
      max-width: 480px;
      animation: scaleIn 0.2s ease;
      overflow: hidden;
    }

    .confirm-header {
      padding: 1.25rem 1.5rem 0.75rem;
      h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #333;
      }
    }

    .confirm-body {
      padding: 0 1.5rem 1.25rem;
      p {
        margin: 0;
        color: #555;
        font-size: 0.95rem;
        line-height: 1.5;
      }
    }

    .confirm-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 0.5rem 1.25rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
      &:hover { background: #5a6268; }
    }

    .btn-confirm-danger {
      background: #dc3545;
      color: white;
      &:hover { background: #c82333; }
    }

    .btn-confirm-warning {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      &:hover { opacity: 0.9; }
    }

    .btn-confirm-info {
      background: #17a2b8;
      color: white;
      &:hover { background: #138496; }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class AppComponent {
  notificationService = inject(NotificationService);
  confirmService = inject(ConfirmService);
}
