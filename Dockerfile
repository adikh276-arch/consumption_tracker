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

# Install dependencies needed for the server at runtime
# We need node and npm/npx in the runtime image too
RUN apk add nodejs npm

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/src/lib/db.ts ./src/lib/db.ts
COPY --from=builder /app/database ./database
COPY --from=builder /app/scripts/generateTranslations.ts ./scripts/generateTranslations.ts

RUN npm ci --only=production

COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 80

ENV DATABASE_URL=$DATABASE_URL
ENV NEON_PROJECT_ID=$NEON_PROJECT_ID
ENV NEON_API_KEY=$NEON_API_KEY

CMD ["./start.sh"]
