import { useState } from 'react'
import { useAddMedication } from '../hooks/useMedications'
import { useAuth } from '../Provider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function AddMedicationForm() {
  const { user } = useAuth()
  const mutation = useAddMedication()
  const [open, setOpen] = useState(false)

  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [hour, setHour] = useState('08')
  const [minute, setMinute] = useState('00')
  const [ampm, setAmPm] = useState('AM')

  
  const combineDateAndTime = (dateStr: string, hour: string, minute: string, ampm: string) => {
    let h = parseInt(hour)
    if (ampm === 'PM' && h < 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0
    const date = new Date(dateStr)
    date.setHours(h, parseInt(minute), 0)
    return date.toISOString() 
  }

  const handleAdd = () => {
    if (!user || !name || !startDate ) {
      alert('Please fill all required fields.')
      return
    }

    const fullStart = combineDateAndTime(startDate, hour, minute, ampm)
 
    mutation.mutate({
      name,
      dosage,
      frequency,
      user_id: user.id,
      start_date: fullStart,
    })

   
    setName('')
    setDosage('')
    setFrequency('')
    setStartDate('')
    setEndDate('')
    setHour('08')
    setMinute('00')
    setAmPm('AM')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">Add Medication</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Medication</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Dosage</Label>
            <Input value={dosage} onChange={(e) => setDosage(e.target.value)}  />
          </div>
          <div>
            <Label>Frequency</Label>
            <Input value={frequency} onChange={(e) => setFrequency(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            {/* <div>
              <Label>To</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div> */}
          </div>
          <div>
            <Label>Time of Day</Label>
            <div className="flex gap-2 items-center">
              <select value={hour} onChange={(e) => setHour(e.target.value)} className="border rounded px-2 py-1">
                {[...Array(12)].map((_, i) => {
                  const val = String(i + 1).padStart(2, '0')
                  return <option key={val} value={val}>{val}</option>
                })}
              </select>
              <span>:</span>
              <select value={minute} onChange={(e) => setMinute(e.target.value)} className="border rounded px-2 py-1">
                {['00', '15', '30', '45'].map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
              <select value={ampm} onChange={(e) => setAmPm(e.target.value)} className="border rounded px-2 py-1">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          <Button onClick={handleAdd} disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? 'Adding...' : 'Add Medication'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
