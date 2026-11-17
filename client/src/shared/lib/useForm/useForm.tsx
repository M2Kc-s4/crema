import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
    type PropsWithChildren,
} from 'react'
import type { ArrayPathValue, Field, FormFieldValue, FormHandleSubmit, FormRegister, FormScope, FormSetValue, FormUseFieldArray, FormValues, FormWatch, PathTo, PathValue, UseFormResult } from './types'
import { extractFromEvent, getIn, readFromElement, setIn, writeToElement } from './utils'

const FormContext = createContext<UseFormResult<any> | null>(null)

let idSequence = 0
const newId = () => `fa_${++idSequence}`

function createScope<
    T extends FormValues,
    P extends PathTo<T, FormValues>
>(
    form: UseFormResult<T>,
    path: P,
): UseFormResult<T, Extract<PathValue<T, P>, FormValues>> {
    type Scoped = Extract<PathValue<T, P>, FormValues>

    const join = (name: string) => `${path}.${name}` as const

    const scoped: UseFormResult<T, Scoped> = {
        ...form,

        register: (name =>
            form.register(join(name) as never)
        ) as FormRegister<Scoped>,

        setValue: ((name, value) =>
            form.setValue(join(name) as never, value as never)
        ) as FormSetValue<Scoped>,

        watch: ((name?: string) =>
            form.watch(
                (name === undefined ? path : join(name)) as never
            )
        ) as FormWatch<Scoped>,

        useFieldArray: (name =>
            form.useFieldArray(join(name) as any)
        ) as FormUseFieldArray<Scoped>,

        scope: (prefix =>
            createScope(form, join(prefix) as any)
        ) as FormScope<Scoped>,
    }

    return scoped
}


export function useForm<T extends FormValues>(defaultValues: T): UseFormResult<T> {
    const [values, setValues] = useState<T>(defaultValues)
    const [error, setError] = useState<string | undefined>()

    const update = useCallback(
        <P extends PathTo<T, unknown>>(
            path: P,
            fn: (previous: PathValue<T, P>) => PathValue<T, P>,
        ) => {
            setValues(previous => setIn(previous, path, fn(getIn(previous, path))))
        },
        [],
    )

    const setValue: FormSetValue<T> = useCallback(
        (name, value) => update(name, () => value),
        [],
    )

    const register: FormRegister<T> = name => {
        const current = getIn(values, name as PathTo<T, unknown>)

        return {
            name,
            ref: element => {
                if (!element) return

                if (current === undefined) {
                    const next = readFromElement(element)
                    if (next !== undefined) {
                        update(name as PathTo<T, unknown>, () => next as any)
                        return
                    }
                }

                writeToElement(element, current as FormFieldValue)
            },
            onChange: event => {
                const next = extractFromEvent(event)
                update(name as PathTo<T, unknown>, () => next as any)
            },
        }
    }

    const handleSubmit: FormHandleSubmit<T> = onValid =>
        async event => {
            event?.preventDefault?.()
            await onValid(values)
            setError(undefined)
        }

    function watch(): T;
    function watch<P extends PathTo<T, unknown>>(path: P): PathValue<T, P>

    function watch<P extends PathTo<T, unknown>>(name?: P) {
        return name === undefined
            ? values
            : getIn(values, name)
    }

    function useFieldArray<P extends PathTo<T, readonly unknown[]>>(name: P) {
        type Item = ArrayPathValue<T, P>

        const list = getIn(values, name as any) as Item[]

        const [ids, setIds] = useState<string[]>(() => list.map(() => newId()))

        const apply = (
            updateItems: (items: Item[]) => Item[],
            updateIds: (currentIds: string[]) => string[],
        ) => {
            update(name as any, prev =>
                updateItems(prev as any) as any
            )
            setIds(updateIds)
        }

        const fields: Field<Item>[] = list.map((item, index) => {
            return {
                ...item,
                id: ids[index] ?? `${name}.${index}`,
            }
        })

        const append = (...items: Item[]) => {
            const addedIds = items.map(() => newId())
            apply(
                current => [...current, ...items],
                current => [...current, ...addedIds],
            )
        }

        const prepend = (...items: Item[]) => {
            const addedIds = items.map(() => newId())
            apply(
                current => [...items, ...current],
                current => [...addedIds, ...current],
            )
        }

        const insert = (index: number, ...items: Item[]) => {
            const addedIds = items.map(() => newId())
            apply(
                current => [...current.slice(0, index), ...items, ...current.slice(index)],
                current => [...current.slice(0, index), ...addedIds, ...current.slice(index)],
            )
        }

        /** remove() — очистить всё, remove(i) или remove([i, j]) — удалить выбранные */
        const remove = (index?: number | number[]) => {
            if (index === undefined) {
                apply(() => [], () => [])
                return
            }

            const dropped = new Set(Array.isArray(index) ? index : [index])
            const keep = <Value,>(items: Value[]) => items.filter((_, itemIndex) => !dropped.has(itemIndex))
            apply(keep, keep)
        }

        const swap = (a: number, b: number) => {
            const swapped = <Value,>(items: Value[]) =>
                items.map((item, index) =>
                    index === a ? items[b] as Value : index === b ? items[a] as Value : item,
                )
            apply(swapped, swapped)
        }

        const move = (from: number, to: number) => {
            const moved = <Value,>(items: Value[]) => {
                const copy = items.slice()
                copy.splice(to, 0, ...copy.splice(from, 1))
                return copy
            }
            apply(moved, moved)
        }

        const replace = (items: Item[]) =>
            apply(
                () => items,
                () => items.map(() => newId()),
            )

        return { fields, append, prepend, insert, remove, swap, move, replace }
    }
    
    const formRef = useRef<UseFormResult<T>>(null)

    const [FormProvider] = useState(() => ({ children }: PropsWithChildren) => 
        <FormContext.Provider value={formRef.current}>{children}</FormContext.Provider>
    )

    const form: UseFormResult<T> = {
        register,
        handleSubmit,
        watch,
        setValue,
        formError: error,
        setError: e => setError(e?.message),
        FormProvider,
        useFieldArray,
        scope: <P extends PathTo<T, FormValues>>(path: P) => createScope(form, path),
    }

    formRef.current = form

    return form
}

export function useFormContext<T extends FormValues>(): UseFormResult<T> {
    const form = useContext(FormContext)

    if (!form) {
        throw new Error('useFormContext должен вызываться внутри <FormProvider>')
    }

    return form
}

