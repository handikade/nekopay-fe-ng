import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { City, District, Province, RegionResponse, Village } from '../models/region.model';

@Injectable({
  providedIn: 'root',
})
export class RegionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/regions`;

  getProvinces(): Observable<RegionResponse<Province[]>> {
    return this.http.get<RegionResponse<Province[]>>(`${this.baseUrl}/provinces`);
  }

  getCities(provinceId: string): Observable<RegionResponse<City[]>> {
    return this.http.get<RegionResponse<City[]>>(`${this.baseUrl}/cities/${provinceId}`);
  }

  getDistricts(cityId: string): Observable<RegionResponse<District[]>> {
    return this.http.get<RegionResponse<District[]>>(`${this.baseUrl}/districts/${cityId}`);
  }

  getVillages(districtId: string): Observable<RegionResponse<Village[]>> {
    return this.http.get<RegionResponse<Village[]>>(`${this.baseUrl}/villages/${districtId}`);
  }
}
