# Backend Microservices Assessment

This repository contains the backend implementation for three distinct microservices. The architecture is built using Node.js and Express, strictly following a modular and clean structure without over-engineering.

## Projects Overview

1. **Logging Middleware (`/logging_middleware`)**
   - A reusable Express middleware package.
   - Captures incoming requests and safely forwards error/info logs to the centralized Evaluation Service API.
   - Built to be lightweight and strictly handles asynchronous log dispatching without blocking the main request cycle.

2. **Campus Notifications Microservice (`/notification_app_be`)**
   - Fetches campus notifications (Events, Results, Placements) from the Evaluation Service.
   - Implements a priority-scoring algorithm to sort notifications based on their type weight and recency.
   - See `notification_system_design.md` for the complete system architecture, database schema, and scaling strategies.

3. **Vehicle Maintenance Scheduler (`/vehicle_maintenance_scheduler`)**
   - A scheduling engine for depot maintenance tasks.
   - Uses a 0/1 Knapsack Dynamic Programming algorithm to maximize the maintenance impact within the available mechanic hours at each depot.
   - Integrates with external APIs to fetch depot and vehicle task data dynamically.

## Tech Stack
- **Node.js**
- **Express.js**
- **Axios** (for external API communication)
- **Dotenv** (for environment variable management)

## Setup and Running Locally

1. Clone the repository.
2. Navigate to the specific microservice folder you want to run (e.g., `cd logging_middleware`).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Make sure your `.env` file is configured with your `ACCESS_TOKEN` and `PORT`.
5. Start the development server:
   ```bash
   npm run dev
   ```

---

## API Testing & Validation

Below are the successful test results for the external Evaluation Service endpoints:

### Notifications API
<img width="1083" height="995" alt="Screenshot 2026-05-11 134919" src="https://github.com/user-attachments/assets/93feebb1-d929-4f78-9990-7f7cb646e69c" />


### Local Logger Middleware Test
<img width="1440" height="773" alt="Screenshot 2026-05-11 131316" src="https://github.com/user-attachments/assets/39e0bed8-3f46-41fe-a037-f75b99b321dd" />


### Vehicles API
<img width="1085" height="989" alt="Screenshot 2026-05-11 134808" src="https://github.com/user-attachments/assets/682ea434-8413-4e1f-9d68-63359d24ad8a" />


### Depots API
<img width="1084" height="958" alt="Screenshot 2026-05-11 134719" src="https://github.com/user-attachments/assets/32bb56b0-e815-4ab6-af07-335f59c5c3fe" />


### Logs Submission API
<img width="1435" height="874" alt="Screenshot 2026-05-11 134230" src="https://github.com/user-attachments/assets/5fdb3e17-1167-4eba-8d5e-d4f586c89e91" />

