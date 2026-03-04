import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Cliente, ClienteRequest, ClienteFilter, Estado, Cidade, CepResponse } from '../models/cliente.model';
import { Page } from '../../../core/models/page.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clientes`;

  list(filter: ClienteFilter = {}, page = 0, size = 10): Observable<Page<Cliente>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.nome) {
      params = params.set('nome', filter.nome);
    }
    if (filter.cpfCnpj) {
      params = params.set('cpfCnpj', filter.cpfCnpj);
    }

    return this.http.get<Page<Cliente>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  create(cliente: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  update(id: number, cliente: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  search(nome: string): Observable<Cliente[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<Cliente[]>(`${this.apiUrl}/search`, { params });
  }

  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${environment.apiUrl}/estados`);
  }

  getCidadesByEstado(estadoId: number): Observable<Cidade[]> {
    return this.http.get<Cidade[]>(`${environment.apiUrl}/estados/${estadoId}/cidades`);
  }

  buscarCep(cep: string): Observable<CepResponse> {
    return this.http.get<CepResponse>(`${environment.apiUrl}/cep/${cep}`);
  }
}
