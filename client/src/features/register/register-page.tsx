import { Form, FormError, Input } from "@/shared/ui/form";
import { Button, Container, Page, Section, Text } from "@/shared/ui/layout";
import { useMutation } from "@/shared/lib/useQuery";
import { useNavigate } from "react-router-dom";
import { registerApi } from "./api";
import { ROUTES } from "@/app/routes";
import { useForm } from "@/shared/lib/useForm/useForm";


type Form = {
    email: string
    password: string
    role: "customer"
}

const emptyForm: Form = { email: '', password: '', role: 'customer' }

export function RegisterPage() {
    const navigate = useNavigate()
    
    const { register, handleSubmit, formError, setError } = useForm(emptyForm)

    const { mutate: registerm, isPending } = useMutation(registerApi.register, {
        onSuccess: () => navigate(ROUTES.login),
        onError: setError
    })


    const onSubmit = handleSubmit(registerm)

    return (
        <Page>
            <Container narrow>
                <Section>
                    <Form onSubmit={onSubmit}>
                        <Text xl>Зарегистрироваться в Креме</Text>
                        <Text muted>Заказывайте заранее и забирайте без очереди.</Text>

                        <Input {...register('email')} placeholder="Электронная почта" required />
                        <Input {...register('password')} placeholder="Пароль" type="password" required />
                        
                        <FormError error={formError} />
                        
                        <Button loading={isPending} submit >Создать аккаунт</Button>
                        <Button onClick={() => navigate(ROUTES.login)} ghost >"Войти"</Button>
                    </Form>
                </Section>
            </Container>
        </Page>
    )
}