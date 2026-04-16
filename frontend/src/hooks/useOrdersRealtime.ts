import { useEffect, useRef } from 'react'

import { supabase } from '../services/supabaseClient'

type OrdersRealtimeCallback = () => void | Promise<void>

export function useOrdersRealtime(callback: OrdersRealtimeCallback) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ordens_de_servico'
        },
        () => {
          console.log('Realtime event received')
          void callbackRef.current()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])
}
