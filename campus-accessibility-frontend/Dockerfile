# ============================================================
# Stage 1: build — Node, compile το React/Vite app σε static files
# ============================================================
FROM node:22-alpine AS build

WORKDIR /app

# Copy μόνο τα manifest files πρώτα (καλύτερο layer caching)
COPY package*.json ./
RUN npm install

COPY . .

# Vite env vars "ψήνονται" στο bundle κατά το build — περνάνε ως build args
ARG VITE_API_URL
ARG VITE_API_BASE_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ============================================================
# Stage 2: serve — μόνο Nginx + τα static build artifacts
# ============================================================
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
