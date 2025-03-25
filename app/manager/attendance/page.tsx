"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, ArrowLeft, ArrowRight, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import type { AttendanceRecord } from "@/contexts/auth-context"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function AttendancePage() {
  const { user, getManagerAttendance } = useAuth()

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [monthAttendance, setMonthAttendance] = useState<{ [date: string]: AttendanceRecord | null }>({})
  const [summary, setSummary] = useState({
    totalDays: 0,
    presentDays: 0,
    partialDays: 0,
    absentDays: 0,
    totalHours: 0,
    averageHoursPerDay: 0
  })

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // Get the first and last day of the current month
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

        let records = [];
        if (getManagerAttendance) {
          records = await getManagerAttendance(firstDay, lastDay);
        } else {
          console.warn("getManagerAttendance function not available");
          // Use mock data as fallback
          records = [
            // ... your existing mock data ...
          ]
        }
        
        setAttendanceRecords(records)

        // Create a map of date strings to attendance records
        const attendanceMap: { [date: string]: AttendanceRecord | null } = {}

        // Initialize all days of the month with null
        for (let day = 1; day <= lastDay.getDate(); day++) {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          attendanceMap[format(date, "yyyy-MM-dd")] = null
        }

        // Fill in the records we have
        records.forEach((record) => {
          attendanceMap[format(record.date, "yyyy-MM-dd")] = record
        })

        setMonthAttendance(attendanceMap)

        // Calculate summary statistics
        const now = new Date()
        const isCurrentMonth = 
          now.getFullYear() === currentMonth.getFullYear() && 
          now.getMonth() === currentMonth.getMonth()
        
        // For past or current month, count only up to today
        const daysToCount = isCurrentMonth ? now.getDate() : lastDay.getDate()
        
        let presentCount = 0
        let partialCount = 0
        let absentCount = 0
        let totalHours = 0
        
        for (let day = 1; day <= daysToCount; day++) {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          
          // Skip future dates
          if (date > now) continue
          
          const dateStr = format(date, "yyyy-MM-dd")
          const record = attendanceMap[dateStr]
          
          if (!record) {
            absentCount++
            continue
          }
          
          if (record.clockInTime && record.clockOutTime) {
            presentCount++
            totalHours += record.totalHours || 0
          } else if (record.clockInTime || record.clockOutTime) {
            partialCount++
            totalHours += record.totalHours || 0
          } else {
            absentCount++
          }
        }
        
        setSummary({
          totalDays: daysToCount,
          presentDays: presentCount,
          partialDays: partialCount,
          absentDays: absentCount,
          totalHours: parseFloat(totalHours.toFixed(2)),
          averageHoursPerDay: presentCount > 0 ? parseFloat((totalHours / presentCount).toFixed(2)) : 0
        })
      } catch (error) {
        console.error("Error fetching attendance records:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [getManagerAttendance, currentMonth])

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const getSelectedDayAttendance = (): AttendanceRecord | null => {
    if (!selectedDate) return null

    const dateString = format(selectedDate, "yyyy-MM-dd")
    return monthAttendance[dateString] || null
  }

  const calculateTotalHours = (): number => {
    return attendanceRecords.reduce((total, record) => {
      return total + (record.totalHours || 0)
    }, 0)
  }

  const calculateAverageHours = (): number => {
    if (attendanceRecords.length === 0) return 0
    return calculateTotalHours() / attendanceRecords.length
  }

  const getDayAttendanceStatus = (date: Date): "present" | "absent" | "partial" | "future" | "none" => {
    // Future dates have no status
    if (date > new Date()) return "future"

    const dateString = format(date, "yyyy-MM-dd")
    const record = monthAttendance[dateString]

    if (!record) return "absent"

    if (record.clockInTime && record.clockOutTime) {
      return "present"
    } else if (record.clockInTime || record.clockOutTime) {
      return "partial"
    }

    return "none"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/manager" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Attendance History</h1>
        <p className="text-muted-foreground">View your attendance records and work hours</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Monthly Summary - {format(currentMonth, "MMMM yyyy")}</CardTitle>
          <CardDescription>Overview of your attendance for the current month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-md">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Attendance Rate</h3>
              <p className="text-2xl font-bold">
                {summary.totalDays ? 
                  `${Math.round(((summary.presentDays + summary.partialDays) / summary.totalDays) * 100)}%` : 
                  "0%"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.presentDays} full days + {summary.partialDays} partial days
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-md">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Hours</h3>
              <p className="text-2xl font-bold">{summary.totalHours}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Hours worked this month
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-md">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Average Hours</h3>
              <p className="text-2xl font-bold">{summary.averageHoursPerDay}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Average hours per work day
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Present: {summary.presentDays} days</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs">Partial: {summary.partialDays} days</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs">Absent: {summary.absentDays} days</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {summary.totalDays} total days counted
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Monthly Calendar</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</span>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border"
                modifiers={{
                  present: (date) => getDayAttendanceStatus(date) === "present",
                  absent: (date) => getDayAttendanceStatus(date) === "absent",
                  partial: (date) => getDayAttendanceStatus(date) === "partial",
                }}
                modifiersClassNames={{
                  present: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                  absent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                  partial: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                }}
              />

              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Present</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs">Partial</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs">Absent</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Details */}
          {selectedDate && (
            <Card className="glass-card mt-6">
              <CardHeader>
                <CardTitle>{format(selectedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
                <CardDescription>Attendance details for the selected day</CardDescription>
              </CardHeader>
              <CardContent>
                {getSelectedDayAttendance() ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Clock In</h3>
                        <p className="font-medium">
                          {getSelectedDayAttendance()?.clockInTime
                            ? format(getSelectedDayAttendance()!.clockInTime!, "h:mm a")
                            : "Not recorded"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Clock Out</h3>
                        <p className="font-medium">
                          {getSelectedDayAttendance()?.clockOutTime
                            ? format(getSelectedDayAttendance()!.clockOutTime!, "h:mm a")
                            : "Not recorded"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Hours</h3>
                        <p className="font-medium">
                          {getSelectedDayAttendance()?.totalHours
                            ? `${getSelectedDayAttendance()!.totalHours!.toFixed(2)} hours`
                            : "N/A"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                        <p className="font-medium flex items-center gap-1">
                          {getSelectedDayAttendance()?.clockInTime && getSelectedDayAttendance()?.clockOutTime ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-600 dark:text-green-400">Present</span>
                            </>
                          ) : getSelectedDayAttendance()?.clockInTime || getSelectedDayAttendance()?.clockOutTime ? (
                            <>
                              <Clock className="h-4 w-4 text-amber-500" />
                              <span className="text-amber-600 dark:text-amber-400">Partial</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-600 dark:text-red-400">Absent</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {getSelectedDayAttendance()?.geofenceEvents &&
                      getSelectedDayAttendance()!.geofenceEvents.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">Geofence Events</h3>
                          <div className="space-y-2">
                            {getSelectedDayAttendance()!.geofenceEvents.map((event, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                <div className="flex items-center gap-2">
                                  {event.type === "enter" ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span>
                                    {event.type === "enter" ? "Entered" : "Exited"} {event.projectName}
                                  </span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {format(event.timestamp, "h:mm a")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No attendance record for this day</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Date Selector */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal glass-button",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/manager/leave">
                <Button variant="outline" className="w-full glass-button justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Request Leave
                </Button>
              </Link>

              <Button variant="outline" className="w-full glass-button justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Download Attendance Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


