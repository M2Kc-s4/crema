import Elysia from "elysia";
import { authMacro } from "./shared";
import { getOrderHistoryUseCase } from "@/applications/usecases/queries/get-order-history";
import { reader } from "@/composition";

export const orderHistoryRoutes = new Elysia().use(authMacro)

orderHistoryRoutes.get('/orders/history',
    ({ userId }) => getOrderHistoryUseCase({ userId }, reader),
    { auth: true }
)