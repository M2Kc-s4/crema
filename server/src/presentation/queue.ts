import Elysia from "elysia";
import { authMacro } from "./shared";
import { getQueueUseCase } from "@/applications/usecases/queries/get-queue";
import { reader, txm } from "@/composition";
import { issueOrderUseCase } from "@/applications/usecases/commands/issue-order";

export const queueRoutes = new Elysia().use(authMacro)

queueRoutes.get('/queue', 
    ({ userId }) => getQueueUseCase({ userId }, reader), 
    { auth: true }
)


queueRoutes.post('/orders/:orderId/issue',
    ({ userId, params: { orderId } }) => issueOrderUseCase({ orderId, userId }, txm),
    { auth: true }
)
