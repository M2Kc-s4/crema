import Elysia from "elysia";
import swagger from "@elysiajs/swagger";
import cors from "@elysiajs/cors";
import { authRoutes } from "./presentation/auth";
import { userRoutes } from "./presentation/user";
import { banner } from "./banner";
import { DomainError } from "domain/error";
import { UnauthorizedError } from "./error";
import { catalogRoutes } from "./presentation/catalog";
import { cartRoutes } from "./presentation/cart";
import { queueRoutes } from "./presentation/queue";
import { trackRoutes } from "./presentation/track";
import { stockRoutes } from "./presentation/stock";

export const app = new Elysia()
    .error({
        DOMAIN_ERROR: DomainError,
        UNAUTHORIZED_ERROR: UnauthorizedError
    })

app.onError(({code, error, set}) => {
    if (code === 'DOMAIN_ERROR') {
        set.status = "Bad Request"
        return { message: error.message }
    }

    if (code === 'NOT_FOUND') {
        set.status = "Not Found"
        return { message: "Not found"}
    }

    if (code === 'VALIDATION') {
        set.status = "Unprocessable Content"
        return { message: error.message }
    }

    if (code === 'UNAUTHORIZED_ERROR' ) {
        set.status = 'Unauthorized'
        return { message: error.message }
    }

    console.log(error);
    

    return { message: "Internal error" }
})

app.use(swagger({
    provider: 'swagger-ui',
    documentation: {
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token'
                }
            }
        }
    }
}))

app.use(cors())

app.use(authRoutes)
app.use(userRoutes)
app.use(catalogRoutes)
app.use(cartRoutes)
app.use(queueRoutes)
app.use(trackRoutes)
app.use(stockRoutes)

app.listen({port: 8000, reusePort: true})



const RUST = String.raw`
        ____             __ 
       / __ \__  _______/ /_
      / /_/ / / / / ___/ __/
     / _, _/ /_/ (__  ) /_  
    /_/ |_|\__,_/____/\__/  
`

const BLAZING = String.raw`
    ____  __            _            
   / __ )/ /___ _____  (_)___  ____ _
  / __  / / __ '/_  / / / __ \/ __ '/
 / /_/ / / /_/ / / /_/ / / / / /_/ / 
/_____/_/\__,_/ /___/_/_/ /_/\__, /  
                            /____/   
`

const FAST = String.raw`
        ______           __ 
       / ____/___ ______/ /_
      / /_  / __ '/ ___/ __/
     / __/ / /_/ (__  ) /_  
    /_/    \__,_/____/\__/  
`

banner([RUST, BLAZING, FAST])
