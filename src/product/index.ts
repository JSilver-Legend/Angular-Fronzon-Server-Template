import { authMiddleware } from '../auth';
import { ProductModel } from './product';

export * from './product';

export const setupProductEndpoint = (finale: any) => {
  const productResource = finale.resource({
    model: ProductModel,
    endpoints: ['/products', '/products/:id'],
  });
  productResource.all.auth(authMiddleware);
};
