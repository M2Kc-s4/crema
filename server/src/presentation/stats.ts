import Elysia from "elysia";
import { authMacro } from "./shared";
import { getStatsUseCase } from "@/applications/usecases/queries/get-stats";
import { reader } from "@/composition";

export const statsRoutes = new Elysia().use(authMacro)

statsRoutes.get('/stats',
    ({ userId }) => getStatsUseCase({ userId }, reader),
    { auth: true }
)