import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Partner } from '../models/partner.model';
import { PartnerService } from './partner.service';

describe('PartnerService', () => {
  let service: PartnerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PartnerService],
    });

    service = TestBed.inject(PartnerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch partners with default pagination', () => {
    const mockResponse: ApiResponse<Partner[]> = {
      statusCode: 200,
      message: 'Success',
      data: [
        {
          id: '1',
          name: 'Partner 1',
          types: ['BUYER'],
          legal_entity: 'PT',
          company_email: 'p1@test.com',
          company_phone: '123',
          created_at: '2026-04-11T09:58:02.028Z',
          updated_at: '2026-04-11T09:58:02.028Z',
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    service.getList().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/partners?page=1&limit=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch partners with custom pagination', () => {
    const mockResponse: ApiResponse<Partner[]> = {
      statusCode: 200,
      message: 'Success',
      data: [],
      meta: {
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      },
    };

    service.getList({ page: 2, limit: 5 }).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/partners?page=2&limit=5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch partners with all optional parameters', () => {
    const mockResponse: ApiResponse<Partner[]> = {
      statusCode: 200,
      message: 'Success',
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 5,
        totalPages: 0,
      },
    };

    service
      .getList({
        page: 1,
        limit: 5,
        search: 'maju',
        sortBy: 'created_at',
        sortOrder: 'desc',
      })
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/partners?page=1&limit=5&search=maju&sortBy=created_at&sortOrder=desc`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
