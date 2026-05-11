# Backend Microservices Assessment

This repository contains the backend implementation for three distinct microservices. The architecture is built using Node.js and Express, strictly following a modular and clean structure without over-engineering.

## Projects Overview

1. **Logging Middleware (`/logging_middleware`)**
   - An easily reusable Express middleware library.
   - Collects incoming requests and safely sends error and information logs to the Evaluation Service API.
   - Designed for efficiency and performs all log dispatches asynchronously without hindering the primary request flow.

2. **Campus Notifications Microservice (`/notification_app_be`)**
- Retrieves notifications from the Evaluation Service pertaining to events, results, and placements on campus.
   - Has an algorithm to score the notifications according to their type’s significance and timestamp.
   - For more information regarding the architecture and schema, refer to `notification_system_design.md`.
   - 
3. **Vehicle Maintenance Scheduler (`/vehicle_maintenance_scheduler`)**
Scheduling engine for depot maintenance activities:
- Employs 0/1 Knapsack Dynamic Programming approach to maximize maintenance benefits based on total available manpower at each respective depot.
- Connects via external API integration to acquire real-time information about the depot and associated vehicle tasks.

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

