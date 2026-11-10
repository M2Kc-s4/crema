import { createContext, useCallback, useContext, useMemo, useState, type FC, type PropsWithChildren } from "react";

type LoadingContextType = {
    isLoading: boolean, 
    toggleLoadingOn: () => void, 
    toggleLoadingOff: () => void
}

const LoadingContext = createContext<LoadingContextType | null>(null)

export const LoadingProvider: FC<PropsWithChildren> = ({children})=> {
    const [isLoading, setLoading] = useState(true)

    const toggleLoadingOn = useCallback(() => setLoading(true), [])
    const toggleLoadingOff = useCallback(() => setLoading(false), [])

    const value = useMemo(()=> ({
        isLoading, toggleLoadingOff, toggleLoadingOn
    }), [isLoading])

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    )
}

export const useLoading = ()=> {
    const context = useContext(LoadingContext)

    if(!context) throw Error('useLoading must be used within LoadingProvider')

    return context
}