import * as React from 'react'

const { createContext, useState, useContext, useEffect, useCallback } = React

import { usePromise } from '@saas-ui/hooks'

export type AuthTypeEnum = 'magiclink' | 'password'

export type AuthActionEnum = 'logIn' | 'signUp'

export type AuthToken = string | null | undefined

export interface AuthParams {
  email?: string
  password?: string
  provider?: string
  refreshToken?: string
  otp?: string
  [key: string]: any
}

export type ExtraAuthOptions = Record<string, unknown>
export type AuthOptions<ExtraOptions extends object = ExtraAuthOptions> = {
  /**
   * The url to redirect to after social or magic link login.
   */
  redirectTo?: string
} & ExtraOptions

/**
 * The user object
 */
export interface User {
  [key: string]: any
}

export interface DefaultUser extends User {
  id?: string | null
  email?: string | null
}

type UnsubscribeHandler = () => void

export type AuthStateChangeCallback<TUser extends User = DefaultUser> = (
  user?: TUser | null
) => void

export interface AuthProviderProps<TUser extends User = DefaultUser> {
  /**
   * Loads user data after authentication
   */
  onLoadUser?: () => Promise<TUser | null>
  /**
   * The signup method
   */
  onSignup?: (
    params: AuthParams,
    options?: AuthOptions
  ) => Promise<TUser | undefined | null>
  /**
   * The login method
   */
  onLogin?: (
    params: AuthParams,
    options?: AuthOptions
  ) => Promise<TUser | undefined | null>
  /**
   * Request to reset a password.
   */
  onResetPassword?: (
    params: Required<Pick<AuthParams, 'email'>>,
    options?: AuthOptions
  ) => Promise<any>
  /**
   * Update the password.
   */
  onUpdatePassword?: (
    params: Required<Pick<AuthParams, 'password'>>,
    options?: AuthOptions
  ) => Promise<any>
  /**
   * Verify an one time password (2fa)
   */
  onVerifyOtp?: (
    params: OtpParams,
    options?: AuthOptions
  ) => Promise<boolean | undefined | null>
  /**
   * The logout method
   */
  onLogout?: (options?: AuthOptions) => Promise<unknown>
  /**
   * Should trigger whenever the authentication state changes
   */
  onAuthStateChange?: (
    callback: AuthStateChangeCallback<TUser>
  ) => UnsubscribeHandler
  /**
   * Return the session token
   */
  onGetToken?: () => Promise<AuthToken>

  children?: React.ReactNode
}

export type AuthFunction<
  TParams = AuthParams,
  TExtraOptions extends object = Record<string, unknown>
> = (params: TParams, options?: AuthOptions<TExtraOptions>) => Promise<any>

interface OtpParams extends AuthParams {
  otp: string
}

type ResetPasswordParams = Required<Pick<AuthParams, 'email'>>
type UpdatePasswordParams = Required<Pick<AuthParams, 'password'>>

export interface AuthContextValue<TUser extends User = DefaultUser> {
  isAuthenticated: boolean
  isLoggingIn: boolean
  isLoading: boolean
  user?: TUser | null
  signUp: AuthFunction
  logIn: AuthFunction
  verifyOtp: AuthFunction<OtpParams>
  resetPassword: AuthFunction<ResetPasswordParams>
  updatePassword: AuthFunction<UpdatePasswordParams>
  logOut: (options?: AuthOptions) => Promise<unknown>
  loadUser: () => void
  getToken: () => Promise<AuthToken>
}

const createAuthContext = <TUser extends User = DefaultUser>() => {
  return createContext<AuthContextValue<TUser> | null>(null)
}

export const AuthContext = createAuthContext()

