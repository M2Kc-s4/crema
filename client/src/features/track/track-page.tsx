import { useMutation, useQuery } from "@/shared/lib/useQuery"
import { trackApi } from "./api"
import { Order, ORDER_STATUSES, OrderItem, type OrderStatus } from "domain/order"
import { CircleX, Feather } from "lucide-react"
import { ErrorFeedback, Feedback, LoadingFeedback } from "@/shared/ui/feedback"
import { Button, Column, Page, Row, Section, Step, Text } from "@/shared/ui/layout"


const STATUS_LABEL: Record<OrderStatus, string> = {
    progress: "Готовится",
    issued: "Готов к выдаче",
    pickedUp: "Забран",
}

const STATUS_TITLE: Record<OrderStatus, string> = {
    progress: "Ваш заказ готовится",
    issued: "Ваш заказ готов к выдаче",
    pickedUp: "Спасибо! Заказ забран",
}

const STATUS_INDEX: Record<OrderStatus, number> = {
    progress: 0,
    issued: 1,
    pickedUp: 2,
}

export function TrackPage() {
    const { data: track, error, isLoading } = useQuery(trackApi.getTrack, { tags: 'track' })

    const { mutate: pickUp, isPending } = useMutation(trackApi.pickUp, { refetches: 'track' })


    if (isLoading) return <LoadingFeedback />
    if (error) return <ErrorFeedback message={error.message} />

    if (!track.order) return <Feedback title="У вас нет активных заказов" icon={CircleX} />
    

    const { order, products } = track
    const currentIndex = STATUS_INDEX[order.status]
    

    return (
        <Page>
            <Text xl>
                {STATUS_TITLE[order.status]}
            </Text>

            <Row>
                {ORDER_STATUSES.map((status, i) => 
                    <Step
                        key={status}
                        done={i < currentIndex}
                        current={i === currentIndex}
                    >
                        {STATUS_LABEL[status]}
                    </Step>
                )}
            </Row>

            <Section>
                {order.items.map(item => {
                    const product = products.find(p => p.id === item.productId)
                    if (!product) return null

                    return (
                        <Row key={item.productId} line>
                            <Text>{item.name}</Text>
                            <Text>{item.qty} × {item.unitPrice} ₽</Text>
                        </Row>
                    )
                })}

                <Row>
                    <Text bold>Итого {order.total} ₽</Text>

                    {Order.isIssued(order) && 
                        <Button loading={isPending} onClick={pickUp} >
                            Забрать заказ
                        </Button>
                    }
                </Row>
            </Section>
        </Page>
    )
}