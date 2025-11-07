export interface Error {
  error?: string;
}

export type TokenCallback = (token: string | null) => void;

export class KingdomAuthClient {
  private providers?: string[];
  private currentToken: string | null = null;
  private email: string | null = null;
  private currentTokenExpiry: Date = new Date(0);

  constructor(
    private baseUrl: string,
    private fetchImpl: typeof fetch = window.fetch.bind(window)
  ) {
    if (this.baseUrl.endsWith("/")) {
      this.baseUrl = this.baseUrl.slice(0, -1);
    }
  }

  async loadProviders(): Promise<string[]> {
    const endpoint = `${this.baseUrl}/providers`;

    try {
      const response = await this.fetchImpl(endpoint, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = (await response.json()) as Error;
        throw new Error(
          `Failed to load providers: ${errorData?.error || response.statusText}`
        );
      }

      const data = await response.json();
      this.providers = data.providers as string[];
      return this.providers;
    } catch (error) {
      return [];
    }
  }

  async logout(): Promise<void> {
    const endpoint = `${this.baseUrl}/auth/logout`;

    try {
      const response = await this.fetchImpl(endpoint, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = (await response.json()) as Error;
        throw new Error(
          `Failed to logout: ${errorData?.error || response.statusText}`
        );
      }

      this.currentToken = null;
      this.email = null;
      this.currentTokenExpiry = new Date(0);
    } catch (error) {
      throw error;
    }
  }

  async authenticate(provider: string): Promise<void> {
    if (!this.providers) {
      await this.loadProviders();
    }

    if (!this.providers!.includes(provider)) {
      throw new Error(`Provider "${provider}" is not known.`);
    }

    const endpoint = `${this.baseUrl}/auth/begin/${provider}`;

    // open new window for authentication
    const authWindow = window.open(
      endpoint,
      "_blank",
      "width=500,height=600,popup=true"
    );
    if (!authWindow) {
      throw new Error("Failed to open authentication window.");
    }

    authWindow.focus();

    // wait for authWindow to close
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        if (authWindow.closed) {
          clearInterval(interval);
          resolve();

          await this.refreshToken();
        }
      }, 500);
    });
  }

  public getEmail(): string | null {
    return this.email;
  }

  public async getToken(): Promise<string | null> {
    if (
      this.currentToken &&
      this.currentTokenExpiry.getTime() > Date.now() + 10000
    ) {
      return this.currentToken;
    }

    await this.refreshToken();
    return this.currentToken;
  }

  private async refreshToken(): Promise<void> {
    try {
      const endpoint = `${this.baseUrl}/token`;
      const response = await this.fetchImpl(endpoint, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = (await response.json()) as Error;
        throw new Error(
          `Failed to get token: ${errorData.error || response.statusText}`
        );
      }

      const data = await response.json();
      this.currentToken = (data.token as string) ?? null;
      this.email = data.email as string;
      const expDateUnixS = data.exp as number;
      this.currentTokenExpiry = new Date(expDateUnixS * 1000);

      const expiresIn = this.currentTokenExpiry.getTime() - Date.now();
    } catch (error) {
      this.currentToken = null;
      this.email = null;
      this.currentTokenExpiry = new Date(0);
    }
  }
}
