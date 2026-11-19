import type { ReactNode } from "react"
import { Button, Column, Grid, Page, Row, Section, Spacer, Text } from "@/shared/ui/layout"
import type { UserRole } from "domain/user"
import type { Profile } from "server/applications/usecases/queries/get-profile"
import { useMutation, useQuery } from "@/shared/lib/useQuery"
import { profileApi } from "./api"
import { useGuardedCurrentUser } from "@/app/providers/current-user-provider"
import { ErrorFeedback, LoadingFeedback } from "@/shared/ui/feedback"
import type { Order, OrderStatus } from "domain/order"
import { formatAgo, formatDate } from "@/shared/lib"


const ROLE_LABEL: Record<UserRole, string> = {
    customer: "Клиент",
    barman: "Бармен",
}

const STATUS_LABEL: Record<OrderStatus, string> = {
    progress: "Готовится",
    issued: "Готов к выдаче",
    pickedUp: "Получен",
}


export function ProfilePage() {
    const { data: profile, error, isLoading } = useQuery(profileApi.getProfile, { tags: 'profile' })

    const { mutate: revokeSession } = useMutation(profileApi.revokeSession, { refetches: 'profile' })

    const { user } = useGuardedCurrentUser()

    if (isLoading) return <LoadingFeedback />
    if (error) return <ErrorFeedback message={error.message} />

    const onRevokeSession = (id: string) => () => revokeSession(id)


    return (
        <Page>
            <Column gap={1}>
                <Text xl>Профиль</Text>
                <Text muted>{user.email} · {ROLE_LABEL[user.role]}</Text>
            </Column>

            <Grid min={200}>
                <Metric label="Заказов" value={profile.orders.length} />
                <Metric label="Потрачено" value={`${profile.totalSpent} ₽`} />
                <Metric label="Любимый продукт" value={profile.favorite ? profile.favorite.name : "—"} />
            </Grid>

            <Section border>
                <Text bold>Активные сессии</Text>

                {profile.sessions.map(session => (
                    <Row key={session.id}>
                    <Text>{session.device}</Text>
                    <Text sm muted>{formatAgo(session.lastActiveAt)}</Text>
                    <Spacer />
                    <Button sm ghost onClick={onRevokeSession(session.id)}>
                        Завершить
                    </Button>
                </Row>
                ))}
            </Section>

            <Column>
                <Text md bold>История заказов</Text>

                {profile.orders.length === 0 && <Text muted>Заказов пока нет</Text>}

                {profile.orders.map(order => <OrderCard key={order.id} order={order} />)}
            </Column>
        </Page>
    )
}


type MetricProps = {
    label: string
    value: ReactNode
}

function Metric({ label, value }: MetricProps) {
    return (
        <Section sm>
            <Text sm muted>{label}</Text>
            <Text md bold>{value}</Text>
        </Section>
    )
}


type OrderCardProps = {
    order: Order
}

function OrderCard({ order }: OrderCardProps) {
    return (
        <Section border>
            <Row>
                <Text bold>{formatDate(order.createdAt)}</Text>
                <Spacer />
                <Text sm muted>{STATUS_LABEL[order.status]}</Text>
            </Row>

            {order.items.map((item, i) => 
                <Row key={i}>
                    <Text>{item.name} × {item.qty}</Text>
                    <Spacer />
                    <Text muted>{item.unitPrice * item.qty} ₽</Text>
                </Row>
            )}

            <Row>
                <Spacer />
                <Text bold>{order.total} ₽</Text>
            </Row>
        </Section>
    )
}