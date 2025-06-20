import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Logout() {
  const navigate = useNavigate()

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={logout}
              className="p-3 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Logout</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}