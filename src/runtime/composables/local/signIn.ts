import { SecondarySignInOptions } from '../../types'
import { _fetch } from '../../utils/fetch'
import { jsonPointerGet, useTypedBackendConfig } from '../../helpers'
import { getRequestURLWN } from '../../utils/callWithNuxt'
import { useAuthState } from './useAuthState'
import { useNuxtApp, useRuntimeConfig, nextTick, navigateTo } from '#imports'
import { Credentials, getSession } from './useAuth'

export const signIn = async (credentials: string | string[][] | Record<string, string> | URLSearchParams | Credentials | undefined, signInOptions: SecondarySignInOptions | undefined, signInParams?: undefined) => {
const nuxt = useNuxtApp()
const config = useTypedBackendConfig(useRuntimeConfig(), 'local')
const { path, method, headers } = config.endpoints.signIn

const response: Record<string, any> = await _fetch(nuxt, path, {
method,

body: new URLSearchParams({
...credentials,
...(signInOptions ?? {})
}).toString(),

params: signInParams ?? {},

headers
})

const extractedToken = jsonPointerGet(
response,
config.token.signInResponseTokenPointer
)
if (typeof extractedToken !== 'string') {
console.error(
`Auth: string token expected, received instead: ${JSON.stringify(
extractedToken
)}. Tried to find token at ${config.token.signInResponseTokenPointer} in ${JSON.stringify(response)}`
)
return;
}

const { rawToken } = useAuthState()
rawToken.value = extractedToken

await nextTick(getSession)

const { callbackUrl, redirect = true, external } = signInOptions ?? {}
if (redirect) {
const urlToNavigateTo = callbackUrl ?? (await getRequestURLWN(nuxt))
return navigateTo(urlToNavigateTo, { external })
}
}
