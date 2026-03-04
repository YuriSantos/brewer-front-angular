import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private notifications = signal<Notification[]>([]);
  public notifications$ = this.notifications.asReadonly();

  private idCounter = 0;

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  private show(message: string, type: Notification['type']): void {
    const id = ++this.idCounter;
    const notification: Notification = { message, type, id };

    this.notifications.update(n => [...n, notification]);

    setTimeout(() => this.remove(id), 5000);
  }

  remove(id: number): void {
    this.notifications.update(n => n.filter(notif => notif.id !== id));
  }

}
