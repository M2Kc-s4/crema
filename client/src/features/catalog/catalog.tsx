import { useState } from "react";
import { Coffee } from "lucide-react";
import { CATEGORIES, type Category, type Product } from "domain/product";
import { useQuery } from "@/shared/useQuery";
import { ErrorFeedback, Feedback, LoadingFeedback } from "@/shared/ui/feedback";
import { menuApi } from "./api";
import { ProductCard } from "./product-card";
import { AddToCartDialog } from "../cart/add-to-cart-dialog";
import { Button, Grid, Page, Row } from "@/shared/ui/layout";


export function Catalog() {
    const [category, setCategory] = useState<Category>("coffee")
    const [picked, setPicked] = useState<Product | null>(null)

    const { data: products, error } = useQuery({ 
        query: menuApi.getProductCatalog 
    })


    if (error) return <ErrorFeedback message={error.message} />
    if (!products) return <LoadingFeedback />


    const filtered = products.filter((p) => p.category === category);

    return (
        <Page>
            {picked && <AddToCartDialog product={picked} onClose={() => setPicked(null)} />}

            <Row line>
                {CATEGORIES.map(c =>
                    <Button tab key={c} onClick={() => setCategory(c)}>{c}</Button>
                )}
            </Row>

            {filtered.length
                ?   <Grid>
                        {filtered.map(p => <ProductCard key={p.id} product={p} onSelect={() => setPicked(p)} />)}
                    </Grid>
                :   <Feedback title="Нет товаров" icon={Coffee} />
            }
        </Page>
    )
}