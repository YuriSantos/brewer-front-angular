import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Estilo } from '../../cervejas/models/cerveja.model';

@Injectable({ providedIn: 'root' })
export class EstiloService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/estilos`;

  listarTodos(): Observable<Estilo[]> {
    return this.http.get<Estilo[]>(`${this.API_URL}/todos`);
  }

  buscarPorId(id: number): Observable<Estilo> {
    return this.http.get<Estilo>(`${this.API_URL}/${id}`);
  }

  criar(estilo: { nome: string }): Observable<Estilo> {
    return this.http.post<Estilo>(this.API_URL, estilo);
  }

  atualizar(id: number, estilo: { nome: string }): Observable<Estilo> {
    return this.http.put<Estilo>(`${this.API_URL}/${id}`, estilo);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
