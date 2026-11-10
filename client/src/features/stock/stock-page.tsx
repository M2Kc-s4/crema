import { useState } from "react";
import { useQuery } from "@/shared/useQuery";
import { stockApi } from "./api";
import { ErrorFeedback, LoadingFeedback } from "@/shared/ui/feedback";
import { CreateIngredientDialog } from "./create-ingredient-dialog";
import { IngredientCard } from "./ingredient-card";
import { ProductCard } from "./product-card";
import { Button, Grid, Page, Section, Text } from "@/shared/ui/layout";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes";

export function StockPage() {
    const [createIngredientDialogOpen, setCreateIngredientDialogOpen] = useState(false)
    const navigate = useNavigate()

    const { data: stock, error } = useQuery({
        query: stockApi.getStock,
        tags: "stock",
    })

    if (error) return <ErrorFeedback message={error.message} />
    if (!stock) return <LoadingFeedback />

    const { ingredients, products } = stock
    const onNewProduct = () => navigate(ROUTES.createProduct)

    return (
        <Page>
            {createIngredientDialogOpen &&
                <CreateIngredientDialog onClose={() => setCreateIngredientDialogOpen(false)} />
            }

            <Text xl>Меню и остатки</Text>

            <Grid min={260} fit>
                <Section>
                    <Text md>Остатки</Text>

                    {ingredients.map(i => 
                        <IngredientCard ingredient={i} key={i.id} />
                    )}

                    <Button gold onClick={() => setCreateIngredientDialogOpen(true)}>
                        Добавить ингредиент
                    </Button>
                </Section>

                <Section>
                    <Text md>Позиции</Text>

                    {products.map(p => 
                        <ProductCard product={p} key={p.id} />
                    )}
                    
                    <Button ghost onClick={onNewProduct}>
                        Новая позиция
                    </Button>
                </Section>
            </Grid>
        </Page>
    )
}