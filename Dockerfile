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

# DO App Platform PM2 patch
# https://github.com/Unitech/pm2/issues/4360#issuecomment-738100628
# https://github.com/Unitech/pm2/issues/5045#issuecomment-823698083
RUN apk --no-cache add procps
RUN sed -i 's/pidusage(pids, function retPidUsage(err, statistics) {/pidusage(pids, { usePs: true }, function retPidUsage(err, statistics) {/' /usr/local/lib/node_modules/pm2/lib/God/ActionMethods.js

RUN chown -h node:node .
USER node