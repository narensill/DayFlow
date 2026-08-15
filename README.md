# DayFlow — Full Project

This archive contains the complete DayFlow project:

```
DayFlow-Project/
├── DayFlow-main/         ASP.NET Core / PostgreSQL backend (as provided, unchanged)
└── dayflow-frontend/     React + Vite frontend (new — this is what was built)
```

## Running it

### Backend
```
cd DayFlow-main
dotnet restore
dotnet ef database update
dotnet run
```
Make sure `appsettings.Development.json` / environment variables have a valid
`ConnectionStrings:DefaultConnection`, `Jwt:Secret`, and `Cors:AllowedOrigins`
that includes `http://localhost:5173` (the frontend's dev port).

### Frontend
```
cd dayflow-frontend
npm install
cp .env.example .env    # point VITE_API_BASE_URL at your running API, e.g. http://localhost:5000/api
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`), register an
account, and you're in. See `dayflow-frontend/README.md` for a full breakdown of
what was built (routing, pages, design system, features).
