import { useQuery } from "@/shared/lib/useQuery"
import { Column, Page, Row, Section, Spacer, Text } from "@/shared/ui/layout"
import { Order, type OrderStatus } from "domain/order"
import { orderHistoryApi } from "./api"
import { ErrorFeedback, LoadingFeedback } from "@/shared/ui/feedback"


const STATUS_LABEL: Record<OrderStatus, string> = {
    progress: "Готовится",
    issued: "Готов к выдаче",
    pickedUp: "Получен",
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })


export function OrderHistoryPage() {
    const { data: orders, isLoading, error } = useQuery(orderHistoryApi.getOrderHistory)


    if (isLoading) return <LoadingFeedback />
    if (error) return <ErrorFeedback message={error.message} />


    return (
        <Page>
            <Text xl>История заказов</Text>

            {orders.length === 0 && <Text muted>Заказов пока нет</Text>}

            <Column>
                {orders.map(order => <OrderCard key={order.id} order={order} />)}
            </Column>
        </Page>
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