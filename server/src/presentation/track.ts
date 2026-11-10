import Elysia, { t } from "elysia";
import { authMacro } from "./shared";
import { getTrackUseCase } from "@/applications/usecases/queries/get-track";
import { reader, txm } from "@/composition";
import { pickUpOrderUseCase } from "@/applications/usecases/commands/pick-up-order";

export const trackRoutes = new Elysia().use(authMacro)

.get('/track', 
    ({ userId }) => getTrackUseCase({ userId }, reader), 
    { auth: true }
)

trackRoutes.post('/pick-up',
    ({ userId }) => pickUpOrderUseCase({ userId }, txm),
    { auth: true }
)