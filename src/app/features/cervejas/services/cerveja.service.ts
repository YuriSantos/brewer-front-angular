import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../core/models/page.model';
import { Cerveja, CervejaFilter, CervejaRequest, EnumOption } from '../models/cerveja.model';

@Injectable({ providedIn: 'root' })
export class CervejaService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/cervejas`;

  listar(filter: CervejaFilter, page: number = 0, size: number = 10): Observable<Page<Cerveja>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.sku) params = params.set('sku', filter.sku);
    if (filter.nome) params = params.set('nome', filter.nome);
    if (filter.codigoEstilo) params = params.set('codigoEstilo', filter.codigoEstilo.toString());
    if (filter.sabor) params = params.set('sabor', filter.sabor);
    if (filter.origem) params = params.set('origem', filter.origem);
    if (filter.valorDe) params = params.set('valorDe', filter.valorDe.toString());
    if (filter.valorAte) params = params.set('valorAte', filter.valorAte.toString());

    return this.http.get<Page<Cerveja>>(this.API_URL, { params });
  }

  buscarPorId(id: number): Observable<Cerveja> {
    return this.http.get<Cerveja>(`${this.API_URL}/${id}`);
  }

  criar(cerveja: CervejaRequest): Observable<Cerveja> {
    return this.http.post<Cerveja>(this.API_URL, cerveja);
  }

  atualizar(id: number, cerveja: CervejaRequest): Observable<Cerveja> {
    return this.http.put<Cerveja>(`${this.API_URL}/${id}`, cerveja);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  pesquisar(skuOuNome: string): Observable<Cerveja[]> {
    return this.http.get<Cerveja[]>(`${this.API_URL}/search`, {
      params: { skuOuNome }
    });
  }

  getSabores(): Observable<EnumOption[]> {
    return this.http.get<EnumOption[]>(`${this.API_URL}/sabores`);
  }

  getOrigens(): Observable<EnumOption[]> {
    return this.http.get<EnumOption[]>(`${this.API_URL}/origens`);
  }
}
