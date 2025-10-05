FROM node:24.9.0-alpine3.22 AS build

COPY ./ /app
WORKDIR /app

# Build Vaunch into /app/dist
RUN npm ci && npm run build

FROM nginx:1.29-alpine
EXPOSE 80
COPY --from=build /app/dist /usr/share/nginx/html
