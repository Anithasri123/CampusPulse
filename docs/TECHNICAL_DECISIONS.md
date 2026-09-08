# CampusPulse — Technical Decisions & Architecture Rationale

This document details the engineering and architectural decisions behind **CampusPulse**, a real-time campus event discovery and registration platform.

---

## 1. Core Technology Stack Selection

### 1.1 Frontend: React + Vite
- **Component-Based UI:** Encourages modular, re-usable component design (e.g., `EventCard`, `Navbar`, `Modal`, `AuthContext`).
- **Declarative State Management:** React’s hooks (`useState`, `useEffect`, `useContext`) handle dynamic client state such as active filters, authentication context, and real-time updates smoothly.
- **Fast Development & Build Cycles:** Vite provides instant HMR (Hot Module Replacement) during development and highly efficient bundled output using Rollup for production.
- **Client-Side Routing:** React Router v6 enables seamless Single Page Application (SPA) navigation without full-page browser reloads.

### 1.2 Backend: Node.js + Express
- **Single-Language Ecosystem:** Using JavaScript across both frontend and backend accelerates development and simplifies context switching.
- **Non-Blocking I/O:** Ideal for event-driven asynchronous operations like handling HTTP REST requests, database queries, and WebSocket connections simultaneously.
- **Express Middleware Architecture:** Provides a clean pipeline for HTTP request processing including security headers (Helmet), rate limiting, request parsing, authentication verification, and centralized error handling.

### 1.3 Database: MongoDB + Mongoose
- **Flexible Document Schema:** Campus events feature semi-structured metadata (dates, locations, categories, tags, dynamic participant lists). MongoDB documents mirror JSON structures natively.
- **Schema Validation & Mapping:** Mongoose provides strict schema validation, type enforcement, hook execution (e.g., password hashing hooks), and population of relational references.
- **Document Model vs Relational:** While SQL is suited for complex multi-table transactional queries, MongoDB document models excel at fast single-document lookups and atomic field updates suitable for event detail views and participant rosters.

---

## 2. API & Communication Protocols

### 2.1 REST API as the Source of Truth
REST endpoints serve as the authoritative protocol for all core data operations, mutations, and authentication:
- `POST /api/auth/register` & `POST /api/auth/login`
- `GET /api/events`, `POST /api/events`, `PUT /api/events/:id`
- `POST /api/events/:id/register`, `DELETE /api/events/:id/register`

Mutations (such as registering for an event) pass through full REST validation pipelines (JWT verification, capacity check, deadline check, duplicate registration check, and database update) before returning structured HTTP responses.

### 2.2 Socket.IO for Real-Time Updates
Polling REST APIs frequently for live participant counts creates unnecessary server load and network overhead. Socket.IO provides bi-directional WebSocket communication for immediate UI updates.

**Flow of a Real-Time Mutation:**
```text
React Client
    │ (1) POST /api/events/:id/register
    ▼
Express REST Route
    │ (2) Perform database mutation & atomic update
    ▼
MongoDB Database
    │ (3) Persistence success
    ▼
Socket.IO Engine
    │ (4) Emit 'participant-count-updated' to room 'event:<id>'
    ▼
All Connected Clients in Room
    │ (5) Receive event & update UI state in real-time
```

*Note: Socket.IO is strictly an event notification layer and does not directly execute database mutations.*

### 2.3 Event-Specific Socket Rooms
Instead of broadcasting event changes to every connected socket client (which causes network noise and poor performance), Socket.IO **Rooms** isolate traffic:
- Room naming scheme: `event:<eventId>`
- When a user navigates to an event details page, the client joins `event:<eventId>`.
- When navigating away, the client leaves the room.
- Broadcasts (`participant-count-updated`, `event-updated`, `event-cancelled`) are scoped strictly to subscribers of that specific event room.

---

## 3. Data Integrity & Race Conditions

### 3.1 Conditional Atomic Updates for Capacity Control
In high-concurrency scenarios (e.g., a popular campus concert with limited capacity), two students might attempt to register at the exact same millisecond when only 1 slot remains.

Traditional check-then-write logic:
1. `event = await Event.findById(id)` (Capacity: 100, Current: 99)
2. `if (event.registeredCount < event.capacity)`
3. `event.registeredCount += 1; await event.save()`

If two requests execute step 1 simultaneously, both pass step 2 and over-subscribe the event (101/100).

**CampusPulse Solution:**
Mongoose/MongoDB atomic operators (`$inc`) coupled with query preconditions:
```javascript
const updatedEvent = await Event.findOneAndUpdate(
  { _id: eventId, registeredCount: { $lt: capacity } },
  { $inc: { registeredCount: 1 } },
  { new: true }
);
```
If the event reached capacity between the check and update, the atomic query returns `null`, allowing the server to cleanly reject the second request with `400 Event is full`.

### 3.2 Database-Level Duplicate Registration Prevention
To prevent a single student from registering multiple times for the same event:
- A compound unique index is created on the `Registration` collection:
  ```javascript
  registrationSchema.index({ user: 1, event: 1 }, { unique: true });
  ```
- Even if frontend or controller checks are bypassed, MongoDB rejects duplicate insertions with code `11000`, enforcing data integrity at the database layer.

---

## 4. Security & Authentication Architecture

### 4.1 Stateless JWT Authentication
- **Bearer Token Pattern:** Clients store the JWT in `localStorage` and transmit it via the `Authorization: Bearer <token>` header.
- **Decoupled & Scalable:** Server does not store session state in memory, allowing easy horizontal scaling.
- **Middleware Extraction:** Express `protect` middleware decodes tokens, verifies signatures with `JWT_SECRET`, and populates `req.user` for downstream controllers.

### 4.2 Role-Based Access Control (RBAC)
- Users are assigned roles (`student` vs `admin`).
- Backend routes use authorization middleware (e.g., `restrictTo('admin')`) to protect administrative capabilities (event creation, editing, cancellation, participant roster viewing).
- Frontend routes use protected wrapper components (`ProtectedRoute`, `AdminRoute`) for UI navigation flow, while the backend serves as the security boundary.

### 4.3 Password Security
- Passwords are hashed using `bcryptjs` with a salt factor of 10 prior to storage.
- Passwords are explicitly excluded from default query projections (`select: '-password'`).

### 4.4 HTTP Hardening & Rate Limiting
- **Helmet:** Global Express middleware that sets security-focused HTTP headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, etc.).
- **Rate Limiting:** `express-rate-limit` protects sensitive authentication endpoints (`/api/auth/login` and `/api/auth/register`) against brute-force attacks by limiting requests to 20 per 15-minute window per IP.

---

## 5. Architectural Tradeoffs & System Boundaries

| Architecture Choice | Tradeoff / Consequence | Rationale for CampusPulse |
| :--- | :--- | :--- |
| **Monolith vs. Microservices** | Single deployment artifact vs decoupled microservices. | Monolith avoids overhead of distributed tracing, network latency between microservices, and deployment complexity for a single application domain. |
| **REST vs. GraphQL** | Fixed endpoint payloads vs dynamic client field selection. | REST endpoints provide straightforward caching, clear endpoint semantics, and minimal setup for a campus event schema. |
| **JWT vs. Server-Side Sessions** | Stateless verification vs instant token revocation. | JWT simplifies deployment (no Redis session store required) while fulfilling session requirement (`JWT_EXPIRES_IN=7d`). |
| **Socket.IO vs. SSE / Raw WebSockets** | Higher abstraction payload vs fallback transport protocols. | Socket.IO provides built-in room management, auto-reconnection, and fallbacks out of the box. |
