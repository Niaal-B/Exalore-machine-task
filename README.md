# Exalore ERP

Exalore ERP is a lightweight ERP application developed as a machine task with Django REST Framework and React. The current implementation focuses on item master management, including item details, units, barcodes, unit-specific prices, and item images.

The project uses a nested Item → Item Unit → Item Price design so a complete item can be created from a single screen and saved in one transaction.

## Current Features

- Create items from a responsive four-tab interface:
  - General
  - Unit & Barcode
  - Price List
  - Photo
- Maintain multiple units and conversion factors for each item.
- Assign an optional globally unique barcode to each item unit.
- Configure Retail, Wholesale, or other price-list types per unit.
- Enforce minimum-selling-price and uniqueness constraints.
- Upload item images using multipart requests.
- Validate and save nested item data transactionally.
- Search, filter, order, retrieve, and update items through the REST API.
- Manage and inspect item data through Django Admin.
- Explore the API through Swagger UI and ReDoc.
- Prevent API deletion of items; item status controls business availability.

Sales Quotations, Sales Orders, and Inventory are planned modules and are not implemented yet.

## Tech Stack

| Area | Technology |
| --- | --- |
| Backend | Python, Django 6, Django REST Framework |
| API documentation | drf-spectacular, OpenAPI, Swagger UI, ReDoc |
| Frontend | React 19, Vite, TypeScript |
| Styling and UI | Tailwind CSS 4, Radix UI, Lucide React |
| HTTP client | Axios |
| Routing | React Router |
| Database | SQLite (current development setup) |
| Image handling | Pillow |
| Cross-origin support | django-cors-headers |

## Project Structure

```text
Exalore-ERP/
├── backend/
│   ├── config/                 # Django settings and project URLs
│   ├── inventory/              # Reserved for future inventory work
│   ├── items/                  # Item models, serializers, admin, and API
│   │   └── migrations/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/                 # Static public assets
│   └── src/
│       ├── app/                # Application layout and routing
│       ├── components/ui/      # Shared UI primitives
│       ├── features/items/     # Item API, UI, pages, and TypeScript types
│       └── lib/                # Shared Axios client and utilities
└── README.md
```

## Data Model

```text
Item
└── ItemUnit (one or more units per item)
    └── ItemPrice (multiple price-list entries per unit)
```

Key rules include:

- Item codes are unique.
- Unit names are unique within an item, ignoring letter case.
- Barcodes are optional but globally unique when provided.
- Conversion factors must be greater than zero.
- Price-list types are unique within an item unit, ignoring letter case.
- Sale prices cannot be negative.
- Minimum selling price cannot exceed sale price.

## Prerequisites

- Git
- Python 3.12 or later
- Node.js 22 and npm

If NVM is installed, select Node.js 22 with:

```bash
nvm use 22
```

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd Exalore-ERP
```

### 2. Start the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

On Windows, activate the environment with:

```powershell
venv\Scripts\activate
```

The backend runs at `http://127.0.0.1:8000` by default.

To use Django Admin, create an administrator account:

```bash
python manage.py createsuperuser
```

Then open `http://127.0.0.1:8000/admin/`.

### 3. Start the frontend

Open another terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

The frontend normally runs at `http://localhost:5173` and opens the Item Create page at `/items/new`.

During local development, Vite proxies `/api` requests to Django automatically. To call Django directly instead, create `frontend/.env` with:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Restart the Vite development server after changing environment variables. Django currently allows local frontend requests from both `localhost:5173` and `127.0.0.1:5173`.

## API

The Item API is available under `/api/items/`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/items/` | List items |
| `POST` | `/api/items/` | Create an item with nested units and prices |
| `GET` | `/api/items/{id}/` | Retrieve one item |
| `PUT` | `/api/items/{id}/` | Fully update an item |
| `PATCH` | `/api/items/{id}/` | Partially update an item |

`DELETE` is intentionally disabled. Set an item's `status` to `inactive` when it should no longer be available for business use.

### Query Parameters

```text
?search=laptop
?status=active
?tax_status=taxable
?ordering=code
?ordering=-updated_at
```

Search covers item code, primary name, secondary name, and generic name.

### Create Example

```json
{
  "code": "ITM-2001",
  "name": "Wireless Mouse",
  "secondary_name": "2.4 GHz Mouse",
  "generic_name": "Computer Mouse",
  "description": "Wireless optical mouse with USB receiver.",
  "behaviour": "purchase",
  "group_code": "ACCESSORIES",
  "status": "active",
  "tax_status": "taxable",
  "shelf_code": "A-12",
  "manufacturer": "TechWorks",
  "units": [
    {
      "unit": "Pcs",
      "co_factor": "1.000000",
      "barcode": "8906000000016",
      "prices": [
        {
          "price_list_type": "Retail",
          "sale_price": "850.0000",
          "minimum_selling_price": "780.0000"
        },
        {
          "price_list_type": "Wholesale",
          "sale_price": "800.0000",
          "minimum_selling_price": "740.0000"
        }
      ]
    }
  ]
}
```

Valid behavior values are `stock`, `purchase`, `non_stock`, `service`, and `assembly`. Valid status values are `active` and `inactive`; valid tax statuses are `taxable` and `non_taxable`.

Nested updates preserve omitted units and prices. Deletions must be requested explicitly using `deleted_unit_ids` and `deleted_price_ids`.

## API Documentation

With the backend running, open:

- Swagger UI: `http://127.0.0.1:8000/api/schema/swagger-ui/`
- ReDoc: `http://127.0.0.1:8000/api/schema/redoc/`
- OpenAPI schema: `http://127.0.0.1:8000/api/schema/`

## Development Checks

Backend:

```bash
cd backend
source venv/bin/activate
python manage.py check
python manage.py makemigrations --check
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Future Enhancements

- Item listing and editing screens.
- Unit and price-list master data.
- Cloud image storage.
- Customer and supplier management.
- Sales Quotations and Sales Orders.
- Inventory transactions and stock tracking.
- Authentication and role-based permissions.
- Automated backend and frontend tests.
- PostgreSQL configuration for deployment.
- Production environment and deployment settings.

## License

No license file is currently included. This project is intended for machine-task evaluation and learning purposes. Permission from the repository owner is required before reuse or distribution.
