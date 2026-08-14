# DayFlow

DayFlow is a personal productivity and daily-planning application built with C#/.NET and PostgreSQL.

## Current backend foundation

- .NET 10 / ASP.NET Core Web API
- Entity Framework Core 10
- PostgreSQL
- Npgsql
- Dependency Injection
- Service layer
- Task CRUD API
- Swagger
- REST Client request examples

## Current structure

```text
DayFlow/
├── Controllers/
├── Data/
├── DTOs/
├── Models/
├── Services/
├── Requests/
├── Migrations/
├── Program.cs
├── appsettings.json
└── DayFlow.csproj
```

## Local database configuration

1. Create a PostgreSQL database named `dayflow`.
2. Copy the connection string into `appsettings.Development.json`.
3. Replace `CHANGE_ME` with your local PostgreSQL password.
4. Run:

```bash
dotnet restore
dotnet build
dotnet ef database update
dotnet run
```

Do not commit `appsettings.Development.json`.

## Production plan

The project is intended to use a hosted PostgreSQL database such as Supabase for production. The connection string will be supplied through deployment environment variables rather than committed to source control.

The frontend can later be hosted on Vercel while the ASP.NET Core API is deployed to a .NET-compatible backend host.
