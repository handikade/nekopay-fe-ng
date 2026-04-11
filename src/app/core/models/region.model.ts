export interface RegionResponse<T> {
  status: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface Province {
  id: string;
  name: string;
}

export interface City {
  id: string;
  provinceId: string;
  name: string;
}

export interface District {
  id: string;
  cityId: string;
  name: string;
}

export interface Village {
  id: string;
  districtId: string;
  name: string;
}
