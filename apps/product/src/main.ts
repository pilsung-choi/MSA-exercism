import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ProductMicroservice } from '@app/common';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ProductMicroservice.protobufPackage,
      protoPath: join(process.cwd(), 'proto/product.proto'),
      url: configService.getOrThrow('GRPC_URL'),
    },
  });
  await app.init();

  await app.startAllMicroservices();
}
bootstrap();
