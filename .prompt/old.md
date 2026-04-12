please implement `PartnerService` in `src/app/core/services`, function `getList`

baseUrl = `${environment.apiUrl}/partners`;

example response:

```
{
    "statusCode": 200,
    "message": "Success",
    "data": [
        {
            "id": "4ade21a8-290f-44ef-b715-73359a9add92",
            "name": "Test",
            "types": [
                "BUYER"
            ],
            "legal_entity": "PT",
            "company_email": "16-57__11-04@nekopay.id",
            "company_phone": "+6281234567890",
            "created_at": "2026-04-11T09:58:02.028Z",
            "updated_at": "2026-04-11T09:58:02.028Z"
        },
        {
            "id": "4cab3143-cffd-42b6-9ad8-81dd28330e8b",
            "name": "PT Maju Terus 2",
            "types": [
                "BUYER",
                "SUPPLIER"
            ],
            "legal_entity": "CV",
            "company_email": "delete-later2@nekotech.id",
            "company_phone": "+6281234567890",
            "created_at": "2026-04-11T09:39:25.218Z",
            "updated_at": "2026-04-11T09:41:54.873Z"
        },
        {
            "id": "dde3890f-0477-4878-9efe-841d06c9b839",
            "name": "PT Maju Terus 2",
            "types": [
                "BUYER",
                "SUPPLIER"
            ],
            "legal_entity": "CV",
            "company_email": "hello@nekotech.id",
            "company_phone": "+6281234567890",
            "created_at": "2026-04-11T03:35:14.153Z",
            "updated_at": "2026-04-11T05:15:47.183Z"
        }
    ],
    "meta": {
        "total": 3,
        "page": 1,
        "limit": 10,
        "totalPages": 1
    }
}
```

---

the partners endpoint can be used like this: `/partners?page=1&limit=5&search=maju&sortBy=created_at&sortOrder=desc`

please update `getList()` implementation on `src/app/core/services/partner.service.ts`

---

update `src/app/features/partner/partner.component.ts`

make data table using angular material
use `src/app/core/services/partner.service.ts` for the data

here is the layout:

1. page title "Partners"
2. input search, map to `params.search`. should refetch the data. use debouncing.
3. the data table. columns:
   - `name` (sortable)
   - `company_email`
   - `company_phone`
   - `legal_entity`
   - `created_at` (sortable. format the date, DD/MM/YYYY);
4. pagination

no need to make a unit test

---

folder: `src/app/features/partner`

please make `PartnerCreate` component.

just dummy, only `<p>` tag is okay.

adjust the routing

locate `mat-form-field` on line 30. wrap it inside a flex container. vertical: center, hiorizontal: space between.

