import { Cliente } from '../../clientes/models/cliente.model';

export interface Venda {
  id: number;
  dataCriacao: string;
  valorFrete?: number;
  valorDesconto?: number;
  valorTotal: number;
  status: StatusVenda;
  observacao?: string;
  dataHoraEntrega?: string;
  cliente: Cliente;
  usuario?: { id: number; nome: string };
  itens: ItemVenda[];
}

export interface VendaRequest {
  clienteId: number;
  valorFrete?: number;
  valorDesconto?: number;
  observacao?: string;
  dataHoraEntrega?: string;
  itens: ItemVendaRequest[];
}

export interface ItemVenda {
  id?: number;
  quantidade: number;
  valorUnitario: number;
  cerveja: {
    id: number;
    sku: string;
    nome: string;
    foto?: string;
  };
}

export interface ItemVendaRequest {
  cervejaId: number;
  quantidade: number;
}

export type StatusVenda = 'ORCAMENTO' | 'EMITIDA' | 'CANCELADA';

export interface VendaFilter {
  status?: StatusVenda;
  clienteNome?: string;
  dataInicio?: string;
  dataFim?: string;
}

export const STATUS_VENDA_LABELS: Record<StatusVenda, string> = {
  'ORCAMENTO': 'Orcamento',
  'EMITIDA': 'Emitida',
  'CANCELADA': 'Cancelada'
};

export const STATUS_VENDA_COLORS: Record<StatusVenda, string> = {
  'ORCAMENTO': '#ffc107',
  'EMITIDA': '#28a745',
  'CANCELADA': '#dc3545'
};
