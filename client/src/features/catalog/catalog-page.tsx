import { Container } from "@/shared/ui/layout";
import { Catalog } from "./catalog";

export function CatalogPage() {
    return (
        <>
            <section className="bg-roast px-8 pt-10 pb-9 text-milk">
                <Container>
                    <h1 className="max-w-[16ch] text-[clamp(30px,5vw,50px)]">
                        Заберите кофе, пока он ещё горячий
                    </h1>
                </Container>
            </section>
            <Catalog />
        </>
    )
}