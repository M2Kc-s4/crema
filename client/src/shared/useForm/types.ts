import type { ChangeEvent, PropsWithChildren, ReactElement } from "react"

export type FormFieldValue = string | number | boolean

export type FormValues = {
    [key: string]: FormFieldValue | FormValues | FormValues[]
}

export type PathValue<T, P extends string> =
    P extends `${infer K}.${infer R}`
        ? K extends keyof T
            ? T[K] extends readonly (infer Item)[]
                ? R extends `${number}`
                    ? Item
                    : R extends `${number}.${infer N}`
                        ? PathValue<Item, N>
                        : never
                : PathValue<T[K], R>
            : never
        : P extends keyof T
            ? T[P]
            : never


export type PathToFields<T extends FormValues> = {
    [K in keyof T & string]:
        T[K] extends FormFieldValue
            ? K
            : T[K] extends (infer Item extends FormValues)[]
                ? `${K}.${number}.${PathToFields<Item>}`
                : T[K] extends FormValues
                    ? `${K}.${PathToFields<T[K]>}`
                    : never
}[keyof T & string]

        
export type PathToArrays<T extends FormValues> = {
    [K in keyof T & string]:
        T[K] extends readonly (infer Item extends FormValues)[]
            ? K | `${K}.${number}.${PathToArrays<Item>}`
            : T[K] extends FormValues
                ? `${K}.${PathToArrays<T[K]>}`
                : never
}[keyof T & string]


export type PathToRecords<T extends FormValues> = {
    [K in keyof T & string] : 
        T[K] extends readonly (infer Item extends FormValues)[]
            ? `${K}.${number}` | `${K}.${number}.${PathToRecords<Item>}`
            : T[K] extends FormValues
                ?   K
                :   never
}[keyof T & string]


export type ArrayPathValue<
    T extends FormValues,
    P extends PathToArrays<T>
> =
    P extends `${infer K}.${infer R}`
        ? T[K] extends readonly (infer Item extends FormValues)[]
            ? R extends `${number}.${infer N}`
                ? N extends PathToArrays<Item>
                    ? ArrayPathValue<Item, N>
                    : never
                : R extends `${number}`
                    ? Item
                    : never
            : T[K] extends FormValues
                ? R extends PathToArrays<T[K]>
                    ? ArrayPathValue<T[K], R>
                    : never
                : never
        : T[P] extends readonly (infer Item extends FormValues)[]
            ? Item
            : never


export type Path<T extends FormValues> = PathToArrays<T> | PathToFields<T> | PathToRecords<T>

type IsMatch<Value, Target> =
    [Value] extends [Target]
        ? [Target] extends [Value]
            ? true
            : false
        : false


export type PathTo<T extends FormValues, Target> =
    (IsMatch<T, Target> extends true ? "" : never) | PathToNested<T, Target>

type PathToNested<T extends FormValues, Target> = {
    [K in keyof T & string]:
        (IsMatch<T[K], Target> extends true ? K : never)
        | (T[K] extends readonly (infer Item extends FormValues)[]
            ?   | (IsMatch<Item, Target> extends true ? `${K}.${number}` : never)
                | `${K}.${number}.${PathToNested<Item, Target>}`
            : T[K] extends FormValues
                ? `${K}.${PathToNested<T[K], Target>}`
                : never)
}[keyof T & string]


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
    <P extends PathToFields<T>>(name: P) => {
        name: P
        ref: (element: FormInput | null) => void
        onChange: (eventOrValue: FormEvent) => void
    }

export type FormWatch<T extends FormValues> = {
    (): T
    <P extends Path<T>>(path: P): PathValue<T, P>
}

export type FormSetValue<T extends FormValues> =
    <P extends Path<T>>(name: P, value: PathValue<T, P>) => void

export type FormHandleSubmit<T extends FormValues> = (
        onValid: (values: T) => void | Promise<void>
    ) => (event?: { preventDefault?: () => void }) => Promise<void>


export type FormUseFieldArray<T extends FormValues> = <P extends PathToArrays<T>>(name: P) => FieldArray<ArrayPathValue<T, P>>

export type FormProvider = (p: PropsWithChildren) => ReactElement


export interface UseFormResult<T extends FormValues> {
    register: FormRegister<T>
    watch: FormWatch<T>
    setValue: FormSetValue<T>
    handleSubmit: FormHandleSubmit<T>

    formError?: string    
    setError: (error?: { message: string }) => void

    FormProvider: FormProvider
    useFieldArray: FormUseFieldArray<T>
}


export type ScopeTarget<T extends FormValues, Prefix extends string> =
    Prefix extends "" ? T : Extract<PathValue<T, Prefix>, FormValues>

export type ScopePrefix<T extends FormValues> = "" | PathToRecords<T>

export interface CreateFormResult<T extends FormValues> {
    useForm: () => UseFormResult<T>
    useFormContext: {
        (): UseFormResult<T>
        <Prefix extends ScopePrefix<T>>(prefix: Prefix): UseFormResult<ScopeTarget<T, Prefix>>
    }
}