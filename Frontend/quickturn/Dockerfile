# Tahap 1: Build (Lingkungan Node.js)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Tahap 2: Production (Lingkungan Nginx)
FROM nginx:stable-alpine

# [FIXED] Salin config Nginx custom lu ke dalem container
# Ini bakal nimpa config default si Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin hasil build dari tahap sebelumnya
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]