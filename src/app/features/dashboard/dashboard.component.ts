import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface DashboardData {
  totalVendasAno: number;
  totalVendasMes: number;
  ticketMedio: number;
  valorEstoque: number;
  totalClientes: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">💰</div>
          <div class="stat-content">
            <h3>Vendas no Ano</h3>
            <p class="stat-value">{{ formatCurrency(data()?.totalVendasAno || 0) }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">📈</div>
          <div class="stat-content">
            <h3>Vendas no Mes</h3>
            <p class="stat-value">{{ formatCurrency(data()?.totalVendasMes || 0) }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon purple">🎫</div>
          <div class="stat-content">
            <h3>Ticket Medio</h3>
            <p class="stat-value">{{ formatCurrency(data()?.ticketMedio || 0) }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orange">📦</div>
          <div class="stat-content">
            <h3>Valor em Estoque</h3>
            <p class="stat-value">{{ formatCurrency(data()?.valorEstoque || 0) }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon red">👥</div>
          <div class="stat-content">
            <h3>Total Clientes</h3>
            <p class="stat-value">{{ data()?.totalClientes || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="welcome-message">
        <h2>Bem-vindo ao Brewer!</h2>
        <p>Sistema de gerenciamento de cervejaria.</p>
        <p>Use o menu lateral para navegar pelas funcionalidades.</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      h1 {
        margin-bottom: 2rem;
        color: #333;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-right: 1rem;

      &.blue { background: #e3f2fd; }
      &.green { background: #e8f5e9; }
      &.purple { background: #f3e5f5; }
      &.orange { background: #fff3e0; }
      &.red { background: #ffebee; }
    }

    .stat-content {
      h3 {
        margin: 0;
        font-size: 0.9rem;
        color: #666;
        font-weight: 500;
      }

      .stat-value {
        margin: 0.5rem 0 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #333;
      }
    }

    .welcome-message {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      h2 {
        color: #333;
        margin-bottom: 1rem;
      }

      p {
        color: #666;
        margin: 0.5rem 0;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);

  data = signal<DashboardData | null>(null);

  ngOnInit(): void {
    // Dashboard data would be loaded from API
    // For now, showing placeholder data
    this.data.set({
      totalVendasAno: 125000.00,
      totalVendasMes: 15000.00,
      ticketMedio: 250.00,
      valorEstoque: 85000.00,
      totalClientes: 150
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
