import { TokenPair } from './token-pair.interface';

export interface AuthResponse {
  user: Record<string, unknown>;
  tokens: TokenPair;
}
