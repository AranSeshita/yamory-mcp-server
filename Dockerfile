FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src/ src/
RUN npm run build

FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && chown -R node:node /app
COPY --from=builder --chown=node:node /app/dist/ dist/
USER node
ENTRYPOINT ["node", "dist/index.js"]
