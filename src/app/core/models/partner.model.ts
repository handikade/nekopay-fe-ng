import { Bank } from './bank.model';

export type PartnerType = 'BUYER' | 'SUPPLIER';
export type LegalEntity = 'CV' | 'PT' | 'KOPERASI' | 'INDIVIDUAL';

export interface Partner {
  id: string;
  name: string;
  types: PartnerType[];
  legal_entity: LegalEntity;
  company_email: string;
  company_phone: string;
  created_at: string;
  updated_at: string;

  // Detailed fields
  provinsi_id?: string;
  provinsi_label?: string;
  kota_id?: string;
  kota_label?: string;
  kecamatan_id?: string;
  kecamatan_label?: string;
  kelurahan_id?: string;
  kelurahan_label?: string;
  address?: string;
  postal_code?: string;
  user_id?: string;
  contacts?: Contact[];
  partner_bank_accounts?: PartnerBankAccount[];
}

export interface CreatePartnerRequest {
  name: string;
  types: PartnerType[];
  legal_entity: LegalEntity;
  company_email: string;
  company_phone: string;
  provinsi_id?: string;
  provinsi_label?: string;
  kota_id?: string;
  kota_label?: string;
  kecamatan_id?: string;
  kecamatan_label?: string;
  kelurahan_id?: string;
  kelurahan_label?: string;
  address?: string;
  postal_code?: string;
  contacts?: CreateContactRequest[];
  partner_bank_accounts?: CreatePartnerBankAccountRequest[];
}

export type UpdatePartnerRequest = Partial<CreatePartnerRequest>;

export interface CreateContactRequest {
  name: string;
  email: string;
  phone_number: string;
}

export interface CreatePartnerBankAccountRequest {
  bank_id: string;
  account_number: string;
  account_name: string;
}

export interface Contact {
  id: string;
  partner_id: string;
  name: string;
  email: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerBankAccount {
  id: string;
  partner_id: string;
  bank_id: string;
  account_number: string;
  account_name: string;
  created_at: string;
  updated_at: string;
  bank: Bank;
}

export interface PartnerParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
