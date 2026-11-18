import type { ReactNode } from "react"
import { Grid, Page, Row, Section, Spacer, Text } from "@/shared/ui/layout"
import type { Ingredient } from "domain/ingridient"
import { useQuery } from "@/shared/lib/useQuery"
import { statsApi } from "./api"
import { ErrorFeedback, LoadingFeedback } from "@/shared/ui/feedback"


export function StatsPage() {
    const { data, error, isLoading } = useQuery(statsApi.getStats)


    if (isLoading) return <LoadingFeedback />
    if (error) return <ErrorFeedback message={error.message} />
    

    const { ingredients, stats } = data

    const ingredientName = (id: Ingredient["id"]) =>
        ingredients.find(i => i.id === id)?.name ?? "Неизвестный ингредиент"

    return (
        <Page>
            <Text xl>Статистика</Text>

            <Grid min={200}>
                <Metric label="Выручка" value={`${stats.revenue} ₽`} />
                <Metric label="Заказов" value={stats.ordersCount} />
                <Metric label="Средний чек" value={`${Math.round(stats.averageCheck)} ₽`} />
            </Grid>

            <Grid min={320}>
                <Panel title="Популярные продукты" empty={stats.topProducts.length === 0}>
                    {stats.topProducts.map(p => (
                        <Line key={p.productId} label={p.name} value={`${p.qty} шт.`} />
                    ))}
                </Panel>

                <Panel title="Расход ингредиентов" empty={stats.consumption.length === 0}>
                    {stats.consumption.map(c => (
                        <Line key={c.ingredientId} label={ingredientName(c.ingredientId)} value={c.qty} />
                    ))}
                </Panel>
            </Grid>
        </Page>
    )
}


function Metric({ label, value }: { label: string, value: ReactNode }) {
    return (
        <Section sm>
            <Text sm muted>{label}</Text>
            <Text md bold>{value}</Text>
        </Section>
    )
}

function Panel({ title, empty, children }: { title: string, empty: boolean, children: ReactNode }) {
    return (
        <Section border>
            <Text bold>{title}</Text>
            {empty ? <Text muted>Пока нет данных</Text> : children}
        </Section>
    )
}

function Line({ label, value }: { label: ReactNode, value: ReactNode }) {
    return (
        <Row>
            <Text>{label}</Text>
            <Spacer />
            <Text muted>{value}</Text>
        </Row>
    )
}
