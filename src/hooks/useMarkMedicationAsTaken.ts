import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../Provider'

export const useMarkMedicationAsTaken = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ medicationId, date }: { medicationId: string; date: string }) => {
      const { error } = await supabase.from('medication_logs').upsert(
        [
          {
            medication_id: medicationId,
            user_id: user?.id,
            date,
            status: 'taken',
          },
        ],
        {
          onConflict: 'medication_id,user_id,date',
        }
      )

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medication_logs'])
    },
  })
}
