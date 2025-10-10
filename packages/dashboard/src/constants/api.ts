import { treaty } from '@elysiajs/eden';
import type { App } from '@queue/backend';

export const API_BASE_URL = 'http://localhost:9674';

export const api = treaty<App>(API_BASE_URL);
