# Sales ERP System

Sales ERP System is a lightweight enterprise resource planning application developed as a machine task. It uses Django REST Framework for the backend API and React for the frontend, with a focus on item management, sales quotations, and sales orders.

## Features

- Create and manage items, including units, barcodes, and pricing.
- Prepare sales quotations with item-level quantity and price calculations.
- Convert approved sales quotations into sales orders.
- Select customers from predefined sample customer data.
- Use the application across desktop and mobile devices with a responsive interface.

## Tech Stack

| Area | Technology |
| --- | --- |
| Backend | Django, Django REST Framework |
| Frontend | React |
| Database | PostgreSQL |
| Version control | Git, GitHub |

## Project Structure

```text
Sales-ERP-System/
├── backend/            # Django project and REST API
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
├── frontend/           # React application
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Setup

### Prerequisites

Install the following before starting:

- Python 3.10 or later
- Node.js 18 or later and npm
- PostgreSQL
- Git

### Backend

1. Clone the repository and enter the backend directory:

   ```bash
   git clone <repository-url>
   cd Sales-ERP-System/backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

   On Windows, run `.venv\Scripts\activate` instead.

3. Install the Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a PostgreSQL database, then configure the database name, user, password, host, and port in the project's environment file or Django settings.

5. Apply migrations and start the API server:

   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

The backend will normally be available at `http://127.0.0.1:8000/`.

### Frontend

Open a second terminal and run:

```bash
cd Sales-ERP-System/frontend
npm install
npm start
```

If the project uses Vite, run `npm run dev` instead of `npm start`. Configure the frontend API base URL to point to the Django server when required.

## Future Enhancements

- Customer and supplier management.
- Inventory tracking and stock adjustments.
- Invoice and payment management.
- Authentication with role-based access control.
- Reports, dashboards, and document exports.
- Automated tests and deployment workflows.

## License

This project is provided for educational and evaluation purposes. Add a license file before using or distributing it in production.
