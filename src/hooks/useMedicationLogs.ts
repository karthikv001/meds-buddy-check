import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../Provider'

export const useMedicationLogs = (date: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['medication_logs', user?.id, date],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await supabase
        .from('medication_logs')
        .select('medication_id, status')
        .eq('user_id', user.id)
        .eq('date', date)

      if (error) throw error
      return data
    },
    enabled: !!user?.id && !!date,
  })
}