then on this flex container, add a button (label: 'Create Partner`, put plus icon on this button)

when the button click, will go to create partner page.

---

in `src/app/core/services/partner.service.ts`, please make function to get detail of a partner.

url: `/partners/{{partner_id}}

example response:

```
{
    "statusCode": 200,
    "message": "Success",
    "data": {
        "id": "4cab3143-cffd-42b6-9ad8-81dd28330e8b",
        "name": "PT Maju Terus 2",
        "types": [
            "BUYER",
            "SUPPLIER"
        ],
        "legal_entity": "CV",
        "company_email": "delete-later2@nekotech.id",
        "company_phone": "+6281234567890",
        "provinsi_id": "31",
        "provinsi_label": "DKI Jakarta",
        "kota_id": "3171",
        "kota_label": "Jakarta Selatan",
        "kecamatan_id": "317106",
        "kecamatan_label": "Setiabudi",
        "kelurahan_id": "3171061001",
        "kelurahan_label": "Kuningan",
        "address": "Jl. HR Rasuna Said Blok X5",
        "postal_code": "11111",
        "user_id": "44c1b43a-3951-4115-872d-cec82c6f76a7",
        "created_at": "2026-04-11T09:39:25.218Z",
        "updated_at": "2026-04-11T09:41:54.873Z",
        "contacts": [
            {
                "id": "e4503a8a-5845-40c8-b2b2-69f65708136f",
                "partner_id": "4cab3143-cffd-42b6-9ad8-81dd28330e8b",
                "name": "Jane Doe",
                "email": "jane.doe@nekotech.id",
                "phone_number": "+6281987654321",
                "created_at": "2026-04-11T09:39:25.218Z",
                "updated_at": "2026-04-11T09:39:25.218Z"
            }
        ],
        "partner_bank_accounts": [
            {
                "id": "461e45bb-51a9-4bd4-8962-f3d2e8a622e9",
                "partner_id": "4cab3143-cffd-42b6-9ad8-81dd28330e8b",
                "bank_id": "41aed3f0-b4f3-4c6a-a171-278bd2fc4302",
                "account_number": "0700001234567",
                "account_name": "PT Neko Integrasi Teknologi",
                "created_at": "2026-04-11T09:39:25.218Z",
                "updated_at": "2026-04-11T09:39:25.218Z",
                "bank": {
                    "id": "41aed3f0-b4f3-4c6a-a171-278bd2fc4302",
                    "code": "BANK_RAKYAT_INDONESIA",
                    "name": "Bank Rakyat Indonesia (BRI)",
                    "created_at": "2026-04-10T14:40:44.829Z",
                    "updated_at": "2026-04-10T14:40:44.829Z"
                }
            }
        ]
    }
}
```

no need to make a unit test.

---

folder: `src/app/features/partner`

create `PartnerDetail` component.
setup the route, accept id params
use the params to get the partner detail data
data source `src/app/core/services/partner.service.ts`, `getById()`

simple ui is okay.
use angular material.

folder: `src/app/core/services`
please make `RegionService`. this service fetch indonesian region from external service.

the service should hase these functions:

function `getProvinces()`
url: [GET] `https://api-regional-indonesia.vercel.app/api/provinces`
response shape:

```
export type Root = {
  status: boolean
  statusCode: number
  message: string
  data: Array<{
    id: string
    name: string
  }>
}
```

function `getCities()`
url: [GET] `https://api-regional-indonesia.vercel.app/api/cities/1`
response shape:

```
type Root = {
  status: boolean
  statusCode: number
  message: string
  data: Array<{
    id: string
    provinceId: string
    name: string
  }>
}
```

function `getDistricts()`
url: [GET] `https://api-regional-indonesia.vercel.app/api/districts/3`
response shape:

```
export type Root = {
  status: boolean
  statusCode: number
  message: string
  data: Array<{
    id: string
    cityId: string
    name: string
  }>
}
```

function `getVillages()`
url: [GET] `https://api-regional-indonesia.vercel.app/api/villages/6`
response shape:

```
export type Root = {
  status: boolean
  statusCode: number
  message: string
  data: Array<{
    id: string
    districtId: string
    name: string
  }>
}
```

---

service: `src/app/core/services/partner.service.ts`

please implement `create()` function.

url: [POST] /partners

here i give you the zod DTO in the backend for payload reference

```
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreatePartnerSchema = z.object({
  name: z.string().min(1).describe('Partner company name'),
  types: z
    .array(z.enum(['SUPPLIER', 'BUYER']))
    .min(1)
    .refine((items) => new Set(items).size === items.length, {
      message: 'Types must be unique',
    })
    .describe('Types of partner (SUPPLIER or BUYER)'),
  legal_entity: z
    .enum(['CV', 'PT', 'KOPERASI', 'INDIVIDUAL'])
    .describe('Legal entity type (CV, PT, etc.)'),
  company_email: z.email().describe('Official company email'),
  company_phone: z.string().min(1).describe('Official company phone number'),
});

export class CreatePartnerDto extends createZodDto(CreatePartnerSchema) {}
```

---

- adjust `src/app/features/partner/partner-create.component.ts`
- make partner create form
- see `create()` in `src/app/core/services/partner.service.ts`
- see `CreatePartnerRequest` in `src/app/core/models/partner.model.ts` for form shape reference
- use angular material
- it should has loading state
- it should has error feedback (use mat snackbar)
- no need to make unit test

---

component: `src/app/features/partner/partner-create.component.ts`

requests:

- add data-testid to the important element
- make e2e test for this component in `e2e`
  - login ({identifier: 'dika', password: 'neko1234'})
  - happy path: fill all form, submit
  - negative case: checking error feedback (mat-error)
  - click cancel button

---

folder: `src/app/core/services`

requests:
create `BankServices`
url: `${environment.apiUrl}/banks?page=2&limit=2`
method: GET
function: `getList()`
example response:

```
{
    "statusCode": 200,
    "message": "Success",
    "data": [
        {
            "id": "6b8dfd33-d5ef-4e56-9963-01177e4e378c",
            "code": "BANK_VICTORIA_INTERNASIONAL",
            "name": "Bank Victoria Internasional",
            "created_at": "2026-04-10T14:40:44.900Z",
            "updated_at": "2026-04-10T14:40:44.900Z"
        },
        {
            "id": "04ac080f-c6e2-4b19-8e24-5a95d50ace1c",
            "code": "BANK_VICTORIA_SYARIAH",
            "name": "Bank Victoria Syariah",
            "created_at": "2026-04-10T14:40:44.900Z",
            "updated_at": "2026-04-10T14:40:44.900Z"
        }
    ],
    "meta": {
        "total": 143,
        "page": 2,
        "limit": 2,
        "totalPages": 72
    }
}
```

---

please update `CreatePartnerRequest` in `src/app/core/models/partner.model.ts` so it can also receive below fields. all below fields is optional

```
{
   ...
   "provinsi_id": "31",
   "provinsi_label": "DKI Jakarta",
   "kota_id": "3171",
   "kota_label": "Jakarta Selatan",
   "kecamatan_id": "317106",
   "kecamatan_label": "Setiabudi",
   "kelurahan_id": "3171061001",
   "kelurahan_label": "Kuningan",
   "address": "Jl. HR Rasuna Said Blok X5",
   "postal_code": "12950",
   ...
}
```

adjust `src/app/features/partner/partner-create.component.ts`, add a new form section to input the region, address, and postal code.

use angular material.

use this service: `src/app/core/services/region.service.ts`.

region fields (searchable, clearable):

- Province: provinsi
- City: kota. value will reset when province change
- District: kecamatan. value will reset when city change
- Villaage: kelurahan. value will reset when district change

please notice that `id` and `name` will be sent to the server
example:

```
"provinsi_id": "31",
"provinsi_label": "DKI Jakarta",
```

address & postal code

- Address: text area
- Postal Code: text field. validate zip code format (number, 5 digit)

no need to make unit test.

run `npm run lint`. fix linting error if any.

after all good, run `npm run format`

---

see `src/app/features/partner/detail/partner-detail.page.ts` line 24-29
see `src/app/features/partner/create/partner-create.page.html` line 1-6

please extract to a separate component
put the code here (the file is already exist): `src/app/ui/page-title.component.ts`
selector: `ui-page-title`, class name: `UiPageTitle`

---
