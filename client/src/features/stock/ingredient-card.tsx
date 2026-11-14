import type { Ingredient } from "domain/ingridient";
import { useState } from "react";
import { RestockDialog } from "./restock-dialog";
import { Button, Row, Text } from "@/shared/ui/layout";

type IngredientCardProps = {
    ingredient: Ingredient
}

export function IngredientCard({ ingredient }: IngredientCardProps) {
    const [dialogOpen, setDialogOpen] = useState(false)

    const onClose = () => setDialogOpen(false)
    const onOpen = () => setDialogOpen(true)
    

    return (
        <Row justify="between" line>
            {dialogOpen && 
                <RestockDialog 
                    ingredient={ingredient} 
                    onClose={onClose} 
                />
            }

            <Text>{ingredient.name}</Text>
            <Text bold>{ingredient.stock}</Text>
            
            <Button onClick={onOpen}>Добавить</Button>
        </Row>
    )
}