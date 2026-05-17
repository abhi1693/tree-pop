# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS deps
WORKDIR /app

ENV DO_NOT_TRACK=1

COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app

ENV DO_NOT_TRACK=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
