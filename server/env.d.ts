declare module "bun" {
    interface Env {
        ACCESS_PRIVATE: string,
        ACCESS_PUB: string,
        REFRESH_PUB: string,
        REFRESH_PRIVATE: string,
        ACCESS_TTL: string,
        SESSION_TTL: string,
        PG_PORT: number,
        PG_HOST: string,
        PG_USER: string,
        PG_DB: string,
        PG_PWD: string,
    }
}