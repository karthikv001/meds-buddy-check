import { useState } from "react";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/Provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar as CalendarIcon, User } from "lucide-react";

const PatientDashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const today = new Date();
  const tomorrow = new Date(selectedDate);
  tomorrow.setDate(selectedDate.getDate() + 1);
  const todayStr = format(today, "yyyy-MM-dd");
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const tomorrowStr = format(tomorrow, "yyyy-MM-dd");
  const isTodaySelected = isToday(selectedDate);

  const { data: meds = [] } = useQuery({
    queryKey: ["medications", user?.id, selectedDateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user?.id)
        .lte("start_date", tomorrowStr);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const scheduledDates = new Set(
    meds.map((med) => format(new Date(med.start_date), "yyyy-MM-dd"))
  );

  const { data: logs = [] } = useQuery({
    queryKey: ["medication_logs_all", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medication_logs")
        .select("medication_id, date, photo_url")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const takenIds = new Set(
    logs
      .filter((log) => log.date === selectedDateStr)
      .map((log) => log.medication_id)
  );

  const markedDates = new Set(
    meds.length > 0
      ? logs.map((log) => format(new Date(log.date), "yyyy-MM-dd"))
      : []
  );

  const photoMap = new Map(
    logs
      .filter((log) => log.date === selectedDateStr && log.photo_url)
      .map((log) => [log.medication_id, log.photo_url])
  );

  const { mutate: markTaken, isPending: isMarkingTaken } = useMutation({
    mutationFn: async ({
      medicationId,
      file,
    }: {
      medicationId: string;
      file: File | null;
    }) => {
      setUploadError(null);
      let photo_url = null;

      if (file) {
        try {
          const fileName = `${user?.id}/${medicationId}-${Date.now()}-${file.name
            .replace(/\s+/g, "-")
            .replace(/[^a-zA-Z0-9-.]/g, "")}`;

          const { error: uploadError } = await supabase.storage
            .from("medication-photos")
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          const {
            data: { publicUrl },
          } = supabase.storage
            .from("medication-photos")
            .getPublicUrl(fileName);

          photo_url = publicUrl;
        } catch (error) {
          console.error("File upload error:", error);
          setUploadError(error instanceof Error ? error.message : "File upload failed");
          throw error;
        }
      }

      const { error } = await supabase.from("medication_logs").upsert([
        {
          user_id: user?.id,
          medication_id: medicationId,
          date: todayStr,
          photo_url,
        },
      ]);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medication_logs_all"] });
      setUploadFiles({});
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      setUploadError(error.message);
    },
  });

  const getStreakCount = () => {
    let streak = 0;
    let currentDate = new Date(today);
    while (
      logs.some(
        (log) =>
          format(new Date(log.date), "yyyy-MM-dd") ===
          format(currentDate, "yyyy-MM-dd")
      ) &&
      streak < 30
    ) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  };

  const handleFileChange = (medId: string, file: File | null) => {
    setUploadFiles((prev) => ({
      ...prev,
      [medId]: file,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">
              Good{" "}
              {new Date().getHours() < 12
                ? "Morning"
                : new Date().getHours() < 18
                ? "Afternoon"
                : "Evening"}
              !
            </h2>
            <p className="text-white/90 text-lg">Ready to stay on track with your medication?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{getStreakCount()}</div>
            <div className="text-white/80">Day Streak</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{takenIds.size > 0 ? "✓" : "○"}</div>
            <div className="text-white/80">Today's Status</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {meds.length > 0 ? Math.round((logs.length / meds.length) * 100) : 0}%
            </div>
            <div className="text-white/80">Adherence Rate</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                {isTodaySelected
                  ? "Today's Medication"
                  : `Medication for ${format(selectedDate, "MMMM d, yyyy")}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uploadError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{uploadError}</div>
              )}
              <div className="space-y-4">
                {meds.length === 0 && <p>No medications scheduled.</p>}
                {meds.map((med) => (
                  <div key={med.id} className="border p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{med.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {med.dosage} — {med.frequency}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(med.start_date), "MMM d, yyyy")}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        {takenIds.has(med.id) ? (
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="success" className="gap-1">
                              <Check className="h-3 w-3" /> Taken
                            </Badge>
                            {photoMap.has(med.id) && (
                              <img
                                src={photoMap.get(med.id)!}
                                alt="Proof"
                                className="w-12 h-12 rounded-full border shadow"
                              />
                            )}
                          </div>
                        ) : isTodaySelected ? (
                          <div className="flex flex-col gap-2 items-end">
                            <div className="flex gap-2">
                              <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm">
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFileChange(med.id, e.target.files?.[0] || null)
                                  }
                                />
                                {uploadFiles[med.id] ? "Change Photo" : "Add Photo"}
                              </label>
                              <Button
                                onClick={() =>
                                  markTaken({
                                    medicationId: med.id,
                                    file: uploadFiles[med.id] || null,
                                  })
                                }
                                disabled={isMarkingTaken}
                              >
                                {isMarkingTaken ? "Saving..." : "Mark as Taken"}
                              </Button>
                            </div>
                            {uploadFiles[med.id] && (
                              <span className="text-xs text-muted-foreground">
                                {uploadFiles[med.id]?.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary">Not Taken</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Medication Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full"
                modifiersClassNames={{
                  selected: "bg-blue-600 text-white hover:bg-blue-700",
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const isTaken = markedDates.has(dateStr);
                    const hadMedication = scheduledDates.has(dateStr);
                    const isPast = isBefore(date, startOfDay(today));
                    const isCurrentDay = isToday(date);

                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <span>{date.getDate()}</span>
                        {hadMedication && isTaken && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full" />
                        )}
                        {hadMedication && !isTaken && isPast && !isCurrentDay && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full" />
                        )}
                        {/* {isCurrentDay && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full" />
                        )} */}
                      </div>
                    );
                  },
                }}
              />
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Medication taken</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span>Missed medication</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
