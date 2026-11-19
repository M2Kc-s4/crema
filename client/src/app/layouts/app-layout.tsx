import { useGuardedCurrentUser } from "../providers/current-user-provider"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { ROUTES } from "../routes"
import { Button, Row, Section, Spacer, Text } from "@/shared/ui/layout"
import { useMutation } from "@/shared/lib/useQuery"
import { User } from "domain/user"


function Header() {
    const navigate = useNavigate()
    const { user, logout } = useGuardedCurrentUser()

    const { mutate } = useMutation(logout)

    return (
        <Section className="bg-espresso text-milk rounded-none">
            <Row>
                <Text onClick={() => navigate(ROUTES.catalog)} bold>Крема</Text>

                <Spacer />

                {User.isBarman(user) &&
                    <>
                        <Button gold sm onClick={() => navigate(ROUTES.queue)}>Очередь</Button>
                        <Button gold sm onClick={() => navigate(ROUTES.stock)}>Меню и остатки</Button>
                        <Button gold sm onClick={() => navigate(ROUTES.stats)} >Статистика</Button>
                    </>
                }
                {User.isCustomer(user) &&
                    <>
                        <Button sm onClick={() => navigate(ROUTES.track)}>Текущий заказ</Button>
                        <Button onClick={() => navigate(ROUTES.cart)}>Корзина ({user.cart.length})</Button>
                    </>
                }
                            
                <Button onClick={() => navigate(ROUTES.profile)} gold sm >{user.email}</Button>
                
                <Button onClick={mutate} link dark sm>Выйти</Button>

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