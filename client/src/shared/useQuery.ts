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

type UseQueryOptions<T, E> = {
	query: () => Future<T, E>
	key?: string
	tags?: string[] | string
	enabled?: boolean
	deps?: unknown[]
	staleTime?: number
}

type UseQueryResult<T, E> = {
	data: T | undefined
	error: E | undefined
	isLoading: boolean
	isFetching: boolean
	isError: boolean
	isSuccess: boolean
	refetch: () => void
}

type QueryState<T, E> = {
	data: T | undefined
	error: E | undefined
	isLoading: boolean
	isFetching: boolean
	isError: boolean
	isSuccess: boolean
}


export function useQuery<T, E = unknown>({
	query, enabled = true, tags = EMPTY_TAGS, deps = EMPTY_DEPS, key, staleTime = 0
}: UseQueryOptions<T, E>) {
	const registry = useQueryRegistry()

	const [state, setState] = useState<QueryState<T, E>>(() => {
		const entry = key ? registry.getEntry(key) : undefined
		return {
			data: entry?.data as T | undefined,
			error: undefined,
			isLoading: entry === undefined,
			isFetching: false,
			isError: false,
			isSuccess: entry !== undefined,
		}
	})

	const queryRef = useRef(query)
	queryRef.current = query

	const keyRef = useRef(key)
	keyRef.current = key

	const tagsArray = typeof tags === 'string' ? [tags] : tags

	const run = useCallback((): void => {
		const k = keyRef.current
		if (k && !registry.acquire(k)) return
		
		setState(s => ({ ...s, isLoading: s.data === undefined, isFetching: true, isError: false, isSuccess: false }))

		queryRef.current()
			.tap(data => {
				if (k) { registry.setCached(k, data); registry.release(k) }
				setState({ data, error: undefined, isLoading: false, isFetching: false, isError: false, isSuccess: true })
			})
			.tapErr(error => {
				if (k) registry.release(k)
				setState(s => ({ ...s, error, isLoading: false, isFetching: false, isError: true, isSuccess: false }))
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
			setState(s => ({
				...s, data: data as T, error: undefined,
				isLoading: false, isFetching: false, isError: false, isSuccess: true,
			})),
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
	mutation: FutureFunction<T, E, P>
	refetches?: ((data: T, ...args: P) => string[] | string) | string[] | string
	onSuccess?: (data: T) => void
	onError?: (error: E) => void
}


type UseMutationResult<T, E, P extends Array<any>> = {
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


export function useMutation<T, E, P extends Array<any>>(params: UseMutationOptions<T, E, P>): UseMutationResult<T, E, P> {
	const registry = useQueryRegistry()
	const [state, setState] = useState<MutationState>({
		isPending: false,
		isError: false,
		isSuccess: false,
	})

	const mutation = useRef(params.mutation)
	mutation.current = params.mutation
	const refetches = useRef(params.refetches)
	refetches.current = params.refetches
	const onSuccess = useRef(params.onSuccess)
	onSuccess.current = params.onSuccess
	const onError = useRef(params.onError)
	onError.current = params.onError

	const mutate = useCallback((...args: P) => {
		setState({ isPending: true, isError: false, isSuccess: false })

		void mutation.current(...args).tap(data => {
			if (refetches.current) {
				const toRefetch = typeof refetches.current === "function"
					? refetches.current(data, ...args)
					: refetches.current
				registry.refetch(
					typeof toRefetch === 'string'
						? 	[toRefetch]
						:   toRefetch
				) 
			}

			onSuccess.current?.(data)
			setState({ isPending: false, isError: false, isSuccess: true })
		})
		.tapErr(error => {			
			onError.current?.(error)
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