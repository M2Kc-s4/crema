import { useQuery, useMutation } from "@/shared/lib/useQuery"
import { queueApi } from "./api"
import { Order } from "domain/order"
import type { ID } from "domain/shared"
import clsx from "clsx"
import { formatTime } from "@/shared/lib"
import { NutOff } from "lucide-react"
import { ErrorFeedback, Feedback, LoadingFeedback } from "@/shared/ui/feedback"
import { Button, Column, Grid, Page, Row, Section, Text } from "@/shared/ui/layout"


const COLUMNS = [
    { status: "progress", title: "Готовится" },
    { status: "issued", title: "Готов к выдаче" },
] as const


export function QueuePage() {
    const { data: queue, error, isLoading } = useQuery(queueApi.getQueue, { tags: 'queue' })

    const { mutate: issue } = useMutation(queueApi.issue, { refetches: 'queue' })
    

    if (isLoading) return <LoadingFeedback />
    if (error) return <ErrorFeedback message={error.message} />

    if (!queue.length) return <Feedback title="Очередь пуста" icon={NutOff} />    

    
    return (
        <Page>
            <Text xl>Очередь на сейчас</Text>

            <Grid fit>
                {COLUMNS.map(col => {
                    const orders = queue
                        .filter(o => o.status === col.status)

                    return (
                        <Column key={col.status}>
                            <Text md>{col.title} ({orders.length})</Text>

                            {orders.map(order => (
                                <QueueCard
                                    key={order.id}
                                    order={order}
                                    onIssue={() => issue(order.id)}
                                />
                            ))}
                        </Column>
                    )
                })}
            </Grid>
        </Page>
    )
}


type QueueCardProps = {
    order: Order
    onIssue: () => void
}

function QueueCard({ order, onIssue }: QueueCardProps) {
    return (
        <Section>
            <Row>
                <Text bold>№ {order.id.slice(0, 6)}</Text>
                <Text>{formatTime(order.createdAt)}</Text>
            </Row>

            <Text muted>Итого: {order.total} ₽</Text>

            {order.items.map(item => 
                <Text muted key={item.productId}>
                    {item.qty} × {item.name}
                </Text>
            )}

            {Order.isIssued(order)
                ?   <Text muted>Ожидает клиента</Text>
                :   <Button onClick={onIssue} sm>Готово</Button>
            }
        </Section>
    )
}