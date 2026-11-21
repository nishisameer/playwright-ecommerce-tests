import { type APIRequestContext, type APIResponse } from '@playwright/test';

/**
 * Small API client for the AutomationExercise practice API.
 *
 * Note: this API always returns HTTP 200 and puts the real status in the body
 * as "responseCode". Its Content-Type is also not always application/json,
 * so we parse the text ourselves. Real APIs have quirks like this too:
 * the client hides them so the tests stay readable.
 */
export interface ApiProduct {
  id: number;
  name: string;
  price: string; // e.g. "Rs. 500"
  brand: string;
  category: { usertype: { usertype: string }; category: string };
}

export interface ApiBody {
  responseCode: number;
  message?: string;
  products?: ApiProduct[];
  brands?: { id: number; brand: string }[];
}

export class ProductsApi {
  constructor(private readonly request: APIRequestContext) {}

  private async parse(response: APIResponse): Promise<ApiBody> {
    return JSON.parse(await response.text()) as ApiBody;
  }

  async getAllProducts(): Promise<{ response: APIResponse; body: ApiBody }> {
    const response = await this.request.get('/api/productsList');
    return { response, body: await this.parse(response) };
  }

  async postToProductsList(): Promise<{ response: APIResponse; body: ApiBody }> {
    const response = await this.request.post('/api/productsList');
    return { response, body: await this.parse(response) };
  }

  async getAllBrands(): Promise<{ response: APIResponse; body: ApiBody }> {
    const response = await this.request.get('/api/brandsList');
    return { response, body: await this.parse(response) };
  }

  async searchProduct(term?: string): Promise<{ response: APIResponse; body: ApiBody }> {
    const response = await this.request.post('/api/searchProduct', {
      form: term === undefined ? {} : { search_product: term },
    });
    return { response, body: await this.parse(response) };
  }

  async verifyLogin(email: string, password: string): Promise<{ response: APIResponse; body: ApiBody }> {
    const response = await this.request.post('/api/verifyLogin', {
      form: { email, password },
    });
    return { response, body: await this.parse(response) };
  }
}
