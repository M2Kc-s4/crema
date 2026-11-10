import { CatalogPage } from "@/features/catalog/catalog-page";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "./guards/auth-guard";
import { AppLayout } from "./layouts/app-layout";
import { ROUTES } from "./routes";
import { LoginPage } from "@/features/login/login-page";
import { QueuePage } from "@/features/queue/queue-page";
import { TrackPage } from "@/features/track/track-page";
import { CartPage } from "@/features/cart/cart-page";
import { StockPage } from "@/features/stock/stock-page";
import { GuestGuard } from "./guards/guest-guard";
import { CreateProductPage } from "@/features/stock/create-product-page";

export function Router() {
    return (
        <Routes>
            <Route element={
                <AuthGuard>
                    <AppLayout />
                </AuthGuard>
            }>
                <Route path={ROUTES.catalog} element={<CatalogPage />} />

                <Route path={ROUTES.queue} element={<QueuePage />} />

                <Route path={ROUTES.track} element={<TrackPage />} />

                <Route path={ROUTES.cart} element={<CartPage />} />

                <Route path={ROUTES.stock} element={<StockPage />} />

                <Route path={ROUTES.createProduct} element={<CreateProductPage />} />
            </Route>

            <Route path={ROUTES.login} element={<GuestGuard><LoginPage /></GuestGuard>} />

            <Route path="*" element={<Navigate to={ROUTES.catalog} />} />
        </Routes>
    )
}
