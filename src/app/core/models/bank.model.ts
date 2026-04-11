export interface Bank {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface BankParams {
  page?: number;
  limit?: number;
  search?: string;
}
