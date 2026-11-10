import { Pool } from "@m2k-5f/pgtx";
import { env } from "bun";
import { createPrivateKey, createPublicKey } from "crypto";
import { readFileSync } from "fs";
import { TransactionManager } from "./infra/persistance/transaction-manager";
import { TokenSigner } from "./infra/security/token-signer";
import { PasswordHasher } from "./infra/security/password-hasher";
import { Reader } from "./infra/persistance/read-repository";

const persistensePool = new Pool({
    port: env.PG_PORT,
    host: env.PG_HOST,
    password: env.PG_PWD,
    user: env.PG_USER,
    database: env.PG_DB,
    max: 30,
    logLevel: 'notice'
})

export const readPool = new Pool({
    port: env.PG_PORT,
    host: env.PG_HOST,
    password: env.PG_PWD,
    user: env.PG_USER,
    database: env.PG_DB,
    max: 10,
    logLevel: 'notice'
})

export const txm = new TransactionManager(persistensePool)

export const reader = new Reader(readPool)

export const hasher = new PasswordHasher()

export const signer = new TokenSigner(
    createPublicKey(readFileSync(Bun.env.ACCESS_PUB).toString()),
    createPrivateKey(readFileSync(Bun.env.ACCESS_PRIVATE).toString()),
    createPublicKey(readFileSync(Bun.env.REFRESH_PUB).toString()),
    createPrivateKey(readFileSync(Bun.env.REFRESH_PRIVATE).toString()),
)

