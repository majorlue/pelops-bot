FROM node:16-alpine3.16 as build
WORKDIR /app
# copy files needed for installation and transpilation
COPY package*.json tsconfig.json ./
# prisma files needed to generate prisma client for accessing db
COPY prisma/schema.prisma ./prisma/schema.prisma
# install dependencies
RUN npm install
# copy src files after installing deps -- allows deps caching if they're unchanged
COPY ./src ./src
# transpile typescript, then remove node modules and install only runtime deps
RUN npm run build \
    && rm -rf node_modules \
    && npm ci --omit-dev

# - - - FRESH BUILD STAGE - - -
FROM node:16-alpine3.16 as deploy
WORKDIR /home/node/app
# copy runtime files with perms for user 'node' (included in node docker image)
COPY --chown=node:node --from=build /app/build ./build
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node package*.json *.config.js ./
COPY --chown=node:node prisma ./prisma/
RUN chown -h node:node .
# execute start command as user 'node'
USER node
CMD [ "npm", "start" ]