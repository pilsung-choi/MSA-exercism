FROM node:alpine AS development

WORKDIR /usr/src/app

# package.json 복사
COPY package*.json ./

# pnpm-lock.yaml
COPY pnpm-lock.yaml ./

RUN npm i -g pnpm

# Dependency 설치
RUN pnpm i

COPY . .

CMD ["pnpm", "start:dev", "order"]