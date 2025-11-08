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
    logout(): Promise<void>;
    authenticate(provider: string): Promise<void>;
    getEmail(): string | null;
    getToken(): Promise<string | null>;
    private refreshToken;
}
//# sourceMappingURL=index.d.ts.map