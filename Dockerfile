# build
FROM node:20-alpine AS build
WORKDIR /app

# Datadog RUM 환경변수를 빌드 시점에 받기
ARG VITE_DD_RUM_APP_ID
ARG VITE_DD_RUM_CLIENT_TOKEN
ARG VITE_DD_SITE=datadoghq.com
ARG VITE_DD_ENV=demo
ARG VITE_APP_VERSION=0.1.0

# ARG를 ENV로 변환하여 Vite가 인식할 수 있도록 함
ENV VITE_DD_RUM_APP_ID=$VITE_DD_RUM_APP_ID
ENV VITE_DD_RUM_CLIENT_TOKEN=$VITE_DD_RUM_CLIENT_TOKEN
ENV VITE_DD_SITE=$VITE_DD_SITE
ENV VITE_DD_ENV=$VITE_DD_ENV
ENV VITE_APP_VERSION=$VITE_APP_VERSION

COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# serve
FROM nginx:1.25-alpine
COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
