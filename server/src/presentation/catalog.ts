import { getCatalogUseCase } from "@/applications/usecases/queries/get-catalog";
import { reader } from "@/composition";
import Elysia from "elysia";

export const catalogRoutes = new Elysia()

.get('/catalog',  
    () => getCatalogUseCase(reader)
)