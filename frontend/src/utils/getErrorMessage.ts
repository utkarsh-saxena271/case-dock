import { isAxiosError } from 'axios'

export const getErrorMessage = (err: unknown, fallback = 'Something went wrong'): string => {
  if (isAxiosError(err)) {
    return err.response?.data?.message ?? err.message
  }

  if (err instanceof Error) {
    return err.message
  }

  return fallback
}