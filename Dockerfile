FROM node:lts-alpine AS builder
WORKDIR /var/webcron

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

RUN yarn build

# RUNNER
FROM node:lts-alpine AS runner
WORKDIR /var/webcron

COPY package.json yarn.lock ./
ARG NODE_ENV=production
RUN yarn install --frozen-lockfile && yarn cache clean

COPY --from=builder /var/webcron/build/ ./

RUN adduser -S webcron
USER webcron

ENTRYPOINT [ "node", "index.js" ]
