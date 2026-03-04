import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export interface ConfirmState extends ConfirmOptions {
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  state = signal<ConfirmState>({
    visible: false,
    message: '',
    title: 'Confirmacao',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning'
  });

  private response$ = new Subject<boolean>();

  confirm(options: ConfirmOptions): Promise<boolean> {
    this.state.set({
      visible: true,
      title: options.title ?? 'Confirmacao',
      message: options.message,
      confirmText: options.confirmText ?? 'Confirmar',
      cancelText: options.cancelText ?? 'Cancelar',
      type: options.type ?? 'warning'
    });

    return new Promise<boolean>(resolve => {
      this.response$.pipe(first()).subscribe(result => resolve(result));
    });
  }

  respond(value: boolean): void {
    this.state.update(s => ({ ...s, visible: false }));
    this.response$.next(value);
  }
}
