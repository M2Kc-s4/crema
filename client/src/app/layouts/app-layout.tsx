import { useGuardedCurrentUser } from "../providers/current-user-provider"
import { Outlet, useNavigate } from "react-router-dom"
import { ROUTES } from "../routes"
import { Button, Row, Section, Spacer, Text } from "@/shared/ui/layout"


function Header() {
    const navigate = useNavigate()
    const { user } = useGuardedCurrentUser()

    return (
        <Section className="bg-espresso text-milk rounded-none">
            <Row>
                <Text bold>Крема</Text>

                <Spacer />

                {/* {User.isBarman(user)  */}
                            <Button gold sm onClick={() => navigate(ROUTES.queue)}>Очередь</Button>
                            <Button gold sm onClick={() => navigate(ROUTES.stock)}>Меню и остатки</Button>
                            <Button sm onClick={() => navigate(ROUTES.track)}>Мой заказ</Button>
                            <Button onClick={() => navigate(ROUTES.cart)}>Корзина ({user.cart.length})</Button>

                <Text bold>{user.email}</Text>
                
                <Button link dark sm>Выйти</Button>

            </Row>
        </Section>
    )
}

export function AppLayout() {
    return (
        <>
            <Header />
            <Outlet />
        </>
    )
}