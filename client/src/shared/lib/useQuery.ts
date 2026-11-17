import {
	createContext,
	useContext,
	useMemo,
	useState,
	useEffect,
	useRef,
	useCallback,
	type PropsWithChildren,
	createElement,
} from 'react'

import { Future } from 'fluent-future'

const EMPTY_TAGS: string[] = []
const EMPTY_DEPS: unknown[] = []

type Entry = { data: unknown; updatedAt: number }

class QueryRegistry {
	private cache = new Map<string, Entry>()
	private listeners = new Map<string, Set<(data: unknown) => void>>()
	private inflight = new Set<string>()
	private registry = new Map<string, Set<() => void>>()

	getEntry(key: string) { return this.cache.get(key) }

	setCached(key: string, data: unknown) {
		this.cache.set(key, { data, updatedAt: Date.now() })
		this.listeners.get(key)?.forEach(l => l(data))
	}

	subscribe(key: string, l: (data: unknown) => void) {
		if (!this.listeners.has(key)) this.listeners.set(key, new Set())
		this.listeners.get(key)!.add(l)
		return () => { this.listeners.get(key)?.delete(l) }
	}

	acquire(key: string) {
		if (this.inflight.has(key)) return false
		this.inflight.add(key)
		return true
	}
	release(key: string) { this.inflight.delete(key) }

	register(tags: string[], refetch: () => void): () => void {
		for (const tag of tags) {
			if (!this.registry.has(tag)) this.registry.set(tag, new Set())
			this.registry.get(tag)!.add(refetch)
		}

		return () => {
			for (const tag of tags) {
				this.registry.get(tag)?.delete(refetch)
			}
		}
	}

	refetch(tags: string[]): void {
		const toRefetch = new Set<() => void>()
		for (const tag of tags) {
			this.registry.get(tag)?.forEach(r => toRefetch.add(r))
		}
		for (const refetch of toRefetch) refetch()
	}
}

const QueryRegistryContext = createContext<QueryRegistry | null>(null)

export function QueryRegistryProvider({ children }: PropsWithChildren) {
	const registry = useMemo(() => new QueryRegistry(), [])

	return createElement(QueryRegistryContext.Provider, { value: registry }, children)
}

export function useQueryRegistry() {
	const registry = useContext(QueryRegistryContext)
	if (!registry) throw new Error('ComposeRegistryProvider missing')

	return registry
}

type UseQueryOptions = {
	key?: string
	tags?: string[] | string
	enabled?: boolean
	deps?: unknown[]
	staleTime?: number
}

type LoadingState<E> = {
    data: undefined
    error: undefined
    isLoading: true
    isFetching: boolean
    isError: false
    isSuccess: false
}

type SuccessState<T> = {
    data: T
    error: undefined
    isLoading: false
    isFetching: boolean  
    isError: false
    isSuccess: true
}

type ErrorState<T, E> = {
    data: T | undefined
    error: E
    isLoading: false
    isFetching: boolean
    isError: true
    isSuccess: false
}

type QueryState<T, E> = LoadingState<E> | SuccessState<T> | ErrorState<T, E>

type UseQueryResult<T, E> = QueryState<T, E> & { refetch: () => void }

const loading = <T, E>(isFetching = false): QueryState<T, E> => ({
    data: undefined, error: undefined,
    isLoading: true, isFetching, isError: false, isSuccess: false,
})

const success = <T, E>(data: T, isFetching = false): QueryState<T, E> => ({
    data, error: undefined,
    isLoading: false, isFetching, isError: false, isSuccess: true,
})

const failure = <T, E>(data: T | undefined, error: E): QueryState<T, E> => ({
    data, error,
    isLoading: false, isFetching: false, isError: true, isSuccess: false,
})


