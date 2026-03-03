FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source
COPY dist ./dist/
COPY prisma ./prisma/

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]
