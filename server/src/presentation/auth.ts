import Elysia, { t, type Static } from "elysia";
import { loginUseCase } from "@/applications/usecases/commands/login";
import { hasher, reader, signer, txm } from "@/composition";
import { ErrUnauthorized } from "@/error";
import { refreshSessionUseCase } from "@/applications/usecases/commands/refresh-session";
import { getUserByIdUseCase } from "@/applications/usecases/queries/get-user-by-id";
import { authMacro } from "./shared";
import { revokeSessionUseCase } from "@/applications/usecases/commands/revoke-session";


export const authRoutes = new Elysia().use(authMacro)


const LoginRequest = t.Object({
    email: t.String(),
    password: t.String()
})

export type LoginRequest = Static<typeof LoginRequest>

authRoutes.post("/login", 
    async ({
        body: {email, password}, 
        headers,
        cookie: { sessionRefresh }
    }) => {
        const device = deviceName(headers["user-agent"])

        const {
            refresh,
            access,
        } = await loginUseCase({ email, password, device }, txm, hasher, signer)

        sessionRefresh.set({
            value: refresh,
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 30 * 24 * 3600,
            path: '/'
        })

        return {
            access
        }
    }, {
        body: LoginRequest,
        cookie: t.Object({
            sessionRefresh: t.Optional(t.String())
        })
    }
)


authRoutes.post('/refresh',
    async ({
        cookie: { sessionRefresh }
    }) => {
        if (!sessionRefresh.value) throw ErrUnauthorized

        const { 
            refresh, 
            access,
        } = await refreshSessionUseCase({refreshToken: sessionRefresh.value}, txm, signer)

        sessionRefresh.set({
            value: refresh,
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 30 * 24 * 3600,
            path: '/'
        })

        return {
            access
        }
    }, {
        cookie: t.Object({
            sessionRefresh: t.Optional(t.String())
        })
    }
)


.post('/logout', 
    async ({
        cookie: { sessionRefresh: sessionToken }
    }) => {
        if (!sessionToken.value) throw ErrUnauthorized

        sessionToken.remove()

        return {
            message: "Successful logout"
        }
    }, {
        cookie: t.Object({
            sessionRefresh: t.Optional(t.String())
        }),
    }
)


.get('/me',
    async ({
        userId
    }) => {
        return getUserByIdUseCase({ userId }, reader)
    },  
    {
        auth: true
    }
)

.post('/sessions/:sessionId/revoke',
    ({ userId, params: { sessionId } }) => revokeSessionUseCase({ userId, sessionId }, txm),
    { auth: true }
)

export function deviceName(ua: string | undefined): string {
    const browser =
        !ua ? null :
        /Edg\//.test(ua) ? "Edge" :
        /OPR\/|Opera/.test(ua) ? "Opera" :
        /Firefox\/|FxiOS/.test(ua) ? "Firefox" :
        /Chrome\/|CriOS/.test(ua) ? "Chrome" :
        /Safari\//.test(ua) ? "Safari" :
        null

    const os =
        !ua ? null :
        /Windows/.test(ua) ? "Windows" :
        /Android/.test(ua) ? "Android" :
        /iPhone|iPad|iPod/.test(ua) ? "iOS" :
        /Mac OS X|Macintosh/.test(ua) ? "macOS" :
        /Linux/.test(ua) ? "Linux" :
        null

    return [browser, os].filter(Boolean).join(", ") || "Неизвестное устройство"
}