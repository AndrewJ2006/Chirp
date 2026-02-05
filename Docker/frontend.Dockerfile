FROM node:20-alpine AS build
WORKDIR /app

COPY Frontend/package.json Frontend/package.json
COPY Frontend/package-lock.json Frontend/package-lock.json

RUN cd Frontend && npm ci

COPY Frontend /app/Frontend

ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN cd Frontend && npm run build

FROM nginx:1.25-alpine
COPY Docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/Frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