export const AuthProvider = <TUser extends User = DefaultUser>({
  onLoadUser = () => Promise.resolve(null),
  onSignup = () => Promise.resolve(null),
  onLogin = () => Promise.resolve(null),
  onVerifyOtp = () => Promise.resolve(null),
  onLogout = () => Promise.resolve(),
  onAuthStateChange,
  onGetToken,
  onResetPassword,
  onUpdatePassword,
  children,
}: AuthProviderProps<TUser>) => {
  const [isAuthenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<TUser | null>()
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    if (onAuthStateChange) {
      const unsubscribe = onAuthStateChange((user) => {
        setAuthenticated(!!user)
      })
      return () => {
        unsubscribe?.()
      }
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [isAuthenticated])

  const checkAuth = useCallback(async () => {
    try {
      if (onGetToken) {
        const isAuthenticated = !!(await onGetToken())
        setAuthenticated(isAuthenticated)
        return isAuthenticated
      }
    } catch (e) {
      setAuthenticated(false)
    }
  }, [onGetToken])

  useEffect(() => {
    window.addEventListener('focus', checkAuth)
    return () => {
      window.removeEventListener('focus', checkAuth)
    }
  }, [checkAuth])

  const loadUser = useCallback(async () => {
    const isAuthenticated = await checkAuth()

    if (isAuthenticated) {
      const user = await onLoadUser()

      if (user) {
        setUser(user)
      } else {
        setAuthenticated(false)
      }
    }

    setLoading(false)
  }, [onLoadUser, checkAuth])

  const signUp = useCallback(
    async (params: AuthParams, options?: AuthOptions) => {
      const result = await onSignup(params, options)
      checkAuth() // In case the auth service authenticates the user directly.
      return result
    },
    [onSignup]
  )

  const logIn = useCallback(
    async (params: AuthParams, options?: AuthOptions) => {
      const result = await onLogin(params, options)
      checkAuth() // In case the auth service authenticates the user directly.
      return result
    },
    [onLogin]
  )

  const logOut = useCallback(async () => {
    await onLogout()
    setUser(null)
    setAuthenticated(false)
  }, [onLogout])

  const verifyOtp = useCallback(
    async (params: OtpParams, options?: AuthOptions) => {
      const result = await onVerifyOtp(params, options)
      return result
    },
    [onVerifyOtp]
  )

  const resetPassword = useCallback(
    async (
      params: Required<Pick<AuthParams, 'email'>>,
      options?: AuthOptions
    ) => {
      return await onResetPassword?.(params, options)
    },
    [onResetPassword]
  )

  const updatePassword = useCallback(
    async (
      params: Required<Pick<AuthParams, 'password'>>,
      options?: AuthOptions
    ) => {
      return await onUpdatePassword?.(params, options)
    },
    [onUpdatePassword]
  )

  const getToken = useCallback(async () => {
    return onGetToken?.()
  }, [onGetToken])

  const value: AuthContextValue<TUser> = {
    isAuthenticated,
    isLoggingIn: isAuthenticated && !user,
    isLoading,
    user,
    signUp,
    logIn,
    logOut,
    verifyOtp,
    loadUser,
    getToken,
    resetPassword,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = <
  TUser extends User = DefaultUser
>(): AuthContextValue<TUser> => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error(
      'Auth context missing, did you forget to wrap your app in AuthProvider?'
    )
  }

  return context as AuthContextValue<TUser>
}

export const useCurrentUser = <TUser extends User = DefaultUser>():
  | TUser
  | null
  | undefined => {
  return useAuth<TUser>().user
}

export interface UseLoginProps {
  action?: AuthActionEnum
}

export const useLogin = ({ action = 'logIn' }: UseLoginProps = {}) => {
  const auth = useAuth()
  const fn = auth[action] || auth['logIn']
  return usePromise<AuthFunction>(fn)
}

export const useSignUp = () => {
  const { signUp } = useAuth()
  return usePromise(signUp)
}

export const useOtp = () => {
  const { verifyOtp } = useAuth()
  return usePromise(verifyOtp)
}

export const useResetPassword = () => {
  const { resetPassword } = useAuth()
  return usePromise(resetPassword)
}

export const useUpdatePassword = () => {
  const { updatePassword } = useAuth()
  return usePromise(updatePassword)
}
