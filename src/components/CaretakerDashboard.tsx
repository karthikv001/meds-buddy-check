
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
  Users,
  Bell,
  Calendar as CalendarIcon,
  Mail,
  AlertTriangle,
  Check,
  Camera,
  Clock,
} from "lucide-react";
import NotificationSettings from "./NotificationSettings";
import AddMedicationForm from "./AddMedicationForm";
import MedicationList from "./MedicationList";
import { format, isBefore, startOfDay, isToday } from "date-fns";
import { supabase } from "@/lib/supabaseClient";

const CaretakerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todaysMeds, setTodaysMeds] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const patientName = "Eleanor Thompson";
  const today = new Date();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const tomorrow = new Date();
  tomorrow.setDate(selectedDate.getDate() + 1);
  const tomorrowStr = format(tomorrow, "yyyy-MM-dd");
  const markedDates = new Set(
    logs.map((log) => format(new Date(log.date), "yyyy-MM-dd"))
  );
  const scheduledDates = new Set(
    meds.map((med) => format(new Date(med.start_date), "yyyy-MM-dd"))
  );

  useEffect(() => {
    const fetchData = async () => {
      const { data: medications } = await supabase
        .from("medications")
        .select("*")
        .lte("start_date", tomorrowStr);
      console.log(medications);

      const { data: logsData } = await supabase
        .from("medication_logs")
        .select("medication_id, date, created_at, photo_url")
        .order("created_at", { ascending: false });

      setMeds(medications || []);
      setLogs(logsData || []);

      const todayMeds = medications?.filter(
        (med) => format(new Date(med.start_date), "yyyy-MM-dd") === todayStr
      );
      setTodaysMeds(todayMeds || []);

      const todayLogs = logsData?.filter(
        (log) => format(new Date(log.date), "yyyy-MM-dd") === todayStr
      );
      setRecentActivity(todayLogs || []);
    };
    fetchData();
  }, []);

  const completedCount = todaysMeds.filter((med) =>
    recentActivity.some((log) => log.medication_id === med.id)
  ).length;

  const adherenceRate = todaysMeds.length
    ? Math.round((completedCount / todaysMeds.length) * 100)
    : 0;

  const handleSendReminderEmail = () => {
    alert("Reminder email sent to " + patientName);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Caretaker Dashboard</h2>
            <p className="text-white/90 text-lg">
              Monitoring {patientName}'s medication adherence
            </p>
          </div>
        </div>
      </div>

      <AddMedicationForm />
      <MedicationList />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Medications</CardTitle>
              </CardHeader>
              <CardContent>
                {todaysMeds.length === 0 ? (
                  <p>No medications scheduled for today.</p>
                ) : (
                  todaysMeds.map((med) => {
                    const log = recentActivity.find(
                      (l) => l.medication_id === med.id
                    );
                    return (
                      <div
                        key={med.id}
                        className="flex justify-between items-center p-3 border-b last:border-none"
                      >
                        <div className="flex items-center gap-3">
                          {log?.photo_url ? (
                            <img
                              src={log.photo_url}
                              alt="Proof"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Camera className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium">{med.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(med.start_date), "PP")}
                            </p>
                          </div>
                        </div>
                        <Badge variant={log ? "secondary" : "destructive"}>
                          {log ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={handleSendReminderEmail}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reminder Email
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Configure Notifications
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setActiveTab("calendar")}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  View Full Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
          {/* Today's Medication List */}

          {/* Quick Actions & Progress */}
          <div className="">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Adherence Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{adherenceRate}%</span>
                  </div>
                  <Progress value={adherenceRate} className="h-3" />
                  <div className="grid grid-cols-3 text-center text-sm mt-2">
                    <div>
                      <p className="text-green-600 font-medium">
                        {completedCount}
                      </p>
                      <p>Taken</p>
                    </div>
                    <div>
                      <p className="text-red-600 font-medium">
                        {todaysMeds.length - completedCount}
                      </p>
                      <p>Missed</p>
                    </div>
                    <div>
                      <p className="text-blue-600 font-medium">
                        {todaysMeds.length}
                      </p>
                      <p>Total</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Medication Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p>No recent activity.</p>
              ) : (
                recentActivity.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border-b"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={log.photo_url || "/placeholder-avatar.png"}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">
                          {format(new Date(log.created_at), "PPpp")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Medication Calendar</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {hadMedication &&
                            !isTaken &&
                            isPast &&
                            !isCurrentDay && (
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
              <CardContent>
                <div className="flex flex-col gap-[10px]">
                  <p className="font-semibold text-xl">
                    Details for {format(selectedDate, "MMMM dd, yyyy")}
                  </p>

                  <div>
                    {meds?.filter(
                      (med) =>
                        format(new Date(med.start_date), "yyyy-MM-dd") ===
                        format(selectedDate, "yyyy-MM-dd")
                    ).length === 0 ? (
                      <p>No medications scheduled for today.</p>
                    ) : (
                      meds
                        ?.filter(
                          (med) =>
                            format(new Date(med.start_date), "yyyy-MM-dd") ===
                            format(selectedDate, "yyyy-MM-dd")
                        )
                        .map((med) => {
                          const log = recentActivity.find(
                            (l) => l.medication_id === med.id
                          );
                          return (
                            <div
                              key={med.id}
                              className="flex justify-between items-center p-3 border-b last:border-none"
                            >
                              <div className="flex items-center gap-3">
                                {log?.photo_url ? (
                                  <img
                                    src={log.photo_url}
                                    alt="Proof"
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <Camera className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-medium">{med.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(med.start_date), "PP")}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant={log ? "secondary" : "destructive"}
                              >
                                {log ? "Completed" : "Pending"}
                              </Badge>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaretakerDashboard;
