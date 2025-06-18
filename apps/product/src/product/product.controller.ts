import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetProductsInfo } from './dto/get-product-info.dto';
import { RpcInterceptor } from '@app/common/interceptor/rpc.interceptor';
import { ProductMicroservice } from '@app/common';

@Controller('product')
@ProductMicroservice.ProductServiceControllerMethods()
export class ProductController
  implements ProductMicroservice.ProductServiceController
{
  constructor(private readonly productService: ProductService) {}

  async createSample() {
    const resp = await this.productService.createSamples();

    return {
      success: resp,
    };
  }

  async getProductInfo(request: ProductMicroservice.GetProductInfoRequest) {
    const resp = await this.productService.getProductsInfo(request.productIds);
    return {
      products: resp,
    };
  }
}
