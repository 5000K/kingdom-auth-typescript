export class KingdomAuthClient {
    constructor(baseUrl, fetchImpl = window.fetch.bind(window)) {
        this.baseUrl = baseUrl;
        this.fetchImpl = fetchImpl;
        this.currentToken = null;
        this.email = null;
        this.currentTokenExpiry = new Date(0);
        this.currentRefreshTimeout = null;
        if (this.baseUrl.endsWith("/")) {
            this.baseUrl = this.baseUrl.slice(0, -1);
        }
    }
    async loadProviders() {
        const endpoint = `${this.baseUrl}/providers`;
        try {
            const response = await this.fetchImpl(endpoint, {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) {
                const errorData = (await response.json());
                throw new Error(`Failed to load providers: ${(errorData === null || errorData === void 0 ? void 0 : errorData.error) || response.statusText}`);
            }
            const data = await response.json();
            this.providers = data.providers;
            return this.providers;
        }
        catch (error) {
            return [];
        }
    }
    async authenticate(provider) {
        if (!this.providers) {
            await this.loadProviders();
        }
        if (!this.providers.includes(provider)) {
            throw new Error(`Provider "${provider}" is not known.`);
        }
        const endpoint = `${this.baseUrl}/auth/begin/${provider}`;
        // open new window for authentication
        const authWindow = window.open(endpoint, "_blank", "width=500,height=600,popup=true");
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
    getEmail() {
        return this.email;
    }
    async getToken() {
        if (this.currentToken &&
            this.currentTokenExpiry.getTime() > Date.now() + 10000) {
            return this.currentToken;
        }
        await this.refreshToken();
        return this.currentToken;
    }
    async refreshToken() {
        var _a;
        try {
            // catch multiple simultaneous refreshes
            if (this.currentRefreshTimeout) {
                clearTimeout(this.currentRefreshTimeout);
                this.currentRefreshTimeout = null;
            }
            const endpoint = `${this.baseUrl}/token`;
            const response = await this.fetchImpl(endpoint, {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) {
                const errorData = (await response.json());
                throw new Error(`Failed to get token: ${errorData.error || response.statusText}`);
            }
            const data = await response.json();
            this.currentToken = (_a = data.token) !== null && _a !== void 0 ? _a : null;
            this.email = data.email;
            const expDateUnixS = data.exp;
            this.currentTokenExpiry = new Date(expDateUnixS * 1000);
            const expiresIn = this.currentTokenExpiry.getTime() - Date.now();
            this.currentRefreshTimeout = setTimeout(() => {
                this.refreshToken().catch((err) => {
                    console.error("Failed to refresh token:", err);
                });
            }, Math.max(expiresIn - 10000, 1)); // refresh at most 10s before expiry
        }
        catch (error) {
            this.currentToken = null;
            this.email = null;
            this.currentTokenExpiry = new Date(0);
        }
    }
}
//# sourceMappingURL=index.js.map