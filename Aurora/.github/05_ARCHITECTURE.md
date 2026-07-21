# Aurora Accelerator Architecture
## Complete Technical Architecture Document

**Version:** 1.0  
**Status:** Living Document  
**Last Updated:** May 2026  

---

> **Important Note:** Aurora Accelerator is **not the complete Aurora product**. It is a production-quality reference implementation that demonstrates the architecture, coding standards, user experience, and extensibility of the future Aurora platform. The accelerator intentionally implements only a subset of features to validate the architectural approach.

---

# Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Principles](#3-architecture-principles)
4. [Architectural Decision Records](#4-architectural-decision-records)
5. [Repository Structure](#5-repository-structure)
6. [Backend Architecture](#6-backend-architecture)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Multi-Tenancy](#8-multi-tenancy)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Database Design](#10-database-design)
11. [API Design](#11-api-design)
12. [Validation Strategy](#12-validation-strategy)
13. [Error Handling](#13-error-handling)
14. [Logging & Monitoring](#14-logging--monitoring)
15. [State Management](#15-state-management)
16. [Performance Optimization](#16-performance-optimization)
17. [Security](#17-security)
18. [AI Integration](#18-ai-integration)
19. [Deployment](#19-deployment)
20. [Coding Standards](#20-coding-standards)
21. [Definition of Done](#21-definition-of-done)
22. [Accelerator Scope](#22-accelerator-scope)

---

# 1. Architecture Overview

## 1.1 Architecture Style

Aurora uses a **Modular Monolith** with **Clean Architecture** principles and **Vertical Slice Architecture** for feature implementation.

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                      │
│                   (React + TypeScript)                      │
├─────────────────────────────────────────────────────────────┤
│                         API Layer                           │
│                  (ASP.NET Core 8 Web API)                  │
├─────────────────────────────────────────────────────────────┤
│                     Application Layer                       │
│           (Use Cases, DTOs, Validators, Mappings)          │
├─────────────────────────────────────────────────────────────┤
│                       Domain Layer                          │
│           (Entities, Value Objects, Domain Events)          │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                      │
│      (Repositories, Services, Context, External APIs)      │
├─────────────────────────────────────────────────────────────┤
│                       Database Layer                        │
│                     (PostgreSQL)                            │
└─────────────────────────────────────────────────────────────┘
```

## 1.2 Why Modular Monolith?

| Aspect | Modular Monolith | Microservices |
|--------|------------------|---------------|
| **Development Speed** | Fast | Slower |
| **Deployment** | Simple | Complex |
| **Team Size** | 1-5 developers | 5+ developers |
| **Scalability** | Vertical | Horizontal |
| **Complexity** | Low | High |
| **AI Agent Friendly** | Yes | No |

**Decision:** Modular Monolith for MVP, with clear boundaries for future microservices extraction.

---

# 2. Technology Stack

## 2.1 Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | UI Framework |
| **TypeScript** | 5.x | Type Safety |
| **Vite** | 5.x | Build Tool |
| **Tailwind CSS** | 3.x | Styling |
| **shadcn/ui** | Latest | Component Library |
| **TanStack Query** | 5.x | Server State |
| **React Hook Form** | 7.x | Form Management |
| **Zod** | 3.x | Validation |
| **React Router** | 6.x | Routing |

## 2.2 Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **ASP.NET Core** | 8.x | Web API Framework |
| **Entity Framework Core** | 8.x | ORM |
| **PostgreSQL** | 15+ | Database |
| **JWT** | - | Authentication |
| **BCrypt** | - | Password Hashing |
| **FluentValidation** | 11.x | Server Validation |
| **Serilog** | - | Structured Logging |
| **MediatR** | 12.x | CQRS |

## 2.3 Infrastructure Stack

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Local Development |
| **AWS/Azure** | Cloud Deployment |
| **GitHub Actions** | CI/CD |

---

# 3. Architecture Principles

## 3.1 Core Principles

1. **Clean Architecture** governs project boundaries.
2. **Vertical Slice Architecture** governs feature implementation.
3. Features own their code (self-contained).
4. Shared code belongs in shared packages only.
5. Business logic never lives in controllers or React components.
6. Every feature is independently extendable.
7. Prefer composition over inheritance.
8. Prefer explicit code over clever abstractions.

## 3.2 Dependency Rules

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation                            │
│                         ↓                                   │
│                       API                                   │
│                         ↓                                   │
│                   Application                               │
│                         ↓                                   │
│                     Domain                                  │
│                    ↗    ↑                                   │
│            Infrastructure                                   │
│              (implements Domain)                            │
└─────────────────────────────────────────────────────────────┘
```

**Rules:**
- Domain has no external dependencies
- Application depends only on Domain
- Infrastructure depends on Domain and implements interfaces
- API depends on Application and Infrastructure
- Presentation depends only on API

---

# 4. Architectural Decision Records

## ADR-001: Modular Monolith Over Microservices

**Context:** Need to balance development speed with scalability.

**Decision:** Use a Modular Monolith with clear module boundaries.

**Consequences:**
- ✅ Faster initial development
- ✅ Simpler deployment
- ✅ Single codebase for AI agents
- ✅ Modules can be extracted to microservices later
- ⚠️ Scaling requires vertical scaling initially
- ⚠️ Requires discipline to maintain module boundaries

## ADR-002: Vertical Slice Inside Modules

**Context:** Features should be self-contained and easy to modify.

**Decision:** Each feature contains all layers (API, Application, Domain, Infrastructure).

**Consequences:**
- ✅ Features are independent
- ✅ AI agents modify fewer files
- ✅ Easier to remove features
- ✅ Reduced coupling
- ⚠️ Some code duplication between slices

## ADR-003: React + TypeScript Over Other Options

**Context:** Need modern, maintainable frontend with strong AI support.

**Decision:** React 19 with TypeScript.

**Consequences:**
- ✅ Large ecosystem
- ✅ Strong AI code generation support
- ✅ Excellent TypeScript support
- ✅ Reusable components with shadcn/ui
- ⚠️ Larger bundle sizes than vanilla JS

## ADR-004: PostgreSQL Over Other Databases

**Context:** Need reliable, feature-rich database.

**Decision:** PostgreSQL 15+.

**Consequences:**
- ✅ ACID compliance
- ✅ JSON support for flexible data
- ✅ Excellent indexing capabilities
- ✅ Open source
- ⚠️ Requires careful schema design

## ADR-005: REST APIs Over GraphQL

**Context:** Need simple, well-understood API design.

**Decision:** RESTful APIs with DTOs.

**Consequences:**
- ✅ Simple to implement
- ✅ Well understood
- ✅ Caching friendly
- ✅ Works with HTTP standards
- ⚠️ Multiple endpoints for related data

## ADR-006: JWT Over Session-Based Auth

**Context:** Need stateless, scalable authentication.

**Decision:** JWT with refresh tokens.

**Consequences:**
- ✅ Stateless
- ✅ Scalable
- ✅ Works across domains
- ⚠️ Token invalidation requires strategies

---

# 5. Repository Structure

## 5.1 Monorepo Layout

```
Aurora/
├── apps/
│   ├── api/                 # .NET 8 Backend
│   │   ├── src/
│   │   ├── tests/
│   │   └── Dockerfile
│   └── web/                 # React Frontend
│       ├── src/
│       ├── tests/
│       └── Dockerfile
├── packages/
│   ├── ui/                  # Shared UI Components
│   ├── shared/              # Shared Utilities
│   └── types/               # Shared TypeScript Types
├── docs/
│   ├── architecture/
│   ├── api/
│   └── guides/
├── scripts/
├── docker-compose.yml
├── README.md
└── .github/
    └── workflows/
```

## 5.2 Backend Module Structure

```
api/src/
├── Features/
│   ├── Calendar/
│   │   ├── Commands/
│   │   ├── Queries/
│   │   ├── DTOs/
│   │   ├── Validators/
│   │   ├── Mappings/
│   │   ├── Endpoints/
│   │   ├── Repository/
│   │   └── Services/
│   ├── Appointments/
│   │   └── (same structure)
│   ├── Customers/
│   │   └── (same structure)
│   ├── Dashboard/
│   │   └── (same structure)
│   ├── Staff/
│   │   └── (same structure)
│   ├── Billing/
│   │   └── (same structure)
│   └── Reports/
│       └── (same structure)
├── Shared/
│   ├── Infrastructure/
│   │   ├── Persistence/
│   │   ├── Authentication/
│   │   ├── Logging/
│   │   └── Services/
│   ├── Domain/
│   │   ├── Entities/
│   │   ├── ValueObjects/
│   │   └── Interfaces/
│   └── Constants/
├── Program.cs
├── appsettings.json
└── appsettings.Development.json
```

## 5.3 Frontend Module Structure

```
web/src/
├── app/
│   ├── routes/              # Route definitions
│   └── layouts/             # Layout components
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── types/
│   │   └── validation/
│   ├── appointments/
│   │   └── (same structure)
│   ├── customers/
│   │   └── (same structure)
│   ├── dashboard/
│   │   └── (same structure)
│   └── calendar/
│       └── (same structure)
├── shared/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Layout components
│   │   └── forms/          # Form components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── types/              # Shared types
│   ├── utils/              # Utilities
│   └── constants/          # Constants
├── styles/
├── lib/
│   ├── api-client.ts
│   └── store.ts
├── App.tsx
└── main.tsx
```

---

# 6. Backend Architecture

## 6.1 Clean Architecture Layers

### Domain Layer

```csharp
// Domain Entity
public class Appointment : AggregateRoot
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid CustomerId { get; private set; }
    public Guid StaffId { get; private set; }
    public Guid ServiceId { get; private set; }
    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    public AppointmentStatus Status { get; private set; }
    
    // Domain methods
    public void Confirm() { /* domain logic */ }
    public void Cancel(string reason) { /* domain logic */ }
    public void MarkAsCompleted() { /* domain logic */ }
}

// Value Object
public class AppointmentStatus : ValueObject
{
    public static AppointmentStatus Scheduled = new("Scheduled");
    public static AppointmentStatus Confirmed = new("Confirmed");
    public static AppointmentStatus Completed = new("Completed");
    public static AppointmentStatus Cancelled = new("Cancelled");
    public static AppointmentStatus NoShow = new("NoShow");
}
```

### Application Layer

```csharp
// Use Case
public class CreateAppointmentCommand : IRequest<Result<AppointmentDto>>
{
    public Guid CustomerId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid StaffId { get; set; }
    public DateTime StartTime { get; set; }
    public int Duration { get; set; }
    public string? Notes { get; set; }
}

// Handler
public class CreateAppointmentCommandHandler : IRequestHandler<CreateAppointmentCommand, Result<AppointmentDto>>
{
    private readonly IAppointmentRepository _repository;
    private readonly IStaffAvailabilityService _availabilityService;
    private readonly IMapper _mapper;
    
    public async Task<Result<AppointmentDto>> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
    {
        // Validate availability
        if (!await _availabilityService.IsStaffAvailable(request.StaffId, request.StartTime, request.Duration))
        {
            return Result<AppointmentDto>.Failure("Staff is not available at the requested time");
        }
        
        // Create entity
        var appointment = Appointment.Create(
            request.CustomerId,
            request.StaffId,
            request.ServiceId,
            request.StartTime,
            request.Duration
        );
        
        // Save
        await _repository.AddAsync(appointment);
        
        // Return DTO
        return Result<AppointmentDto>.Success(_mapper.Map<AppointmentDto>(appointment));
    }
}
```

### Infrastructure Layer

```csharp
// Repository Implementation
public class AppointmentRepository : IAppointmentRepository
{
    private readonly ApplicationDbContext _context;
    
    public async Task<Appointment> GetByIdAsync(Guid id, Guid tenantId)
    {
        return await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId);
    }
    
    public async Task<IEnumerable<Appointment>> GetByDateAsync(DateOnly date, Guid tenantId)
    {
        return await _context.Appointments
            .Where(a => a.TenantId == tenantId 
                && a.StartTime.Date == date.ToDateTime(TimeOnly.MinValue).Date)
            .ToListAsync();
    }
}
```

### API Layer

```csharp
// Controller
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IMediator _mediator;
    
    [HttpPost]
    public async Task<ActionResult<AppointmentDto>> CreateAppointment([FromBody] CreateAppointmentCommand command)
    {
        var result = await _mediator.Send(command);
        
        if (!result.IsSuccess)
            return BadRequest(result.Error);
            
        return CreatedAtAction(nameof(GetAppointment), new { id = result.Value.Id }, result.Value);
    }
    
    [HttpGet("today")]
    public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetTodayAppointments()
    {
        var query = new GetTodayAppointmentsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
```

## 6.2 Vertical Slice Structure

Each feature follows this pattern:

```
Feature/
├── Commands/
│   └── CreateFeature/
│       ├── Command.cs
│       ├── Handler.cs
│       ├── Validator.cs
│       └── Mapper.cs
├── Queries/
│   └── GetFeature/
│       ├── Query.cs
│       ├── Handler.cs
│       └── Mapper.cs
├── DTOs/
│   └── FeatureDto.cs
├── Endpoints/
│   └── FeatureEndpoints.cs
└── Repository/
    └── IFeatureRepository.cs
```

---

# 7. Frontend Architecture

## 7.1 Component Hierarchy

```
App
├── Layout
│   ├── Sidebar
│   │   ├── Navigation
│   │   └── UserProfile
│   ├── Header
│   │   ├── Search
│   │   └── Notifications
│   └── MainContent
│       └── Routes
└── Providers
    ├── QueryClientProvider
    ├── AuthProvider
    └── ThemeProvider
```

## 7.2 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      React Component                        │
│                           ↓                                 │
│                    Custom Hook (useQuery)                   │
│                           ↓                                 │
│                  TanStack Query (caching)                   │
│                           ↓                                 │
│                      API Service                            │
│                           ↓                                 │
│                    fetch / axios                            │
│                           ↓                                 │
│                      Backend API                            │
└─────────────────────────────────────────────────────────────┘
```

## 7.3 Page Pattern

```typescript
// features/appointments/pages/AppointmentsPage.tsx
export function AppointmentsPage() {
  const { data, isLoading, error } = useAppointments();
  
  if (isLoading) return <AppointmentsSkeleton />;
  if (error) return <AppointmentsError />;
  if (!data?.length) return <AppointmentsEmpty />;
  
  return (
    <div className="space-y-4">
      <AppointmentsHeader />
      <AppointmentsTable appointments={data} />
    </div>
  );
}
```

## 7.4 Hooks Pattern

```typescript
// features/appointments/hooks/useAppointments.ts
export function useAppointments() {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: () => appointmentService.getToday(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const createAppointment = useMutation({
    mutationFn: appointmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
  
  return {
    appointments: data,
    isLoading,
    error,
    createAppointment,
  };
}
```

## 7.5 Service Pattern

```typescript
// features/appointments/api/appointmentService.ts
export const appointmentService = {
  async getToday(): Promise<Appointment[]> {
    const response = await apiClient.get('/appointments/today');
    return response.data;
  },
  
  async create(data: CreateAppointmentData): Promise<Appointment> {
    const response = await apiClient.post('/appointments', data);
    return response.data;
  },
  
  async update(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    const response = await apiClient.put(`/appointments/${id}`, data);
    return response.data;
  },
};
```

---

# 8. Multi-Tenancy

## 8.1 Tenant Isolation

**Strategy:** Single database, tenant-aware queries.

```csharp
// Tenant Resolution
public class TenantContext
{
    public Guid TenantId { get; set; }
}

// Middleware
public class TenantMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        var tenantId = context.User?.Claims?.FirstOrDefault(c => c.Type == "tenantId")?.Value;
        
        if (!string.IsNullOrEmpty(tenantId))
        {
            context.Items["TenantId"] = tenantId;
        }
        
        await _next(context);
    }
}
```

## 8.2 Database Implementation

```sql
-- Every table includes TenantId
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    customer_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    service_id UUID NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    -- ... other fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for tenant filtering
CREATE INDEX idx_appointments_tenant_id ON appointments(tenant_id);
CREATE INDEX idx_appointments_tenant_date ON appointments(tenant_id, start_time);
```

## 8.3 Repository Pattern with Tenant Filtering

```csharp
public abstract class BaseRepository<T> : IBaseRepository<T> where T : class, ITenantEntity
{
    protected readonly ApplicationDbContext _context;
    protected readonly ITenantContext _tenantContext;
    
    public virtual async Task<T> GetByIdAsync(Guid id)
    {
        return await _context.Set<T>()
            .FirstOrDefaultAsync(e => e.Id == id && e.TenantId == _tenantContext.TenantId);
    }
    
    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _context.Set<T>()
            .Where(e => e.TenantId == _tenantContext.TenantId)
            .ToListAsync();
    }
}
```

---

# 9. Authentication & Authorization

## 9.1 Authentication Flow

```
1. User submits credentials
         ↓
2. Validate credentials
         ↓
3. Generate JWT token (with tenant and roles)
         ↓
4. Return token to client
         ↓
5. Client includes token in Authorization header
         ↓
6. Middleware validates token on each request
         ↓
7. Claims extracted and available in context
```

## 9.2 JWT Implementation

```csharp
public class JwtService
{
    public string GenerateToken(User user, Guid tenantId)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("tenantId", tenantId.ToString()),
        };
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

## 9.3 Authorization

```csharp
[Authorize(Roles = "Owner,Manager")]
public class AppointmentsController : ControllerBase
{
    // Only Owners and Managers can access
}

[Authorize(Policy = "ManageAppointments")]
public class AppointmentManagementController : ControllerBase
{
    // Custom policy-based authorization
}

// Policy definition
services.AddAuthorization(options =>
{
    options.AddPolicy("ManageAppointments", policy =>
        policy.RequireRole("Owner", "Manager", "Receptionist"));
    options.AddPolicy("ViewReports", policy =>
        policy.RequireRole("Owner", "Manager"));
});
```

## 9.4 Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Owner** | Full access, settings, reports, all management |
| **Manager** | All except settings, reports, staff management |
| **Receptionist** | Appointments, customers, basic billing |
| **Staff** | View own schedule, view own appointments |

---

# 10. Database Design

## 10.1 Entity Base

```csharp
public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } // Soft delete
}
```

## 10.2 Core Entities

```csharp
public class Tenant : BaseEntity
{
    public string Name { get; set; }
    public string Subdomain { get; set; }
    public string LogoUrl { get; set; }
    public string Timezone { get; set; }
    public string Currency { get; set; }
    public ICollection<User> Users { get; set; }
}

public class User : BaseEntity
{
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string FullName { get; set; }
    public string Role { get; set; }
    public string Phone { get; set; }
    public bool IsActive { get; set; }
    public DateTime LastLoginAt { get; set; }
}

public class Customer : BaseEntity
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public DateTime? Anniversary { get; set; }
    public string SkinType { get; set; }
    public string Allergies { get; set; }
    public Guid? PreferredStaffId { get; set; }
    public string Notes { get; set; }
    public int TotalVisits { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime? LastVisitAt { get; set; }
}

public class Appointment : BaseEntity
{
    public Guid CustomerId { get; set; }
    public Guid StaffId { get; set; }
    public Guid ServiceId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Status { get; set; }
    public string Notes { get; set; }
    public bool ReminderSent { get; set; }
    public bool NoShow { get; set; }
    public bool IsWalkIn { get; set; }
}
```

## 10.3 Indexing Strategy

```sql
-- Performance-critical indexes
CREATE INDEX idx_appointments_tenant_date ON appointments(tenant_id, start_time);
CREATE INDEX idx_appointments_staff_date ON appointments(staff_id, start_time);
CREATE INDEX idx_customers_tenant_phone ON customers(tenant_id, phone);
CREATE INDEX idx_customers_tenant_name ON customers(tenant_id, first_name, last_name);
CREATE INDEX idx_invoices_tenant_customer ON invoices(tenant_id, customer_id);
```

---

# 11. API Design

## 11.1 RESTful Endpoints

```
/api/v1/
├── auth/
│   ├── POST /login
│   ├── POST /logout
│   └── POST /refresh
├── appointments/
│   ├── GET /
│   ├── GET /today
│   ├── GET /upcoming
│   ├── GET /{id}
│   ├── POST /
│   ├── PUT /{id}
│   ├── PATCH /{id}/status
│   └── DELETE /{id}
├── customers/
│   ├── GET /
│   ├── GET /{id}
│   ├── GET /{id}/timeline
│   ├── POST /
│   ├── PUT /{id}
│   └── DELETE /{id}
├── staff/
│   ├── GET /
│   ├── GET /{id}
│   ├── GET /{id}/schedule
│   ├── POST /
│   └── PUT /{id}
└── billing/
    ├── POST /invoices
    ├── GET /invoices/{id}
    └── PATCH /invoices/{id}/payment
```

## 11.2 Request/Response DTOs

```csharp
// Request DTO
public class CreateAppointmentRequest
{
    public Guid CustomerId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid StaffId { get; set; }
    public DateTime StartTime { get; set; }
    public int Duration { get; set; }
    public string? Notes { get; set; }
}

// Response DTO
public class AppointmentResponse
{
    public Guid Id { get; set; }
    public string CustomerName { get; set; }
    public string ServiceName { get; set; }
    public string StaffName { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Status { get; set; }
    public decimal Revenue { get; set; }
}

// Paginated Response
public class PaginatedResponse<T>
{
    public IEnumerable<T> Items { get; set; }
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}
```

## 11.3 API Standards

```csharp
// Response wrapper
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
    public List<ValidationError> Errors { get; set; }
}

// Error response
public class ErrorResponse
{
    public string Type { get; set; }     // "validation", "business", "server"
    public string Title { get; set; }
    public int Status { get; set; }
    public string Detail { get; set; }
    public Dictionary<string, string[]> Errors { get; set; }
}
```

---

# 12. Validation Strategy

## 12.1 Client Validation (Zod)

```typescript
// features/appointments/validation/appointmentSchema.ts
export const appointmentSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),
  serviceId: z.string().uuid("Invalid service ID"),
  staffId: z.string().uuid("Invalid staff ID"),
  startTime: z.string()
    .datetime("Invalid date format")
    .refine(date => new Date(date) > new Date(), {
      message: "Start time must be in the future",
    }),
  duration: z.number()
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration must be at most 480 minutes"),
  notes: z.string().optional(),
});

// Usage in form
const { register, handleSubmit } = useForm({
  resolver: zodResolver(appointmentSchema),
});
```

## 12.2 Server Validation (FluentValidation)

```csharp
public class CreateAppointmentValidator : AbstractValidator<CreateAppointmentCommand>
{
    public CreateAppointmentValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty()
            .WithMessage("Customer ID is required")
            .NotEqual(Guid.Empty)
            .WithMessage("Invalid customer ID");
            
        RuleFor(x => x.ServiceId)
            .NotEmpty()
            .WithMessage("Service ID is required");
            
        RuleFor(x => x.StaffId)
            .NotEmpty()
            .WithMessage("Staff ID is required");
            
        RuleFor(x => x.StartTime)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Start time must be in the future");
            
        RuleFor(x => x.Duration)
            .InclusiveBetween(15, 480)
            .WithMessage("Duration must be between 15 and 480 minutes");
            
        // Business rules
        RuleFor(x => x)
            .Custom((request, context) =>
            {
                if (!_availabilityService.IsStaffAvailable(request.StaffId, request.StartTime, request.Duration))
                {
                    context.AddFailure("Staff is not available at the requested time");
                }
                
                if (!_serviceExists(request.ServiceId))
                {
                    context.AddFailure("Service does not exist");
                }
            });
    }
}
```

---

# 13. Error Handling

## 13.1 Global Exception Middleware

```csharp
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            await HandleValidationException(context, ex);
        }
        catch (BusinessException ex)
        {
            await HandleBusinessException(context, ex);
        }
        catch (Exception ex)
        {
            await HandleUnexpectedException(context, ex);
        }
    }
    
    private async Task HandleValidationException(HttpContext context, ValidationException ex)
    {
        var response = new ErrorResponse
        {
            Type = "validation",
            Title = "Validation Error",
            Status = 400,
            Detail = "One or more validation errors occurred",
            Errors = ex.Errors.ToDictionary(e => e.PropertyName, e => e.ErrorMessage)
        };
        
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(response);
    }
    
    private async Task HandleBusinessException(HttpContext context, BusinessException ex)
    {
        var response = new ErrorResponse
        {
            Type = "business",
            Title = "Business Rule Violation",
            Status = 400,
            Detail = ex.Message,
            Errors = new Dictionary<string, string[]>()
        };
        
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(response);
    }
}
```

## 13.2 Result Pattern

```csharp
public class Result<T>
{
    public bool IsSuccess { get; private set; }
    public T Value { get; private set; }
    public string Error { get; private set; }
    
    public static Result<T> Success(T value) => new() { IsSuccess = true, Value = value };
    public static Result<T> Failure(string error) => new() { IsSuccess = false, Error = error };
}

// Usage
public async Task<Result<Appointment>> CreateAppointment(CreateAppointmentCommand command)
{
    if (!_availabilityService.IsStaffAvailable(...))
        return Result<Appointment>.Failure("Staff not available");
        
    var appointment = Appointment.Create(...);
    return Result<Appointment>.Success(appointment);
}
```

---

# 14. Logging & Monitoring

## 14.1 Structured Logging (Serilog)

```csharp
// Configuration
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/aurora-.txt", rollingInterval: RollingInterval.Day)
    .Enrich.FromLogContext()
    .CreateLogger();

// Usage
_logger.LogInformation(
    "Appointment created {AppointmentId} for customer {CustomerId}",
    appointment.Id,
    appointment.CustomerId
);

// With context
using (LogContext.PushProperty("TenantId", tenantId))
{
    _logger.LogInformation("User logged in {UserId}", userId);
}
```

## 14.2 Critical Events to Log

| Event | Priority | Context |
|-------|----------|---------|
| Authentication failures | High | User, IP, reason |
| Appointment creation | Medium | Appointment ID, staff, customer |
| Payment processing | High | Invoice ID, amount, method |
| Unexpected exceptions | Critical | Stack trace, request details |
| Data modifications | Medium | Entity, old value, new value |
| System startup/shutdown | Medium | Timestamp |

---

# 15. State Management

## 15.1 Server State (TanStack Query)

```typescript
// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Query usage
const { data, isLoading, error } = useQuery({
  queryKey: ['appointments', 'today'],
  queryFn: getTodayAppointments,
});

// Mutation usage
const mutation = useMutation({
  mutationFn: createAppointment,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    toast.success('Appointment created!');
  },
  onError: (error) => {
    toast.error('Failed to create appointment');
  },
});
```

## 15.2 Form State (React Hook Form)

```typescript
function CreateAppointmentForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(appointmentSchema),
  });
  
  const onSubmit = async (data) => {
    await mutation.mutateAsync(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('customerId')} />
      {errors.customerId && <span>{errors.customerId.message}</span>}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Appointment'}
      </Button>
    </form>
  );
}
```

---

# 16. Performance Optimization

## 16.1 Frontend Optimizations

| Strategy | Implementation | Priority |
|----------|---------------|----------|
| **Lazy Loading** | `React.lazy()` for routes | High |
| **Code Splitting** | Route-based chunks | High |
| **Memoization** | `React.memo()`, `useMemo()`, `useCallback()` | Medium |
| **Virtual Lists** | `react-window` for large lists | Medium |
| **Image Optimization** | Lazy loading, CDN | Low |

## 16.2 Backend Optimizations

| Strategy | Implementation | Priority |
|----------|---------------|----------|
| **Caching** | Redis for frequent queries | High |
| **Pagination** | All list endpoints paginated | High |
| **Indexing** | Proper database indexes | High |
| **Async** | Always use async/await | High |
| **Compression** | Response compression | Medium |

## 16.3 Database Optimization

```sql
-- Index all foreign keys
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);

-- Index date ranges
CREATE INDEX idx_appointments_start_time ON appointments(start_time);

-- Partial indexes for common filters
CREATE INDEX idx_appointments_today ON appointments(start_time, status)
WHERE status IN ('scheduled', 'confirmed');

-- Use JSON for flexible data
ALTER TABLE customers ADD COLUMN preferences JSONB;
CREATE INDEX idx_customers_preferences ON customers USING gin(preferences);
```

---

# 17. Security

## 17.1 Security Checklist

| Requirement | Implementation |
|-------------|---------------|
| **Authentication** | JWT with secure storage |
| **Authorization** | Role-based access control |
| **Password Hashing** | BCrypt (12 rounds) |
| **Input Validation** | Both client and server |
| **SQL Injection** | Entity Framework (parameterized) |
| **XSS Prevention** | React auto-escapes |
| **CSRF Protection** | JWT token, SameSite cookies |
| **Rate Limiting** | Prevent brute force attacks |
| **HTTPS** | Always in production |
| **Audit Logs** | Critical actions logged |

## 17.2 Rate Limiting

```csharp
services.AddRateLimiter(options =>
{
    options.AddPolicy("login", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress,
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(15)
            }));
});

[EnableRateLimiting("login")]
[HttpPost("login")]
public async Task<IActionResult> Login(LoginRequest request)
{
    // Implementation
}
```

---

# 18. AI Integration

## 18.1 AI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Service Layer                       │
│  (Business logic for AI features)                          │
├─────────────────────────────────────────────────────────────┤
│                   AI Provider Interface                     │
│  (Abstraction for AI providers)                            │
├─────────────────────────────────────────────────────────────┤
│                  AI Provider Implementation                 │
│  (OpenAI, Gemini, Azure OpenAI)                            │
└─────────────────────────────────────────────────────────────┘
```

## 18.2 Interface Design

```csharp
public interface IAIService
{
    Task<Opportunity[]> DetectOpportunitiesAsync(Guid tenantId);
    Task<CampaignSuggestion> GenerateCampaignAsync(CampaignRequest request);
    Task<Insight[]> GenerateInsightsAsync(Guid tenantId);
}

public class OpenAIService : IAIService
{
    private readonly OpenAIClient _client;
    private readonly ITenantContext _tenantContext;
    
    public async Task<Opportunity[]> DetectOpportunitiesAsync(Guid tenantId)
    {
        // Get data
        var data = await _dataService.GetBusinessDataAsync(tenantId);
        
        // Build prompt
        var prompt = BuildOpportunityPrompt(data);
        
        // Call OpenAI
        var response = await _client.ChatCompleteAsync(prompt);
        
        // Parse and return
        return ParseOpportunities(response);
    }
}
```

## 18.3 AI Provider Abstraction

```csharp
public enum AIProvider
{
    OpenAI,
    Gemini,
    AzureOpenAI
}

public interface IAIFactory
{
    IAIService Create(AIProvider provider);
}

public class AIFactory : IAIFactory
{
    public IAIService Create(AIProvider provider)
    {
        return provider switch
        {
            AIProvider.OpenAI => new OpenAIService(),
            AIProvider.Gemini => new GeminiService(),
            AIProvider.AzureOpenAI => new AzureOpenAIService(),
            _ => throw new ArgumentException("Unsupported provider")
        };
    }
}
```

---

# 19. Deployment

## 19.1 Docker Configuration

```dockerfile
# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "Aurora.API.dll"]
```

```dockerfile
# Frontend Dockerfile
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## 19.2 Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: aurora
      POSTGRES_USER: aurora
      POSTGRES_PASSWORD: aurora
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  backend:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    environment:
      ConnectionStrings__Default: "Host=postgres;Database=aurora;Username=aurora;Password=aurora"
    ports:
      - "5000:8080"
    depends_on:
      - postgres
  
  frontend:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

# 20. Coding Standards

## 20.1 Backend (C#)

```csharp
// ✅ Good: Clean, explicit, with good naming
public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _repository;
    private readonly ILogger<AppointmentService> _logger;
    
    public AppointmentService(IAppointmentRepository repository, ILogger<AppointmentService> logger)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
    
    public async Task<Result<AppointmentDto>> CreateAsync(CreateAppointmentCommand command)
    {
        // Validate
        var validationResult = await ValidateAsync(command);
        if (!validationResult.IsSuccess)
            return Result<AppointmentDto>.Failure(validationResult.Error);
        
        // Create
        var appointment = Appointment.Create(command);
        await _repository.AddAsync(appointment);
        
        // Log
        _logger.LogInformation("Created appointment {AppointmentId}", appointment.Id);
        
        // Return
        return Result<AppointmentDto>.Success(appointment.ToDto());
    }
}

// ❌ Bad: Unclear, unvalidated, poor naming
public class ApptService
{
    private readonly IAppointmentRepository _repo;
    
    public async Task<Appointment> Add(Appointment a)
    {
        await _repo.AddAsync(a);
        return a;
    }
}
```

## 20.2 Frontend (TypeScript/React)

```typescript
// ✅ Good: Clean, typed, componentized
interface AppointmentCardProps {
  appointment: Appointment;
  onUpdate?: (appointment: Appointment) => void;
  onCancel?: (id: string) => void;
}

export const AppointmentCard = memo(({ appointment, onUpdate, onCancel }: AppointmentCardProps) => {
  const statusColors: Record<AppointmentStatus, string> = {
    scheduled: 'bg-blue-50 border-blue-500',
    confirmed: 'bg-green-50 border-green-500',
    completed: 'bg-gray-50 border-gray-500',
    cancelled: 'bg-red-50 border-red-500',
    'no-show': 'bg-yellow-50 border-yellow-500',
  };
  
  return (
    <div className={cn(
      'p-4 border-l-4 rounded-lg shadow-sm',
      statusColors[appointment.status]
    )}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{appointment.customerName}</h3>
          <p className="text-sm text-muted-foreground">{appointment.serviceName}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => onUpdate?.(appointment)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onCancel?.(appointment.id)}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
});

// ❌ Bad: No types, inline styles, unclear
function AppointmentCard({ data, update, cancel }) {
  return (
    <div style={{padding: 16, borderLeft: '3px solid blue'}}>
      <div>
        <span>{data.customer}</span>
      </div>
    </div>
  );
}
```

---

# 21. Definition of Done

## 21.1 Feature Completion Checklist

A feature is complete only if it satisfies **all** of the following:

- [ ] **Compiles** without errors or warnings
- [ ] **Types** are correct and fully typed
- [ ] **Validation** implemented on both client and server
- [ ] **Responsive** works on desktop and tablet
- [ ] **Accessible** WCAG 2.1 AA compliant
- [ ] **Loading state** displays while data loads
- [ ] **Empty state** displays when no data
- [ ] **Error state** displays with helpful message
- [ ] **Documentation** updated (API docs, README)
- [ ] **No TODOs** in code
- [ ] **No duplicated code** (DRY)
- [ ] **Tests** pass (unit/integration)
- [ ] **Performance** meets targets (< 3s load)
- [ ] **Audit logs** for critical actions
- [ ] **Code review** completed
- [ ] **Branch** merged to main

## 21.2 Testing Requirements

| Test Type | Coverage Target | Purpose |
|-----------|----------------|---------|
| **Unit Tests** | 70%+ | Core business logic |
| **Integration Tests** | Critical paths | API endpoints, database |
| **E2E Tests** | Core flows | User journeys |
| **Performance Tests** | Key pages | Load times |
| **Security Tests** | All endpoints | Vulnerabilities |

---

# 22. Accelerator Scope

## 22.1 Implemented Features (v1)

| Feature | Status | Notes |
|---------|--------|-------|
| **Authentication** | ✅ | Login, JWT, roles |
| **Dashboard** | ✅ | Metrics, AI insights |
| **Calendar** | ✅ | Week/day views |
| **Appointments** | ✅ | CRUD, status |
| **Customers** | ✅ | Profile, history |
| **Staff** | ✅ | Profiles, schedule |
| **Services** | ✅ | Service catalog |
| **Billing** | ✅ | Invoices, payments |
| **Reports** | ✅ | Basic analytics |
| **Online Booking** | ✅ | Public booking |
| **WhatsApp** | ✅ | Notifications |

## 22.2 Planned Features (v2+)

| Feature | Target | Complexity |
|---------|--------|------------|
| **Inventory Management** | v2 | High |
| **Payroll** | v2 | High |
| **Advanced AI Analytics** | v2 | High |
| **AI Receptionist** | v2.5 | Very High |
| **Voice AI** | v3 | Very High |
| **Mobile Apps** | v2 | High |
| **Multi-Branch** | v3 | Very High |
| **Marketing Automation** | v2 | Medium |
| **CRM** | v2 | Medium |
| **Demand Forecasting** | v2.5 | High |

---

# Appendix

## A.1 Folder Structure Quick Reference

### Backend
```
api/src/
├── Features/
│   └── {Feature}/
│       ├── Commands/
│       ├── Queries/
│       ├── DTOs/
│       ├── Validators/
│       ├── Mappings/
│       ├── Endpoints/
│       ├── Repository/
│       └── Services/
├── Shared/
│   ├── Infrastructure/
│   ├── Domain/
│   └── Constants/
└── Program.cs
```

### Frontend
```
web/src/
├── features/
│   └── {feature}/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── types/
│       └── validation/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
└── App.tsx
```

## A.2 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Components** | PascalCase | `AppointmentCard` |
| **Hooks** | use + PascalCase | `useAppointments` |
| **Functions** | camelCase | `createAppointment` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_APPOINTMENTS` |
| **Types** | PascalCase | `AppointmentStatus` |
| **Files** | kebab-case | `appointment-card.tsx` |
| **Classes** | PascalCase | `AppointmentService` |
| **Interfaces** | I + PascalCase | `IAppointmentRepository` |

## A.3 Environment Variables

### Backend
```env
# .env
ASPNETCORE_ENVIRONMENT=Development
ConnectionStrings__Default=Host=localhost;Database=aurora;Username=postgres;Password=postgres
Jwt__Secret=your-super-secret-key
Jwt__Issuer=https://localhost:5000
Jwt__Audience=https://localhost:5000
Twilio__AccountSid=your-sid
Twilio__AuthToken=your-token
Twilio__WhatsAppNumber=whatsapp:+14155238886
```

### Frontend
```env
# .env
VITE_API_URL=http://localhost:5000/api/v1
VITE_WHATSAPP_BOOKING_API_KEY=your-key
```

---

## A.4 API Response Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "customerName": "Anita Singh",
    "serviceName": "HydraFacial",
    "staffName": "Priya Sharma",
    "startTime": "2026-05-24T11:00:00Z",
    "endTime": "2026-05-24T12:00:00Z",
    "status": "confirmed",
    "revenue": 2500
  }
}
```

### Validation Error
```json
{
  "type": "validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "One or more validation errors occurred",
  "errors": {
    "startTime": ["Start time must be in the future"],
    "staffId": ["Staff is not available at the requested time"]
  }
}
```

### Business Rule Violation
```json
{
  "type": "business",
  "title": "Business Rule Violation",
  "status": 400,
  "detail": "Cannot cancel appointment within 24 hours of start time",
  "errors": {}
}
```

---

*This document is the architectural source of truth for Aurora Accelerator. All implementation decisions should align with the principles, patterns, and standards defined here.*