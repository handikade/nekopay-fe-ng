import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { CreatePartnerRequest, Partner, PartnerParams } from '../models/partner.model';

@Injectable({
  providedIn: 'root',
})
export class PartnerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/partners`;

  getList(params: PartnerParams = {}): Observable<ApiResponse<Partner[]>> {
    let httpParams = new HttpParams()
      .set('page', (params.page ?? 1).toString())
      .set('limit', (params.limit ?? 10).toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http.get<ApiResponse<Partner[]>>(this.baseUrl, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<Partner>> {
    return this.http.get<ApiResponse<Partner>>(`${this.baseUrl}/${id}`);
  }

  create(data: CreatePartnerRequest): Observable<ApiResponse<Partner>> {
    return this.http.post<ApiResponse<Partner>>(this.baseUrl, data);
  }
}
