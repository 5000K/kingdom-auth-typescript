export interface Error {
    error?: string;
}
export type TokenCallback = (token: string | null) => void;
export declare class KingdomAuthClient {
    private baseUrl;
    private fetchImpl;
    private providers?;
    private currentToken;
    private email;
    private currentTokenExpiry;
    constructor(baseUrl: string, fetchImpl?: typeof fetch);
    loadProviders(): Promise<string[]>;
    authenticate(provider: string): Promise<void>;
    getEmail(): string | null;
    getToken(): Promise<string | null>;
    private currentRefreshTimeout;
    private refreshToken;
}
//# sourceMappingURL=index.d.ts.map