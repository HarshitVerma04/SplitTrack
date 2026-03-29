# Product Requirements Document (PRD)

## Product Name

SplitTrack (working title)

---

## 1. Overview

SplitTrack is a cross-platform expense-sharing application designed to help users track shared expenses, calculate balances, and simplify debt settlements within groups or between individuals.

The application allows users to:

* Record shared expenses
* Split costs using multiple methods
* Track who owes whom
* Minimize number of transactions required to settle debts
* Receive notifications for updates and reminders

---

## 2. Problem Statement

Users frequently split expenses in real life (friends, roommates, trips), but tracking balances manually is:

* error-prone
* inconvenient
* hard to maintain over time

Existing solutions exist but may lack:

* real-time updates
* intuitive UX
* region-specific optimization (e.g., India use case)
* transparency in calculations

---

## 3. Goals

### Primary Goals

* Enable users to easily track shared expenses
* Automatically compute balances between users
* Reduce complexity of settling debts
* Provide a clean and intuitive user experience

### Secondary Goals

* Demonstrate strong full-stack engineering
* Implement scalable backend architecture
* Include real-time synchronization
* Provide analytics and reporting

---

## 4. Target Users

* College students
* Roommates
* Friend groups
* Travelers
* Small teams

Users are known contacts (not strangers).

---

## 5. Platforms

* Mobile-first design
* Web application (primary implementation)
* Optional mobile support later

---

## 6. Core Features

### 6.1 User Authentication

* Sign up via:

  * Email
  * Phone number
  * Google OAuth
* Login system with JWT authentication
* Single account per user

---

### 6.2 User Discovery

* Add users via:

  * Phone number
  * Username search
* Invite users if not registered

---

### 6.3 Groups

* Create and manage groups
* Add/remove members
* Multiple groups per user

---

### 6.4 Expense Management

Users can:

* Add expenses
* Edit expenses
* Delete expenses

Each expense includes:

* Amount
* Description
* Participants
* Split method
* Optional receipt image

---

### 6.5 Expense Splitting Methods

Support:

1. Equal split
2. Custom amount split
3. Percentage split
4. Itemised split

---

### 6.6 Individual Expense Tracking

* Track expenses between two users without a group

---

### 6.7 Balance Calculation

System calculates:

* Total owed per user
* Net balances between users

Example:
User A owes User B ₹200

---

### 6.8 Debt Simplification

Minimize number of transactions required to settle debts.

Example:

* A owes B ₹500
* B owes C ₹500
  → A pays C ₹500

Use graph-based optimization algorithm.

---

### 6.9 Notifications

In-app notifications for:

* New expenses
* Expense edits
* Settlement requests
* Reminders

---

### 6.10 Analytics

Provide:

* Monthly spending summary
* Category-wise breakdown
* Group-level insights

---

### 6.11 Export

Users can export:

* CSV reports
* PDF summaries

---

### 6.12 Receipt Handling (Optional Advanced Feature)

* Upload receipt images
* OCR-based amount extraction

---

### 6.13 Comments & Tagging

* Users can comment on expenses
* Tag other users

---

### 6.14 Privacy & Security

* Only group members can see group expenses
* Maintain audit logs for edits

---

### 6.15 Offline Support (Optional)

* Allow offline expense entry
* Sync when connection is restored

---

## 7. Non-Functional Requirements

### Performance

* Fast API response (<300ms for most operations)

### Scalability

* Designed for up to 1000 users (project scope: ~100 users)

### Reliability

* Ensure data consistency in balance calculations

### Security

* JWT authentication
* Input validation
* Secure data storage

---

## 8. Technical Requirements

### Backend

* Language: Java
* Framework: Spring Boot
* Architecture:

  * Controller layer
  * Service layer
  * Repository layer

---

### Database

* PostgreSQL

Core Tables:

* Users
* Groups
* GroupMembers
* Expenses
* ExpenseSplits
* Balances
* Settlements
* Notifications

---

### Frontend

* Framework: React
* UI Library: Fluent UI (Microsoft)
* Features:

  * Responsive design
  * Clean modern UI

---

### Real-Time Communication

* WebSockets for live updates

---

### Storage

* Cloud storage for images (AWS S3 or equivalent)

---

### APIs

RESTful APIs:

Examples:

* POST /auth/signup
* POST /auth/login
* GET /groups
* POST /expenses
* GET /balances
* POST /settlements

---

## 9. System Architecture

Frontend (React + Fluent UI)
→ API Layer
→ Backend (Spring Boot)
→ Database (PostgreSQL)

Optional:
→ WebSocket server for real-time updates

---

## 10. Key Algorithms

### 10.1 Balance Calculation

Aggregate all expenses and splits to compute net balances.

---

### 10.2 Debt Simplification

Use graph-based algorithm to minimize number of transactions.

Approach:

* Compute net balance per user
* Use greedy or priority queue method to match creditors and debtors

---

## 11. UX Requirements

* Minimal and clean interface
* Easy expense entry
* Clear display of balances
* Intuitive navigation

---

## 12. Future Enhancements

* UPI integration
* Push notifications
* Mobile apps (Android/iOS)
* AI-based expense categorization
* Advanced analytics

---

## 13. Success Metrics

* Users can add expense within 10 seconds
* Accurate balance calculation
* Reduced number of manual calculations
* Smooth UI experience

---

## 14. Constraints

* No real money handling (only tracking)
* Single currency (INR)
* Limited scale (college-level project)

---

## 15. Deliverables

* Fully functional web app
* Backend API
* Database schema
* Documentation
* Deployment (optional)

---
