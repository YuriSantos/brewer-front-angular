import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Usuario, UsuarioRequest, UsuarioFilter, Grupo } from '../models/usuario.model';
import { Page } from '../../../core/models/page.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  list(filter: UsuarioFilter = {}, page = 0, size = 10): Observable<Page<Usuario>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.nome) {
      params = params.set('nome', filter.nome);
    }
    if (filter.email) {
      params = params.set('email', filter.email);
    }
    if (filter.gruposIds && filter.gruposIds.length > 0) {
      params = params.set('grupos', filter.gruposIds.join(','));
    }

    return this.http.get<Page<Usuario>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  create(usuario: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  update(id: number, usuario: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  updateStatus(ids: number[], ativo: boolean): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/status`, { ids, ativo });
  }

  getGrupos(): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(`${environment.apiUrl}/grupos`);
  }
}
