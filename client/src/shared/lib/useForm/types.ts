import type { ChangeEvent, PropsWithChildren, ReactElement } from "react"

export type FormFieldValue = string | number | boolean

export type FormValues = {
    [key: string]: FormFieldValue | FormValues | FormValues[]
}


type IsEqual<V, M> = 
    [V] extends [M] ? true : false

export type PathTo<T extends FormValues, M> = {
    [K in keyof T & string]:
        | (IsEqual<T[K], M> extends true ? K : never)
        | (T[K] extends readonly (infer Item extends FormValues)[]
            ? (IsEqual<Item, M> extends true ? `${K}.${number}` : never)
                | `${K}.${number}.${PathTo<Item, M>}`
            : T[K] extends FormValues
                ? `${K}.${PathTo<T[K], M>}`
                : never)
}[keyof T & string]


type Step<T, K extends string> =
    T extends readonly (infer Item)[]
        ? K extends `${number}` ? Item : never
        : K extends keyof T ? T[K] : never

type ValueAt<T, P extends string> =
    P extends `${infer K}.${infer R}`
        ? ValueAt<Step<T, K>, R>
        : Step<T, P>

export type PathValue<T extends FormValues, P extends string> = ValueAt<T, P>

export type ArrayPathValue<T extends FormValues, P extends PathTo<T, readonly unknown[]>> =
    ValueAt<T, P> extends readonly (infer Item extends FormValues)[] ? Item : never


export type FormInput = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
export type FormEvent = ChangeEvent<FormInput>
export type Field<Item extends FormValues> = Item & { id: string }

export interface FieldArray<Item extends FormValues> {
    fields: Field<Item>[]
    append: (...items: Item[]) => void
    prepend: (...items: Item[]) => void
    insert: (index: number, ...items: Item[]) => void
    remove: (index?: number | number[]) => void
    swap: (a: number, b: number) => void
    move: (from: number, to: number) => void
    replace: (items: Item[]) => void
}


export type FormRegister<T extends FormValues> =
    <P extends PathTo<T, FormFieldValue>>(name: P) => {
        name: P
        ref: (element: FormInput | null) => void
        onChange: (eventOrValue: FormEvent) => void
    }

export type FormWatch<T extends FormValues> = {
    (): T
    <P extends PathTo<T, unknown>>(path: P): PathValue<T, P>
}

export type FormSetValue<T extends FormValues> =
    <P extends PathTo<T, unknown>>(name: P, value: PathValue<T, P>) => void

export type FormHandleSubmit<T extends FormValues> = (
    onValid: (values: T) => void | Promise<void>
) => (event?: { preventDefault?: () => void }) => Promise<void>

export type FormUseFieldArray<T extends FormValues> =
    <P extends PathTo<T, readonly unknown[]>>(name: P) => FieldArray<ArrayPathValue<T, P>>

export type FormProvider = (p: PropsWithChildren) => ReactElement

export type FormScope<T extends FormValues> = 
    <P extends PathTo<T, FormValues>>(prefix: P) => UseFormResult<T, Extract<ValueAt<T, P>, FormValues>>

export interface UseFormResult<T extends FormValues, S extends FormValues = T> {
    register: FormRegister<S>
    watch: FormWatch<S>
    setValue: FormSetValue<S>
    handleSubmit: FormHandleSubmit<T>

    formError?: string
    setError: (error?: { message: string }) => void

    FormProvider: FormProvider
    useFieldArray: FormUseFieldArray<S>
    scope: FormScope<S>
}