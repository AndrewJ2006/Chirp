Chirp
# Chirp

Features
## Features

- User authentication and authorization using **JWT + Spring Security**
- Create, like, and delete posts
- Follow and unfollow users
- Personalized feeds based on followed accounts
- Real-time notifications for likes, follows, and new activity using **WebSockets**
- High-performance feed caching with **Redis**
- RESTful API design
- Fully containerized with **Docker**
- Automated CI/CD pipeline using **GitHub Actions**


## Architecture Overview

- **Spring Boot** handles business logic, authentication, and REST APIs.
- **PostgreSQL** stores user data, posts, and relationships.
- **Redis** caches user feeds to reduce database load and improve response times (≈60% improvement).
- **WebSockets** enable real-time notifications for likes, follows, and other events.
- **React + TypeScript** provide a responsive and interactive frontend.
- **Docker** ensures consistent development and deployment environments.
- **GitHub Actions** automatically builds and tests the application on each push.


## Authentication

Chirp uses **JWT-based authentication**:
- Users authenticate via REST endpoints.
- JWTs are issued and validated on protected routes.
- Spring Security enforces role-based access and endpoint protection.

### Backend
- Java
- Spring Boot
- Spring Security
- PostgreSQL
- Redis
- WebSockets
- REST APIs

### Frontend
- React
- TypeScript

### DevOps
- Docker
- GitHub Actions (CI/CD)


### Prerequisites
- Docker & Docker Compose
- Java 17+


### Run Locally

```bash
git clone https://github.com/your-username/chirp.git
cd chirp
docker-compose up --build
```


<img width="1905" height="1088" alt="Screenshot From 2026-02-07 10-45-26" src="https://github.com/user-attachments/assets/37af9ac5-1875-4ac9-b170-cd3b8a9254ae" />
<img width="1905" height="1088" alt="Screenshot From 2026-02-07 10-43-44" src="https://github.com/user-attachments/assets/24a60486-9814-4328-8aab-42181a548e5a" />
<img width="1905" height="1088" alt="Screenshot From 2026-02-07 10-44-47" src="https://github.com/user-attachments/assets/385a0202-183c-45b4-bfb4-f1f8bd12d685" />
<img width="1905" height="1088" alt="Screenshot From 2026-02-07 10-45-02" src="https://github.com/user-attachments/assets/730428b4-9dde-4c2d-b852-53761ab0965d" />
<img width="1905" height="1088" alt="Screenshot From 2026-02-07 10-45-26" src="https://github.com/user-attachments/assets/37af9ac5-1875-4ac9-b170-cd3b8a9254ae" />