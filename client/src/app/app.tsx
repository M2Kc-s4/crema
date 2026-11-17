import './style.css'
import { type PropsWithChildren } from "react"
import { QueryRegistryProvider } from '@/shared/lib/useQuery'
import CurrentUserProvider from './providers/current-user-provider'
import { LoadingProvider, useLoading } from './providers/loading-provider'
import { BrowserRouter, useLoaderData } from 'react-router-dom'
import { Router } from './router'
import { BarsSpinner } from '@/shared/ui/spinner'
import { LoadingFeedback } from '@/shared/ui/feedback'


function Composition({ children }: PropsWithChildren) {
    return (
		<QueryRegistryProvider>
			<BrowserRouter>
				<LoadingProvider>
					<CurrentUserProvider>
						{children}
					</CurrentUserProvider>
				</LoadingProvider>
			</BrowserRouter>
		</QueryRegistryProvider>
	)
}

function View({ children }: PropsWithChildren) {
	const { isLoading } = useLoading()

	return isLoading
		?	<LoadingFeedback />
		:	children	
}

export function App() {
	return (
		<Composition>
			<View>
				<Router />
			</View>
		</Composition>
	)
}
