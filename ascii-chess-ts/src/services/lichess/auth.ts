import axios from 'axios';

const LICHESS_OAUTH_URL = 'https://lichess.org/oauth';
const LICHESS_API_URL = 'https://lichess.org/api';
const TOKEN_STORAGE_KEY = 'lichess_access_token';
const TOKEN_EXPIRY_KEY = 'lichess_token_expiry';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface UserInfo {
  id: string;
  username: string;
  perfs: any;
  createdAt: number;
  profile?: any;
}

class LichessAuth {
  private clientId: string;
  private redirectUri: string;
  private scope: string;

  constructor() {
    const baseUrl = window.location.origin;
    this.clientId = baseUrl;
    this.redirectUri = `${baseUrl}/auth/callback`;
    this.scope = 'board:play challenge:read challenge:write';
  }

  private generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
  }

  private base64UrlEncode(str: string): string {
    const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
    const charCodes = Array.from(bytes);
    return btoa(String.fromCharCode(...charCodes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private async sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest('SHA-256', data);
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const hash = await this.sha256(verifier);
    const hashArray = Array.from(new Uint8Array(hash));
    return btoa(String.fromCharCode(...hashArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async startAuth(): Promise<void> {
    const codeVerifier = this.generateRandomString(64);
    const state = this.generateRandomString(32);
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    sessionStorage.setItem('lichess_code_verifier', codeVerifier);
    sessionStorage.setItem('lichess_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state: state
    });

    window.location.href = `${LICHESS_OAUTH_URL}?${params.toString()}`;
  }

  async handleCallback(code: string, state: string): Promise<boolean> {
    try {
      const storedState = sessionStorage.getItem('lichess_state');
      if (state !== storedState) {
        console.error('State mismatch - possible CSRF attack');
        return false;
      }

      const codeVerifier = sessionStorage.getItem('lichess_code_verifier');
      if (!codeVerifier) {
        console.error('Code verifier not found');
        return false;
      }

      const tokenResponse = await this.exchangeCodeForToken(code, codeVerifier);

      this.storeToken(tokenResponse);

      sessionStorage.removeItem('lichess_code_verifier');
      sessionStorage.removeItem('lichess_state');

      return true;
    } catch (error) {
      console.error('OAuth callback error:', error);
      return false;
    }
  }

  private async exchangeCodeForToken(code: string, codeVerifier: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      code_verifier: codeVerifier,
      redirect_uri: this.redirectUri,
      client_id: this.clientId
    });

    const response = await axios.post(`${LICHESS_API_URL}/token`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;
  }

  private storeToken(tokenResponse: TokenResponse): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, tokenResponse.access_token);

    if (tokenResponse.expires_in) {
      const expiryTime = Date.now() + (tokenResponse.expires_in * 1000);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
  }

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (token && expiry) {
      const expiryTime = parseInt(expiry);
      if (Date.now() > expiryTime) {
        this.logout();
        return null;
      }
    }

    return token;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  async getCurrentUser(): Promise<UserInfo | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await axios.get(`${LICHESS_API_URL}/account`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get user info:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.logout();
      }
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    window.dispatchEvent(new StorageEvent('storage', {
      key: TOKEN_STORAGE_KEY,
      oldValue: localStorage.getItem(TOKEN_STORAGE_KEY),
      newValue: null,
      storageArea: localStorage
    }));
  }

  async makeAuthenticatedRequest(endpoint: string, options: any = {}): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    return axios({
      ...options,
      url: `${LICHESS_API_URL}${endpoint}`,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

export const lichessAuth = new LichessAuth();
