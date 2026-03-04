export interface Usuario {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  dataNascimento?: string;
  grupos: Grupo[];
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha?: string;
  confirmacaoSenha?: string;
  ativo: boolean;
  dataNascimento?: string;
  gruposIds: number[];
}

export interface Grupo {
  id: number;
  nome: string;
}

export interface UsuarioFilter {
  nome?: string;
  email?: string;
  gruposIds?: number[];
}
