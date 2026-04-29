import { toast } from 'sonner'

export function useToast() {
  return { addToast: toast }
}
