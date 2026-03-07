FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate translations since they are not committed to git
RUN npx tsx scripts/generateTranslations.ts

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy the built assets to the subpath directory
COPY --from=builder /app/dist /usr/share/nginx/html/consumption_tracker

RUN rm /etc/nginx/conf.d/default.conf
COPY vite-nginx.conf /etc/nginx/conf.d/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
