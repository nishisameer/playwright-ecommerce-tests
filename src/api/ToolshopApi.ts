import { type APIRequestContext, type APIResponse } from '@playwright/test';

/**
 * API client for the Toolshop REST API: the "page object" of the API world.
 * Endpoints and auth handling live here, so tests read like:
 *
 *   const token = await api.login(email, password);
 *   const me = await api.getMe(token);
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  in_stock?: boolean;
  brand: { id: string; name: string };
  category: { id: string; name: string };
}

export interface Paginated<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  product_id: string;
  product?: Product;
}

export interface Cart {
  id: string;
  cart_items: CartItem[];
}

export class ToolshopApi {
  constructor(private readonly request: APIRequestContext) {}

  private authHeader(token?: string): Record<string, string> {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ----- Products -----

  async getProducts(params: Record<string, string | number> = {}): Promise<APIResponse> {
    return this.request.get('/products', { params });
  }

  async getProduct(id: string): Promise<APIResponse> {
    return this.request.get(`/products/${id}`);
  }

  async searchProducts(query: string): Promise<APIResponse> {
    return this.request.get('/products/search', { params: { q: query } });
  }

  async getBrands(): Promise<APIResponse> {
    return this.request.get('/brands');
  }

  async getCategories(): Promise<APIResponse> {
    return this.request.get('/categories');
  }

  /** Convenience: find one product by exact name (searching by name). */
  async findProductByName(name: string): Promise<Product> {
    const response = await this.searchProducts(name);
    const body = (await response.json()) as Paginated<Product>;
    const product = body.data.find((p) => p.name === name);
    if (!product) throw new Error(`Product "${name}" not found through the API`);
    return product;
  }

  // ----- Users / auth -----

  async loginRaw(email: string, password: string): Promise<APIResponse> {
    return this.request.post('/users/login', { data: { email, password } });
  }

  /** Logs in and returns the access token (fails loudly if login fails). */
  async login(email: string, password: string): Promise<string> {
    const response = await this.loginRaw(email, password);
    if (response.status() !== 200) {
      throw new Error(`API login failed for ${email}: ${response.status()} ${await response.text()}`);
    }
    const body = (await response.json()) as { access_token: string };
    return body.access_token;
  }

  async getMe(token?: string): Promise<APIResponse> {
    return this.request.get('/users/me', { headers: this.authHeader(token) });
  }

  async getInvoices(token?: string): Promise<APIResponse> {
    return this.request.get('/invoices', { headers: this.authHeader(token) });
  }

  // ----- Cart -----

  async createCart(): Promise<APIResponse> {
    return this.request.post('/carts');
  }

  async addToCart(cartId: string, productId: string, quantity: number): Promise<APIResponse> {
    return this.request.post(`/carts/${cartId}`, { data: { product_id: productId, quantity } });
  }

  async getCart(cartId: string): Promise<APIResponse> {
    return this.request.get(`/carts/${cartId}`);
  }

  async deleteCart(cartId: string): Promise<APIResponse> {
    return this.request.delete(`/carts/${cartId}`);
  }
}