export function useQuery<T, E>(
	query: () => Future<T, E>, 
	{ enabled = true, tags = EMPTY_TAGS, deps = EMPTY_DEPS, key, staleTime = 0 }: UseQueryOptions = {}
): UseQueryResult<T, E> {
	const registry = useQueryRegistry()

	const [state, setState] = useState<QueryState<T, E>>(() => {
		const entry = key ? registry.getEntry(key) : undefined
		return entry ? success(entry.data as T) : loading()
	})

	const queryRef = useRef(query)
	queryRef.current = query

	const keyRef = useRef(key)
	keyRef.current = key

	const tagsArray = typeof tags === 'string' ? [tags] : tags

	const run = useCallback((): void => {
		const k = keyRef.current
		if (k && !registry.acquire(k)) return
		
		setState(s =>
            s.data === undefined
                ? loading<T, E>(true)
                : success<T, E>(s.data, true),
        )

		queryRef.current()
            .tap(data => {
                if (k) { registry.setCached(k, data); registry.release(k) }
                setState(success<T, E>(data))
            })
            .tapErr(error => {
                if (k) registry.release(k)
                setState(s => failure<T, E>(s.data, error))
            })
            .recover()
    }, [registry])

	useEffect(() => {
        if (!enabled) return
        const entry = key ? registry.getEntry(key) : undefined
        if (entry && Date.now() - entry.updatedAt < staleTime) return
        run()
    }, [enabled, key, ...deps])

    useEffect(() => {
        if (!key) return
        return registry.subscribe(key, data =>
            setState(s => success<T, E>(data as T, s.isFetching)),
        )
    }, [registry, key])

	useEffect(() => {
		const all = key && !tagsArray.length ? [key] : tagsArray
		return registry.register(all, run)
	}, [registry, key, tagsArray.join('|')])

	return { ...state, refetch: run }
}


type FutureFunction<T, E, P extends Array<any>> = (...args: P) => Future<T, E>


type UseMutationOptions<T, E, P extends Array<any>> = {
	refetches?: ((data: T, ...args: P) => string[] | string) | string[] | string
	onSuccess?: (data: T) => void
	onError?: (error: E) => void
}


type UseMutationResult<P extends Array<any>> = {
	mutate: (...args: P) => void
	isPending: boolean
	isError: boolean
	isSuccess: boolean
}


type MutationState = {
	isPending: boolean
	isError: boolean
	isSuccess: boolean
}


export function useMutation<T, E, P extends Array<any>>(mutation: FutureFunction<T, E, P>, params: UseMutationOptions<T, E, P> = {}): UseMutationResult<P> {
	const registry = useQueryRegistry()
	const [state, setState] = useState<MutationState>({
		isPending: false,
		isError: false,
		isSuccess: false,
	})

	const mutationRef = useRef(mutation)
	mutationRef.current = mutation
	const refetchesRef = useRef(params.refetches)
	refetchesRef.current = params.refetches
	const onSuccessRef = useRef(params.onSuccess)
	onSuccessRef.current = params.onSuccess
	const onErrorRef = useRef(params.onError)
	onErrorRef.current = params.onError

	const mutate = useCallback((...args: P) => {
		setState({ isPending: true, isError: false, isSuccess: false })

		void mutationRef.current(...args).tap(data => {
			if (refetchesRef.current) {
				const toRefetch = typeof refetchesRef.current === "function"
					? refetchesRef.current(data, ...args)
					: refetchesRef.current
				registry.refetch(
					typeof toRefetch === 'string'
						? 	[toRefetch]
						:   toRefetch
				) 
			}

			onSuccessRef.current?.(data)
			setState({ isPending: false, isError: false, isSuccess: true })
		})
		.tapErr(error => {			
			onErrorRef.current?.(error)
			setState({ isPending: false, isError: true, isSuccess: false })
		})
		.recover()
		
	}, [registry])

	return {
		mutate,
		...state,
	}
}

export type {
	UseQueryOptions,
	UseQueryResult,
	UseMutationOptions,
	UseMutationResult
}