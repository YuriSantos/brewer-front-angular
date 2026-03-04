import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Venda, VendaRequest, VendaFilter } from '../models/venda.model';
import { Page } from '../../../core/models/page.model';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vendas`;

  list(filter: VendaFilter = {}, page = 0, size = 10): Observable<Page<Venda>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.clienteNome) {
      params = params.set('clienteNome', filter.clienteNome);
    }
    if (filter.dataInicio) {
      params = params.set('dataInicio', filter.dataInicio);
    }
    if (filter.dataFim) {
      params = params.set('dataFim', filter.dataFim);
    }

    return this.http.get<Page<Venda>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Venda> {
    return this.http.get<Venda>(`${this.apiUrl}/${id}`);
  }

  create(venda: VendaRequest): Observable<Venda> {
    return this.http.post<Venda>(this.apiUrl, venda);
  }

  update(id: number, venda: VendaRequest): Observable<Venda> {
    return this.http.put<Venda>(`${this.apiUrl}/${id}`, venda);
  }

  emitir(id: number): Observable<Venda> {
    return this.http.post<Venda>(`${this.apiUrl}/${id}/emitir`, {});
  }

  cancelar(id: number): Observable<Venda> {
    return this.http.post<Venda>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  getVendasPorMes(): Observable<{ mes: string; total: number }[]> {
    return this.http.get<{ mes: string; total: number }[]>(`${this.apiUrl}/por-mes`);
  }
}
