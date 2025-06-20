import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export const useMedications = (userId: string | null) => {
  return useQuery({
    queryKey: ['medications', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export const useAddMedication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newMed: {
        name: string
        dosage: string
        frequency: string
        user_id: string
        start_date: string 
        end_date: string
        time_of_day: string 
      }) => {
        const { error } = await supabase.from('medications').insert([newMed])
        if (error) throw error
      },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(['medications', vars.user_id])
    },
  })
}

export const useUpdateMedication = () => {
    const queryClient = useQueryClient()
  
    return useMutation({
      mutationFn: async (payload: {
        id: string
        user_id: string
        name: string
        dosage: string
        frequency: string
      }) => {
        const { error } = await supabase
          .from('medications')
          .update({
            name: payload.name,
            dosage: payload.dosage,
            frequency: payload.frequency,
          })
          .eq('id', payload.id)
  
        if (error) throw error
      },
      onSuccess: (_, { user_id }) => {
        queryClient.invalidateQueries(['medications', user_id])
      },
    })
  }

  
  export const useDeleteMedication = () => {
    const queryClient = useQueryClient()
  
    return useMutation({
      mutationFn: async (payload: { id: string; user_id: string }) => {
        const { error } = await supabase
          .from('medications')
          .delete()
          .eq('id', payload.id)
  
        if (error) throw error
      },
      onSuccess: (_, { user_id }) => {
        queryClient.invalidateQueries(['medications', user_id])
      },
    })
  }
  
