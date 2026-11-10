import Elysia from "elysia";
import { ErrUnauthorized } from "../error";
import { signer } from "../composition";
import type { AccessToken } from "domain/session";
import { authenticateUseCase } from "@/applications/usecases/queries/authenticate";


export const authMacro = new Elysia({ name: "auth-macro" })
    .macro({
        auth: {
            resolve: async ({ headers }) => {
                const authHeader = headers['authorization']
                const token = authHeader?.startsWith('Bearer ') 
                    ? authHeader.slice(7) as AccessToken
                    : undefined
                
                if (!token) throw ErrUnauthorized

                const userId = await authenticateUseCase({ token }, signer)    

                return { userId }
            },
            detail: {
                security: [{ BearerAuth: [] }]
            }
        }
    })