import { useMutation } from "@/shared/useQuery"
import { api } from "@/shared/api"
import { useCurrentUser } from "@/app/providers/current-user-provider"
import { authApi } from "./api"
import { Form, FormError, Input } from "@/shared/ui/form"
import { Button, Container, Page, Section, Text } from "@/shared/ui/layout"
import { createForm } from "@/shared/useForm"

type LoginDraft = {
    email: string
    password: string
}

const emptyLogin: LoginDraft = {
    email: '',
    password: ''
}

const { useForm } = createForm(emptyLogin)

export function LoginPage() {
    const { register, formError: error, handleSubmit, setError } = useForm()
    const { updateCurrentUser } = useCurrentUser()

    const { mutate: login, isPending } = useMutation({
        mutation: authApi.login,
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
                        
                        <FormError error={error} />
                        
                        <Button loading={isPending} submit >"Войти"</Button>
                        <Button ghost >Создать аккаунт</Button>
                    </Form>
                </Section>
            </Container>
        </Page>
    )
}