# DayFlow

## Personal Productivity & Daily Planning Platform

DayFlow is a modern full-stack personal productivity and daily-planning web application designed to bring tasks, events, reminders, calendar planning, weather information, and personalized settings into one unified workspace.

The project combines a responsive React frontend with a C#/.NET REST API and PostgreSQL database to provide a complete productivity management experience.

## 🌐 Live Project

### [🚀 Open DayFlow](https://day-flow-orcin.vercel.app/)

---

## ✨ Features

### 🔐 Authentication

- User registration and login
- JWT-based authentication
- Protected application routes
- Secure password hashing
- Session-based user experience
- Password management

### 📊 Dashboard

- Centralized overview of the user's day
- Today's tasks and events
- Upcoming activities
- Reminder overview
- Weather information
- Productivity statistics
- Quick access to major DayFlow modules

### ✅ Task Management

- Create, edit, and delete tasks
- Mark tasks as completed
- Task priorities
- Task categories
- Task status tracking
- Due dates
- Overdue task identification
- Search and filtering
- Sorting and organization

### 📅 Calendar & Events

- Monthly calendar interface
- Event creation and management
- Edit and delete events
- Day-specific event information
- Event scheduling
- Integrated task and event planning

### ⏰ Reminders

- Create reminders for tasks and events
- Reminder management
- Due reminder detection
- Reminder dismissal
- Browser notification support
- Automatic reminder polling

### 🌤️ Weather

- Current weather conditions
- Multi-day weather forecast
- City-based weather search
- Configurable weather location
- Weather information integrated into the dashboard

### ⚙️ User Settings

- Light theme
- Dark theme
- System theme
- Time format preferences
- Weather location preferences
- Default reminder settings
- Category management
- Password management
- Personalized application configuration

### 📱 Responsive Design

- Desktop interface
- Mobile-friendly layouts
- Responsive navigation
- Mobile navigation menu
- Adaptive dashboards
- Responsive calendar and management interfaces

### 🎨 User Interface

- Modern glassmorphism-inspired design
- Animated backgrounds
- Smooth transitions
- Scroll-reveal animations
- Interactive modals
- Toast notifications
- Loading states
- Empty states
- Error states
- Responsive components

---

# 🛠️ Technology Stack

## Frontend

- **React 19**
- **Vite**
- **JavaScript**
- **React Router DOM**
- **HTML5**
- **CSS3**
- **Context API**
- **Fetch API**
- **Browser Notification API**

## Backend

- **C#**
- **.NET 10**
- **ASP.NET Core Web API**
- **Entity Framework Core 10**
- **Npgsql**
- **REST API**
- **JWT Authentication**
- **Dependency Injection**
- **Service Layer Architecture**
- **Swagger / OpenAPI**

## Database

- **PostgreSQL**
- **Entity Framework Core Migrations**
- **Supabase**

## Deployment & Infrastructure

- **Vercel** — Frontend hosting
- **Render** — Backend hosting
- **Supabase** — PostgreSQL database
- **Docker** — Backend containerization

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │        USER          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React + Vite       │
                         │      Vercel          │
                         │                      │
                         │  Dashboard           │
                         │  Tasks               │
                         │  Calendar            │
                         │  Reminders           │
                         │  Weather             │
                         │  Settings            │
                         └──────────┬───────────┘
                                    │
                              REST API + JWT
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   ASP.NET Core       │
                         │       .NET 10        │
                         │       Render         │
                         │                      │
                         │   Controllers        │
                         │   Services           │
                         │   Middleware         │
                         │   EF Core            │
                         └──────────┬───────────┘
                                    │
                              Npgsql / EF Core
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     PostgreSQL       │
                         │      Supabase        │
                         └──────────────────────┘