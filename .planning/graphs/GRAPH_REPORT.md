# Graph Report - boost  (2026-11-05)

## Corpus Check
- 182 files · ~85,090 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 670 file(s) not represented in the graph (top: .dll 542, .so 42, .cache 24)

## Summary
- 1305 nodes · 2516 edges · 88 communities (70 shown, 18 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 112 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- FurniNest.Api.Models
- SignalRService
- pulseflow-ui/package.json
- frontend/package.json
- AuthController
- ActionResult
- pulseflow-ui
- Task
- JobStatus
- Fact
- Order
- NotificationService
- catalog.component.ts
- LoginComponent
- AuthService
- Product
- ref_angular_router
- ref_angular_core
- Antigravity `/teamwork` Action Explained in Simple Words
- ProductDetailComponent
- User
- Job
- Guid
- FurniNestDbContext
- schematics
- PulseFlow.Tests
- http
- OrderDto
- EmailOtp
- Order
- RegisterComponent
- Boost Action Explained in Simple Words
- ProductReview
- GSD Core — The Complete Encyclopedia of Every Command
- .GetCart
- PulseHub
- DateTime
- OrderItem
- AdminDashboardComponent
- Coupon
- Payment
- furninest.models.ts
- CartService
- MyOrdersComponent
- 🛋️ FurniNest — Modern Furniture E-Commerce & Operations Platform
- PulseFlow Explained in Simple Words
- WishlistItem
- FurniNest.Api.csproj
- UserPasskey
- http
- CatalogComponent
- Category
- EmailService.cs
- build
- production
- NavbarComponent
- WishlistService
- OrderConfirmationComponent
- PulseflowUi
- .CreateReview
- frontend/angular.json
- Frontend
- CheckoutComponent
- CelebrationService
- 14. Code Review, Quality Gates & Security
- 16. Knowledge Graphs & Context
- CartDrawerComponent
- 10. Milestone Management & Summaries
- 15. Specialized Phase Designers
- 17. Multi-Workspaces & Orchestration
- 2. Project Setup & Onboarding
- 6. Ideas, Notes & Todos (Capture System)
- .ValidateCoupon
- development
- frontend
- HomeComponent
- WishlistComponent
- 18. System Health, Revert & Maintenance
- 19. Settings, Profiles & Surface Management
- 3. Phase Discussion & Planning
- 9. Roadmap Surgery & Reordering
- 11. Progress Tracking & Sessions
- 12. User Acceptance Testing & Verification
- 13. Shipping, Pull Requests & Git
- 5. Quick Tasks & Inline Fixes
- 1. Smart Entry & Navigation

## God Nodes (most connected - your core abstractions)
1. `Job` - 58 edges
2. `FurniNestDbContext` - 41 edges
3. `Order` - 35 edges
4. `Product` - 35 edges
5. `AuthService` - 34 edges
6. `User` - 31 edges
7. `LoginComponent` - 26 edges
8. `GSD Core — The Complete Encyclopedia of Every Command` - 23 edges
9. `FurniNest.Api.Models` - 22 edges
10. `NotificationService` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Frontend (`/frontend`)` --references--> `authGuard()`  [INFERRED]
  FurniNest/README.md → FurniNest/frontend/src/app/guards/auth.guard.ts
- `Frontend (`/frontend`)` --references--> `adminGuard()`  [INFERRED]
  FurniNest/README.md → FurniNest/frontend/src/app/guards/auth.guard.ts
- `Frontend (`/frontend`)` --references--> `authInterceptor()`  [INFERRED]
  FurniNest/README.md → FurniNest/frontend/src/app/interceptors/auth.interceptor.ts
- `AdminController` --references--> `FurniNestDbContext`  [EXTRACTED]
  FurniNest/backend/Controllers/AdminController.cs → FurniNest/backend/Data/FurniNestDbContext.cs
- `AuthController` --references--> `FurniNestDbContext`  [EXTRACTED]
  FurniNest/backend/Controllers/AuthController.cs → FurniNest/backend/Data/FurniNestDbContext.cs

## Import Cycles
- None detected.

## Communities (88 total, 18 thin omitted)

### Community 0 - "FurniNest.Api.Models"
Cohesion: 0.09
Nodes (10): FurniNest.Api.Services, FurniNest.Api.Models, PulseFlow.Api.Data, FurniNest.Api.DTOs, PulseFlow.Tests, PulseFlow.Api.Hubs, PulseFlow.Api.Models, FurniNest.Api.Controllers (+2 more)

### Community 1 - "SignalRService"
Cohesion: 0.08
Nodes (11): App, appConfig, DashboardComponent, CancelJobRequest, ConnectionStatus, CreateJobRequest, Job, JobProgressTickData (+3 more)

### Community 2 - "pulseflow-ui/package.json"
Cohesion: 0.04
Nodes (44): dependencies, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, @microsoft/signalr (+36 more)

### Community 3 - "frontend/package.json"
Cohesion: 0.05
Nodes (43): dependencies, @angular/animations, @angular/cdk, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/material (+35 more)

### Community 4 - "AuthController"
Cohesion: 0.11
Nodes (18): AuthController, AuthResponse, ForgotPasswordRequest, LoginRequest, OtpSentResponse, PasskeyChallengeResponse, PasskeyLoginChallengeRequest, PasskeyLoginVerifyRequest (+10 more)

### Community 5 - "ActionResult"
Cohesion: 0.13
Nodes (11): AdminController, CategoriesController, CouponsController, ProductsController, WishlistController, AdminDashboardStatsDto, CustomerSummaryDto, CategoryDto (+3 more)

### Community 6 - "pulseflow-ui"
Cohesion: 0.06
Nodes (37): build, serve, test, builder, configurations, defaultConfiguration, options, cli (+29 more)

### Community 7 - "Task"
Cohesion: 0.16
Nodes (4): IJobRepository, JobRepository, JobProcessorBackgroundService, JobRepositoryTests

### Community 8 - "JobStatus"
Cohesion: 0.14
Nodes (8): JobStatus, Canceled, Failed, Queued, Running, Succeeded, JobStateMachine, JobStateMachineTests

### Community 10 - "Fact"
Cohesion: 0.15
Nodes (6): CancelJobRequest, CreateJobRequest, Program, IJobNotificationService, JobApiIntegrationTests, PulseHubTests

### Community 11 - "Order"
Cohesion: 0.07
Nodes (26): Order, CarrierName, City, CouponCode, CreatedAt, DeliveredAt, DiscountAmount, Id (+18 more)

### Community 12 - "NotificationService"
Cohesion: 0.12
Nodes (6): ConfirmDialogComponent, ConfirmDialogData, ToastContainerComponent, NotificationService, Toast, @angular/material

### Community 13 - "catalog.component.ts"
Cohesion: 0.14
Nodes (6): AdminStats, Category, CustomerSummary, Product, AdminService, ProductService

### Community 15 - "AuthService"
Cohesion: 0.14
Nodes (5): AuthResponse, OtpSentResponse, PasskeyChallengeResponse, User, AuthService

### Community 16 - "Product"
Cohesion: 0.09
Nodes (22): Product, AdditionalImagesJson, CartItems, Category, CategoryId, Color, CreatedAt, Description (+14 more)

### Community 17 - "ref_angular_router"
Cohesion: 0.15
Nodes (8): App, appConfig, routes, FooterComponent, adminGuard(), authGuard(), authInterceptor(), Frontend (`/frontend`)

### Community 18 - "ref_angular_core"
Cohesion: 0.26
Nodes (5): Coupon, CouponValidationResult, ConfettiParticle, CouponService, environment

### Community 19 - "Antigravity `/teamwork` Action Explained in Simple Words"
Cohesion: 0.10
Nodes (19): 1. Hand-off & Intake, 2. Scoping & Interview (The Lead Agent), 3. Dynamic Blueprinting, 4. Isolated Git Workspaces, 5. Adversarial Review (No Blind Agreement), 6. Synthesis & Milestone Checkpoint, Antigravity `/teamwork` Action Explained in Simple Words, 🔴 Cons (Disadvantages & Trade-offs) (+11 more)

### Community 21 - "User"
Cohesion: 0.11
Nodes (17): User, Address, CartItems, City, CreatedAt, Email, FullName, Id (+9 more)

### Community 22 - "Job"
Cohesion: 0.13
Nodes (11): PulseFlowDbContext, Jobs, Job, CompletedAt, CreatedAt, ErrorMessage, Id, Name (+3 more)

### Community 23 - "Guid"
Cohesion: 0.25
Nodes (3): IJobCancellationManager, JobCancellationManager, JobCancellationManagerTests

### Community 24 - "FurniNestDbContext"
Cohesion: 0.15
Nodes (14): DbInitializer, FurniNestDbContext, CartItems, Categories, Coupons, EmailOtps, OrderItems, Orders (+6 more)

### Community 25 - "schematics"
Cohesion: 0.12
Nodes (17): schematics, skipTests, skipTests, skipTests, skipTests, skipTests, skipTests, skipTests (+9 more)

### Community 26 - "PulseFlow.Tests"
Cohesion: 0.14
Nodes (14): PulseFlow.Api, net10.0, Microsoft.AspNetCore.OpenApi (10.0.2), Microsoft.EntityFrameworkCore.Sqlite (10.0.14), Microsoft.NET.Sdk.Web, PulseFlow.Tests, net10.0, coverlet.collector (6.0.4) (+6 more)

### Community 27 - "http"
Cohesion: 0.13
Nodes (15): ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, applicationUrl, commandName (+7 more)

### Community 28 - "OrderDto"
Cohesion: 0.31
Nodes (6): OrdersController, CancelOrderRequest, CheckoutDto, OrderDto, OrderItemDto, UpdateOrderStatusDto

### Community 29 - "EmailOtp"
Cohesion: 0.15
Nodes (11): EmailOtp, Attempts, CreatedAt, Email, ExpiresAt, Id, IsUsed, OtpCode (+3 more)

### Community 30 - "Order"
Cohesion: 0.23
Nodes (3): InvoiceModalComponent, Order, OrderService

### Community 32 - "Boost Action Explained in Simple Words"
Cohesion: 0.14
Nodes (13): Boost Action Explained in Simple Words, ⚙️ How Boost Works During Implementation, 🎯 Main Uses of Boost Action, ⚖️ Pros and Cons of the Boost Action, 🚦 Quick Decision Guide: When to Use What, Stage 1: Deep Context & Goal Analysis, Stage 2: Strategic Planning (Multi-Perspective Thinking), Stage 3: Phased Atomic Execution (+5 more)

### Community 33 - "ProductReview"
Cohesion: 0.14
Nodes (13): ProductReview, Comment, CreatedAt, Id, ImageUrl, IsVerifiedPurchase, Product, ProductId (+5 more)

### Community 34 - "GSD Core — The Complete Encyclopedia of Every Command"
Cohesion: 0.14
Nodes (13): 20. Namespace Routers, 4. Phase Execution, 7. Debugging & Forensics, 8. Spikes & UI Sketches (Prototyping), `/gsd-autonomous`, GSD Core — The Complete Encyclopedia of Every Command, `/gsd-debug "<symptom>"`, `/gsd-execute-phase <N>` (+5 more)

### Community 35 - ".GetCart"
Cohesion: 0.36
Nodes (5): CartController, AddToCartDto, CartItemDto, CartSummaryDto, UpdateCartItemDto

### Community 37 - "DateTime"
Cohesion: 0.17
Nodes (9): WishlistItemDto, CartItem, AddedAt, Id, Product, ProductId, Quantity, User (+1 more)

### Community 38 - "OrderItem"
Cohesion: 0.17
Nodes (11): OrderItem, Id, Order, OrderId, Product, ProductId, ProductImageUrl, ProductName (+3 more)

### Community 40 - "Coupon"
Cohesion: 0.18
Nodes (10): Coupon, Code, CreatedAt, Description, DiscountPercent, ExpiresAt, Id, IsActive (+2 more)

### Community 41 - "Payment"
Cohesion: 0.18
Nodes (10): Payment, Amount, CardLastFour, Id, Order, OrderId, PaidAt, PaymentMethod (+2 more)

### Community 42 - "furninest.models.ts"
Cohesion: 0.33
Nodes (5): CartItem, OrderItem, ProductReview, ProductReviewsSummary, ReviewService

### Community 45 - "🛋️ FurniNest — Modern Furniture E-Commerce & Operations Platform"
Cohesion: 0.18
Nodes (10): 🛒 1. Customer Storefront, 🛡️ 2. Admin Operations Desk, 🏛️ Architecture & Technologies, Backend (`/backend`), 🔑 Demo Accounts (Pre-Seeded), 🛋️ FurniNest — Modern Furniture E-Commerce & Operations Platform, 🚀 How to Run, 🌟 Key Features (+2 more)

### Community 46 - "PulseFlow Explained in Simple Words"
Cohesion: 0.18
Nodes (10): 1. The Old, Bad Way (Without this project pattern):, 2. The PulseFlow Way (How our app works):, 💼 3 Real-Life Business Examples, Example 1: YouTube Video Uploads, Example 2: Bank Statement Download, Example 3: Bulk Email / SMS Campaigns, PulseFlow Explained in Simple Words, 🎯 Summary (+2 more)

### Community 47 - "WishlistItem"
Cohesion: 0.20
Nodes (7): WishlistItem, AddedAt, Id, Product, ProductId, User, UserId

### Community 48 - "FurniNest.Api.csproj"
Cohesion: 0.20
Nodes (8): net10.0, Microsoft.AspNetCore.OpenApi (10.0.2), Microsoft.EntityFrameworkCore.Sqlite (10.0.14), Microsoft.NET.Sdk.Web, BCrypt.Net-Next (4.2.0), Microsoft.AspNetCore.Authentication.JwtBearer (10.0.14), Microsoft.EntityFrameworkCore.Design (10.0.14), SendGrid (9.29.3)

### Community 49 - "UserPasskey"
Cohesion: 0.20
Nodes (9): UserPasskey, Counter, CreatedAt, CredentialId, DeviceName, Id, PublicKey, User (+1 more)

### Community 50 - "http"
Cohesion: 0.20
Nodes (9): ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, profiles, http (+1 more)

### Community 52 - "Category"
Cohesion: 0.22
Nodes (7): Category, Description, Id, ImageUrl, Name, Products, Slug

### Community 53 - "EmailService.cs"
Cohesion: 0.25
Nodes (3): EmailService, IEmailService, TokenService

### Community 54 - "build"
Cohesion: 0.22
Nodes (9): build, builder, configurations, defaultConfiguration, options, assets, browser, styles (+1 more)

### Community 55 - "production"
Cohesion: 0.22
Nodes (9): serve, production, architect, budgets, buildTarget, outputHashing, builder, configurations (+1 more)

### Community 59 - "PulseflowUi"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, PulseflowUi, Running end-to-end tests, Running unit tests

### Community 60 - ".CreateReview"
Cohesion: 0.43
Nodes (4): ReviewsController, CreateReviewRequest, ProductReviewDto, ProductReviewsSummaryDto

### Community 61 - "frontend/angular.json"
Cohesion: 0.25
Nodes (7): cli, analytics, packageManager, newProjectRoot, projects, $schema, version

### Community 62 - "Frontend"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, Frontend, Running end-to-end tests, Running unit tests

### Community 65 - "14. Code Review, Quality Gates & Security"
Cohesion: 0.29
Nodes (7): 14. Code Review, Quality Gates & Security, `/gsd-add-tests <phase> [instructions]`, `/gsd-audit-fix --source <audit-file>`, `/gsd-code-review <phase>`, `/gsd-eval-review [phase]`, `/gsd-secure-phase [phase]`, `/gsd-ui-review [phase]`

### Community 66 - "16. Knowledge Graphs & Context"
Cohesion: 0.29
Nodes (7): 16. Knowledge Graphs & Context, `/gsd-extract-learnings <phase>`, `/gsd-graphify [action]`, `/gsd-mempalace-recall` & `/gsd-mempalace-capture`, `/gsd-profile-user`, `/gsd-stats`, `/gsd-thread`

### Community 68 - "10. Milestone Management & Summaries"
Cohesion: 0.33
Nodes (6): 10. Milestone Management & Summaries, `/gsd-audit-milestone [version]`, `/gsd-cleanup`, `/gsd-complete-milestone <version>`, `/gsd-milestone-summary [version]`, `/gsd-new-milestone "<name>"`

### Community 69 - "15. Specialized Phase Designers"
Cohesion: 0.33
Nodes (6): 15. Specialized Phase Designers, `/gsd-ai-integration-phase [phase]`, `/gsd-explore`, `/gsd-mvp-phase <phase>`, `/gsd-spec-phase <phase>`, `/gsd-ui-phase [phase]`

### Community 70 - "17. Multi-Workspaces & Orchestration"
Cohesion: 0.33
Nodes (6): 17. Multi-Workspaces & Orchestration, `/gsd-inbox`, `/gsd-manager`, `/gsd-review-backlog`, `/gsd-workspace`, `/gsd-workstreams`

### Community 71 - "2. Project Setup & Onboarding"
Cohesion: 0.33
Nodes (6): 2. Project Setup & Onboarding, `/gsd-import`, `/gsd-ingest-docs`, `/gsd-map-codebase`, `/gsd-new-project`, `/gsd-onboard`

### Community 72 - "6. Ideas, Notes & Todos (Capture System)"
Cohesion: 0.33
Nodes (6): 6. Ideas, Notes & Todos (Capture System), `/gsd-capture`, `/gsd-capture --backlog "<description>"`, `/gsd-capture --list [area]`, `/gsd-capture --note <text>`, `/gsd-capture --seed "<idea with trigger>"`

### Community 73 - ".ValidateCoupon"
Cohesion: 0.50
Nodes (3): CouponDto, CouponValidationResultDto, ValidateCouponRequest

### Community 74 - "development"
Cohesion: 0.40
Nodes (5): development, buildTarget, extractLicenses, optimization, sourceMap

### Community 75 - "frontend"
Cohesion: 0.40
Nodes (5): prefix, projectType, root, sourceRoot, frontend

### Community 78 - "18. System Health, Revert & Maintenance"
Cohesion: 0.40
Nodes (5): 18. System Health, Revert & Maintenance, `/gsd-docs-update`, `/gsd-health`, `/gsd-undo`, `/gsd-update`

### Community 79 - "19. Settings, Profiles & Surface Management"
Cohesion: 0.40
Nodes (5): 19. Settings, Profiles & Surface Management, `/gsd-config`, `/gsd-help`, `/gsd-settings`, `/gsd-surface`

### Community 80 - "3. Phase Discussion & Planning"
Cohesion: 0.40
Nodes (5): 3. Phase Discussion & Planning, `/gsd-discuss-phase <N>`, `/gsd-plan-phase <N>`, `/gsd-plan-review-convergence <phase>`, `/gsd-ultraplan-phase [phase]`

### Community 81 - "9. Roadmap Surgery & Reordering"
Cohesion: 0.40
Nodes (5): 9. Roadmap Surgery & Reordering, `/gsd-phase --edit <number>`, `/gsd-phase --insert <after> "<title>"`, `/gsd-phase --remove <number>`, `/gsd-phase "<title>"`

### Community 82 - "11. Progress Tracking & Sessions"
Cohesion: 0.50
Nodes (4): 11. Progress Tracking & Sessions, `/gsd-pause-work`, `/gsd-progress`, `/gsd-resume-work`

### Community 83 - "12. User Acceptance Testing & Verification"
Cohesion: 0.50
Nodes (4): 12. User Acceptance Testing & Verification, `/gsd-audit-uat`, `/gsd-validate-phase [phase]`, `/gsd-verify-work [phase]`

### Community 84 - "13. Shipping, Pull Requests & Git"
Cohesion: 0.50
Nodes (4): 13. Shipping, Pull Requests & Git, `/gsd-pr-branch [target]`, `/gsd-review --phase <N>`, `/gsd-ship [phase]`

### Community 85 - "5. Quick Tasks & Inline Fixes"
Cohesion: 0.50
Nodes (4): 5. Quick Tasks & Inline Fixes, `/gsd-fast "<description>"`, `/gsd-quick-batch`, `/gsd-quick "<description>"`

### Community 86 - "1. Smart Entry & Navigation"
Cohesion: 0.67
Nodes (3): 1. Smart Entry & Navigation, `/gsd-next`, `/gsd-progress --do "<description>"` (Smart Intent Router)

## Knowledge Gaps
- **214 isolated node(s):** `Users`, `Categories`, `Products`, `CartItems`, `Orders` (+209 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 598 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FurniNestDbContext` connect `FurniNestDbContext` to `FurniNest.Api.Models`, `AuthController`, `ActionResult`, `Order`, `Product`, `User`, `Job`, `OrderDto`, `EmailOtp`, `ProductReview`, `.GetCart`, `DateTime`, `OrderItem`, `Coupon`, `Payment`, `WishlistItem`, `UserPasskey`, `Category`, `.CreateReview`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `Job` (e.g. with `.CreateAsync_And_GetByIdAsync_WorkCorrectly()` and `.DeleteAsync_RemovesJobFromDatabase()`) actually correct?**
  _`Job` has 15 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Users`, `Categories`, `Products` to the rest of the system?**
  _214 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `FurniNest.Api.Models` be split into smaller, more focused modules?**
  _Cohesion score 0.08961038961038961 - nodes in this community are weakly interconnected._
- **Why does `@angular/material` connect `NotificationService` to `ref_angular_core`, `frontend/package.json`, `furninest.models.ts`, `catalog.component.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `SignalRService` be split into smaller, more focused modules?**
  _Cohesion score 0.08326530612244898 - nodes in this community are weakly interconnected._
- **Why does `Order` connect `Order` to `DateTime`, `OrderItem`, `Payment`, `WishlistItem`, `Category`, `User`, `FurniNestDbContext`, `OrderDto`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._