import { useMutation } from "@/shared/lib/useQuery"
import { api } from "@/shared/api"
import { useCurrentUser } from "@/app/providers/current-user-provider"
import { authApi } from "./api"
import { Form, FormError, Input } from "@/shared/ui/form"
import { Button, Container, Page, Section, Text } from "@/shared/ui/layout"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "@/app/routes"
import { useForm } from "@/shared/lib/useForm/useForm"

type LoginDraft = {
    email: string
    password: string
}

const emptyLogin: LoginDraft = {
    email: '',
    password: ''
}


export function LoginPage() {
    const navigate = useNavigate()
    const { register, formError, handleSubmit, setError } = useForm(emptyLogin)
    const { updateCurrentUser } = useCurrentUser()

    const { mutate: login, isPending } = useMutation(authApi.login, {
        onSuccess(access) {
            api.setAccess(access)
            updateCurrentUser()
        },
        onError: setError
    })

    const onSubmit = handleSubmit(login)

    return (
        <Page>
            <Container narrow>
                <Section>
                    <Form onSubmit={onSubmit}>
                        <Text xl>Войти в Крему</Text>
                        <Text muted>Заказывайте заранее и забирайте без очереди.</Text>

                        <Input {...register('email')} placeholder="Электронная почта" required />
                        <Input {...register('password')} placeholder="Пароль" type="password" required />
                        
                        <FormError error={formError} />
                        
                        <Button loading={isPending} submit >"Войти"</Button>
                        <Button ghost onClick={() => navigate(ROUTES.register)} >Создать аккаунт</Button>
                    </Form>
                </Section>
            </Container>
        </Page>
    )
}