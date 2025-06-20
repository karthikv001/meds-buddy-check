import { useState } from 'react'
import {
  useMedications,
  useDeleteMedication,
  useUpdateMedication,
} from '../hooks/useMedications'
import { useAuth } from '../Provider'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoreVertical } from 'lucide-react'

export default function MedicationList() {
  const { user } = useAuth()
  const { data: medications, isLoading } = useMedications(user?.id || '')
  const deleteMutation = useDeleteMedication()
  const updateMutation = useUpdateMedication()

  const [editing, setEditing] = useState<any | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      month: 'short',
      day: 'numeric',
    })

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this medication?')) {
      deleteMutation.mutate({ id, user_id: user!.id })
    }
  }

  const handleEditSave = () => {
    if (!editing || !user) return

    updateMutation.mutate(
      {
        id: editing.id,
        user_id: user.id,
        name: editing.name,
        dosage: editing.dosage,
        frequency: editing.frequency,
      },
      {
        onSuccess: () => {
          setEditing(null)
          setIsEditOpen(false)
        },
      }
    )
  }

  if (isLoading) return <p>Loading medications...</p>
  if (!medications || medications.length === 0) return <p>No medications found</p>

  return (
    <div className="overflow-x-auto">
      <h3 className="text-xl font-bold mb-4">Your Medications</h3>
      <table className="min-w-full border rounded-md overflow-hidden text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800 text-left">
          <tr>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Dosage</th>
            <th className="px-4 py-2 font-medium">Frequency</th>
            <th className="px-4 py-2 font-medium">Date</th>
            <th className="px-4 py-2 font-medium text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {medications.map((med) => (
            <tr key={med.id} className="border-t">
              <td className="px-4 py-2">{med.name}</td>
              <td className="px-4 py-2">{med.dosage}</td>
              <td className="px-4 py-2">{med.frequency}</td>
              <td className="px-4 py-2 text-muted-foreground">
                {formatDate(med.start_date)}
              </td>
              <td className="px-4 py-2 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditing(med)
                        setIsEditOpen(true)
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(med.id)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={editing?.name || ''}
                onChange={(e) =>
                  setEditing((prev: any) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Dosage</Label>
              <Input
                value={editing?.dosage || ''}
                onChange={(e) =>
                  setEditing((prev: any) => ({ ...prev, dosage: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Frequency</Label>
              <Input
                value={editing?.frequency || ''}
                onChange={(e) =>
                  setEditing((prev: any) => ({ ...prev, frequency: e.target.value }))
                }
              />
            </div>
            <Button onClick={handleEditSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
