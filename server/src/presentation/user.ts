import Elysia, { t, type Static } from "elysia"
import { hasher, reader, signer, txm } from "../composition"
import { getUserByIdUseCase } from "@/applications/usecases/queries/get-user-by-id"
import { registerUseCase } from "@/applications/usecases/commands/register"
import { authMacro } from "./shared"
import { getProfileUseCase } from "@/applications/usecases/queries/get-profile"


export const userRoutes = new Elysia().use(authMacro)


const RegisterRequest = t.Object({
    email: t.String(),
    password: t.String(),
    role: t.String()
})

export type RegisterRequest = Static<typeof RegisterRequest>


userRoutes.post('/users',
    ({ body }) => registerUseCase(body, txm, hasher),
    { body: RegisterRequest }
)

userRoutes.get('/me/profile',
    ({ userId }) => getProfileUseCase({ userId }, reader),
    { auth: true }
)