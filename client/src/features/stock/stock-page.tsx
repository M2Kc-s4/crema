import { useState } from "react";
import { useQuery } from "@/shared/useQuery";
import { stockApi } from "./api";
import { ErrorFeedback, LoadingFeedback } from "@/shared/ui/feedback";
import { CreateIngredientDialog } from "./create-ingredient-dialog";
import { IngredientCard } from "./ingredient-card";
import { ProductCard } from "./product-card";
import { Button, Grid, Page, Row, Section, Text } from "@/shared/ui/layout";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes";

function useVM() {
    const [createIngredientDialogOpen, setCreateIngredientDialogOpen] = useState(false)
    const navigate = useNavigate()

    const { data: stock, error } = useQuery({
        query: stockApi.getStock,
        tags: "stock",
    })

    return {
        onNewProduct: () => navigate(ROUTES.createProduct),
        onIngredientDialogOpen: () => setCreateIngredientDialogOpen(true),
        onIngredientDialogClose: () => setCreateIngredientDialogOpen(false),
        stock,
        error,
        createIngredientDialogOpen
    }
}


export function StockPage() {
    const vm = useVM()

    if (!vm.stock) return vm.error
        ?   <ErrorFeedback message={vm.error.message} />
        :   <LoadingFeedback />

    const { ingredients, products } = vm.stock

    return (
        <Page>
            {vm.createIngredientDialogOpen &&
                <CreateIngredientDialog onClose={vm.onIngredientDialogClose} />
            }

            <Text xl>Меню и остатки</Text>

            <Grid min={260} fit>
                <Section>
                    <Text md>Остатки</Text>

                    {ingredients.map(i => 
                        <IngredientCard ingredient={i} key={i.id} />
                    )}

                    <Button gold onClick={vm.onIngredientDialogOpen}>
                        Добавить ингредиент
                    </Button>
                </Section>

                <Section>
                    <Text md>Позиции</Text>

                    {products.map(p => 
                        <ProductCard product={p} key={p.id} />
                    )}
                    
                    <Button ghost onClick={vm.onNewProduct}>
                        Новая позиция
                    </Button>
                </Section>
            </Grid>
        </Page>
    )
}