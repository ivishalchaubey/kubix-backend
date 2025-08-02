export declare const config: {
    env: string;
    port: number;
    mongoose: {
        url: string;
    };
    jwt: {
        secret: string;
        accessExpirationMinutes: string;
        refreshSecret: string;
        refreshExpirationDays: string;
    };
    bcrypt: {
        saltRounds: number;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    email: {
        from: string | undefined;
        smtp: {
            host: string | undefined;
            port: number;
            auth: {
                user: string | undefined;
                pass: string | undefined;
            };
        };
    };
    frontendUrl: string;
};
export default config;
//# sourceMappingURL=env.d.ts.map