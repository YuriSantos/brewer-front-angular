export interface Cliente {
  id: number;
  nome: string;
  tipoPessoa: TipoPessoa;
  cpfCnpj: string;
  telefone?: string;
  email: string;
  endereco?: Endereco;
}

export interface ClienteRequest {
  nome: string;
  tipoPessoa: TipoPessoa;
  cpfCnpj: string;
  telefone?: string;
  email: string;
  endereco?: EnderecoRequest;
}

export interface Endereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  cidade?: Cidade;
}

export interface EnderecoRequest {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  cidadeId?: number;
}

export interface Cidade {
  codigo: number;
  nome: string;
  estado?: Estado;
}

export interface Estado {
  codigo: number;
  nome: string;
  sigla: string;
}

export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  estado: string;
  ibge: string;
  ddd: string;
  cidadeId: number;
  estadoId: number;
}

export type TipoPessoa = 'FISICA' | 'JURIDICA';

export interface ClienteFilter {
  nome?: string;
  cpfCnpj?: string;
}
