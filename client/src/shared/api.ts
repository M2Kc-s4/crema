import type { AccessToken } from "domain/session"
import { Err, Future, Ok } from "fluent-future"


export class ApiError {
    constructor(
        public status: number,
        public code: string, 
        public message: string
    ) {}
}

export type QueryParams = RequestInit & { queries?: Record<string, number | string> }

type RefreshResponse = { 
    access: AccessToken
}


const fetchFuture = (input: string | URL | RequestInfo, init?: RequestInit) => Future.of(
    fetch(input, init),
    () => new ApiError(503, "SERVER_UNAVAILABLE", "Server unavailable")
)

const parseJson = <T = any>(response: Response) => Future.of(
    response.json() as Promise<T>,
    () => new ApiError(response.status, 'PARSE_ERROR', 'Invalid JSON')
)



export class ApiClient {
    private ROOT_PATH
    private _access: AccessToken | null = null

    constructor (rootPath: string, private _refreshPath: string) {
        this.ROOT_PATH = rootPath
    }


    private _refreshFuture: Future<RefreshResponse, ApiError> | null = null


    private _errorHandlers: Map<number, (error: ApiError) => void> = new Map()

    onError(status: number, handler: (error: ApiError) => void) {
        this._errorHandlers.set(status, handler)
    }


    public setAccess(token: AccessToken) {
        this._access = token
    }

    public removeAccess() {
        this._access = null
    }


    private _refreshToken(): Future<RefreshResponse, ApiError> {
        if (!this._refreshFuture) {
            this._refreshFuture = this._performRefresh()
                .finally(() => this._refreshFuture = null)
        }

        return this._refreshFuture
    }


    private  _performRefresh(): Future<RefreshResponse, ApiError> {
        return fetchFuture(this.ROOT_PATH + this._refreshPath, {
            method: 'post',
            credentials: 'include',
        })
        .andThen(res => 
            res.ok
                ?    parseJson<RefreshResponse>(res)
                        .tap(data => this.setAccess(data.access))
                :   Err(new ApiError(401, "REFRESH_FAILED", "refresh failed"))
                        .tapErr(() => this.removeAccess())
        )
    }


    query<T = void>(url: string, params: QueryParams): Future<T, ApiError> {
        const { queryUrl, init } = this._prepareParams(url, params)

        return this._fetchWithRefresh(queryUrl, init)
            .bind({
                data: response => parseJson(response),
                response: response => response
            })
            .throwIf(
                ({response}) => !response.ok,
                ({response, data}) => new ApiError(response.status, data.code, data.message)
            )
            .tapErr(err => {                
                const handler = this._errorHandlers.get(err.status)
                handler && handler(err)
            })
            .tapErr(console.log)
            .map(({data}) => data as T)
    }


    get<T = void>(url: string, params?: Record<string, number | string>): Future<T, ApiError> {
        return this.query<T>(url, { queries: params })
    }


    post<T = void>(url: string, body?: Record<string, any>): Future<T, ApiError> {
        return this.query<T>(url, { body: JSON.stringify(body), method: "POST" })
    }


    private _prepareParams(queryUrl: string, params: QueryParams) {
        const init = structuredClone(params)
        queryUrl = this.ROOT_PATH + queryUrl
        if (params?.queries) {
            queryUrl += "?" + new URLSearchParams(params.queries as any).toString()
        }

        init.credentials = 'include'

        init.headers = {
            ...init?.headers,
            accept: 'application/json',
            "Content-Type": 'application/json',
        }

        if (this._access) {
            init.headers = {...init.headers, Authorization: `Bearer ${this._access}`}
        }

        return {queryUrl, init}
    }


    private _fetchWithRefresh(url: string, params: QueryParams) {
        return fetchFuture(url, params)
            .andThen(res => {
                if (res.status !== 401) return Ok(res)

                return this._refreshToken()
                    .tap(() => {
                        if (this._access) {
                            params.headers = {
                                ...params.headers,
                                Authorization: `Bearer ${this._access}`
                            }
                        }
                    })
                    .andThen(() => fetchFuture(url, params))

            })
    }
}

export const api = new ApiClient('http://localhost:8000', '/refresh')
