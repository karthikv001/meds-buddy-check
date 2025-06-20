import { CalendarIcon, CheckCircle2, UploadCloud } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export default function TodaysMedicationTable({
  todayMeds,
  onMarkTaken,
}: {
  todayMeds: any[]
  onMarkTaken: (id: string, photoUrl: string) => void
}) {
  return (
    <Card className="h-fit w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          Today's Medications
        </CardTitle>
      </CardHeader>

      <CardContent>
        {todayMeds.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No medications scheduled for today.
          </p>
        ) : (
          <div className="space-y-4">
            {todayMeds.map((med) => (
              <MedicationCardRow key={med.id} med={med} onMarkTaken={onMarkTaken} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MedicationCardRow({
  med,
  onMarkTaken,
}: {
  med: any
  onMarkTaken: (id: string, photoUrl: string) => void
}) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [taken, setTaken] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhoto(e.target.files[0])
    }
  }

  const handleMark = async () => {
    if (!photo) {
      alert('Please upload a photo.')
      return
    }

    setUploading(true)

    // Replace with Supabase upload logic
    const photoUrl = URL.createObjectURL(photo)
    await new Promise((res) => setTimeout(res, 1000))

    onMarkTaken(med.id, photoUrl)
    setTaken(true)
    setUploading(false)
  }

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Medication Info */}
        <div>
          <h4 className="text-lg font-semibold">{med.name}</h4>
          <p className="text-sm text-muted-foreground">
            {med.dosage} • {med.frequency}
          </p>
        </div>

        {/* Upload & Action */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch">
          <Label className="sr-only" htmlFor={`photo-${med.id}`}>
            Upload Proof
          </Label>
          <Input
            id={`photo-${med.id}`}
            type="file"
            accept="image/*"
            disabled={taken}
            onChange={handlePhotoUpload}
            className="w-full sm:w-48"
          />
          <Button
            size="sm"
            onClick={handleMark}
            disabled={taken || uploading || !photo}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
          >
            {taken ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Taken
              </>
            ) : uploading ? (
              'Uploading...'
            ) : (
              <>
                <UploadCloud className="w-4 h-4 mr-1" />
                Mark as Taken
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
