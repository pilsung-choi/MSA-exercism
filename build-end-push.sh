#! /bin/bash
docker buildx build --platform linux/amd64,linux/arm64 -t (아직 모름) -f apps/gateway/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t (아직 모름) -f apps/notification/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t (아직 모름) -f apps/order/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t (아직 모름) -f apps/payment/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t (아직 모름) -f apps/product/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t (아직 모름) -f apps/user/Dockerfile --target production .

docker push (아직 모름):latest
docker push (아직 모름):latest
docker push (아직 모름):latest
docker push (아직 모름):latest
docker push (아직 모름):latest
docker push (아직 모름):latest