FROM node:16-alpine3.16 as base
WORKDIR /app

COPY package*.json tsconfig.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm ci --quiet

COPY ./src ./src

FROM base AS build
WORKDIR /app

RUN npm run build \
    && rm -rf node_modules \
    && npm ci --omit-dev

FROM node:16-alpine3.16 as deploy
WORKDIR /home/node/app

COPY --chown=node:node --from=build /app/build ./build
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node package*.json *.config.js ./
COPY --chown=node:node prisma ./prisma/

RUN npm install -g pm2
RUN chown -h node:node .
USER node