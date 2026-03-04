export interface Cerveja {
  codigo: number;
  sku: string;
  nome: string;
  descricao: string;
  valor: number;
  teorAlcoolico: number;
  comissao: number;
  quantidadeEstoque: number;
  origem: string;
  origemDescricao: string;
  sabor: string;
  saborDescricao: string;
  estilo: Estilo;
  foto: string;
  fotoUrl: string;
  thumbnailUrl: string;
}

export interface Estilo {
  codigo: number;
  nome: string;
}

export interface CervejaFilter {
  sku?: string;
  nome?: string;
  codigoEstilo?: number;
  sabor?: string;
  origem?: string;
  valorDe?: number;
  valorAte?: number;
}

export interface CervejaRequest {
  sku: string;
  nome: string;
  descricao: string;
  valor: number;
  teorAlcoolico: number;
  comissao: number;
  quantidadeEstoque: number;
  origem: string;
  sabor: string;
  codigoEstilo: number;
  foto?: string;
  contentType?: string;
}

export interface EnumOption {
  codigo: string;
  descricao: string;
}
