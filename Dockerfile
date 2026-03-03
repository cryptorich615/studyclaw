FROM node:20

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Install TypeScript and Prisma
RUN npm install -D typescript prisma @types/node @types/express tsx

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npx tsc

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]
