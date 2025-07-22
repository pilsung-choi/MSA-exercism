FROM node:alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

RUN npm i -g pnpm
# Dependency 설치
RUN pnpm i

# 프로젝트 빌드에 필요한 폴더 가져오기
COPY apps/gateway apps/gateway
COPY libs libs

# 프로젝트 빌드
RUN pnpm build gateway

CMD ["pnpm", "start:dev", "gateway"]

FROM node:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm i -g pnpm
RUN pnpm install --prod

COPY --from=development /usr/src/app/dist ./dist
COPY proto proto

CMD [ "node", "dist/apps/gateway/main" ]