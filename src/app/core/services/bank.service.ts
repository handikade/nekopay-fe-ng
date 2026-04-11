import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Bank, BankParams } from '../models/bank.model';

@Injectable({
  providedIn: 'root',
})
export class BankService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/banks`;

  getList(params: BankParams = {}): Observable<ApiResponse<Bank[]>> {
    let httpParams = new HttpParams()
      .set('page', (params.page ?? 1).toString())
      .set('limit', (params.limit ?? 10).toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<ApiResponse<Bank[]>>(this.baseUrl, { params: httpParams });
  }
}
