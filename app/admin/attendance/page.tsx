"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Clock, 
  Users, 
  UserSearch, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Building2
} from "lucide-react"
import Link from "next/link"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isToday, addDays, subDays } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import BackButton from "@/components/back-button"
import type { AttendanceRecord } from "@/hooks/use-auth"

interface ManagerData {
  id: string
  name: string
  email: string
  role: string
  attendance: AttendanceRecord[]
}

interface AttendanceStats {
  present: number
  absent: number
  partial: number
  totalHours: number
  averageHours: number
}

export default function AdminAttendancePage() {
  const { user, userRole, getAllManagersAttendance } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [managers, setManagers] = useState<ManagerData[]>([])
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("daily")
  const [dailyStats, setDailyStats] = useState<{[managerId: string]: AttendanceStats}>({})
  const [monthlyStats, setMonthlyStats] = useState<{[managerId: string]: AttendanceStats}>({})
  
  // Fetch managers and their attendance records
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true)
        
        // Get the first day and last day of the month
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        
        // Fetch attendance records for the current month
        const attendanceRecords = await getAllManagersAttendance?.(firstDayOfMonth, lastDayOfMonth) || {}
        
        // Mock data for development
        const mockManagers = [
          { id: "manager1", name: "John Smith", email: "john@example.com", role: "manager" },
          { id: "manager2", name: "Jane Doe", email: "jane@example.com", role: "manager" },
          { id: "manager3", name: "Bob Johnson", email: "bob@example.com", role: "manager" },
        ]
        
        // Transform data for display
        const managersWithAttendance = Object.keys(attendanceRecords).length > 0 
          ? Object.entries(attendanceRecords).map(([managerId, records]) => ({
              id: managerId,
              name: records[0]?.managerName || "Unknown Manager",
              email: `${managerId}@example.com`, // Placeholder, would come from user data
              role: "manager",
              attendance: records
            }))
          : mockManagers.map(manager => ({
              ...manager,
              attendance: generateMockAttendance(manager.id, firstDayOfMonth, lastDayOfMonth)
            }))
        
        setManagers(managersWithAttendance)
        
        // Calculate daily stats
        const dailyData: {[managerId: string]: AttendanceStats} = {}
        managersWithAttendance.forEach(manager => {
          const todayRecord = manager.attendance.find(record => 
            isToday(new Date(record.date))
          )
          
          dailyData[manager.id] = {
            present: todayRecord && todayRecord.clockInTime && todayRecord.clockOutTime ? 1 : 0,
            partial: todayRecord && (todayRecord.clockInTime || todayRecord.clockOutTime) && 
                   !(todayRecord.clockInTime && todayRecord.clockOutTime) ? 1 : 0,
            absent: !todayRecord || (!todayRecord.clockInTime && !todayRecord.clockOutTime) ? 1 : 0,
            totalHours: todayRecord?.totalHours || 0,
            averageHours: todayRecord?.totalHours || 0
          }
        })
        
        // Calculate monthly stats
        const monthlyData: {[managerId: string]: AttendanceStats} = {}
        managersWithAttendance.forEach(manager => {
          const presentDays = manager.attendance.filter(record => 
            record.clockInTime && record.clockOutTime
          ).length
          
          const partialDays = manager.attendance.filter(record => 
            (record.clockInTime || record.clockOutTime) && 
            !(record.clockInTime && record.clockOutTime)
          ).length
          
          const totalHours = manager.attendance.reduce((total, record) => 
            total + (record.totalHours || 0), 0
          )
          
          monthlyData[manager.id] = {
            present: presentDays,
            partial: partialDays,
            absent: Math.min(lastDayOfMonth.getDate(), new Date().getDate()) - presentDays - partialDays,
            totalHours,
            averageHours: presentDays > 0 ? totalHours / presentDays : 0
          }
        })
        
        setDailyStats(dailyData)
        setMonthlyStats(monthlyData)
        
      } catch (error) {
        console.error("Error fetching attendance data:", error)
        toast({
          title: "Error",
          description: "Failed to load attendance data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchAttendanceData()
  }, [currentDate, getAllManagersAttendance])
  
  // Generate mock attendance data for development
  const generateMockAttendance = (managerId: string, startDate: Date, endDate: Date): AttendanceRecord[] => {
    const records: AttendanceRecord[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate && currentDate <= new Date()) {
      // Skip weekends
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        // 80% chance of being present
        const isPresent = Math.random() < 0.8
        
        if (isPresent) {
          const clockInTime = new Date(currentDate)
          clockInTime.setHours(8 + Math.floor(Math.random() * 2))
          clockInTime.setMinutes(Math.floor(Math.random() * 60))
          
          const clockOutTime = new Date(currentDate)
          clockOutTime.setHours(16 + Math.floor(Math.random() * 3))
          clockOutTime.setMinutes(Math.floor(Math.random() * 60))
          
          const diffMs = clockOutTime.getTime() - clockInTime.getTime()
          const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))
          
          records.push({
            id: `${managerId}-${format(currentDate, "yyyy-MM-dd")}`,
            managerId,
            date: new Date(currentDate),
            clockInTime,
            clockOutTime,
            totalHours,
            geofenceEvents: [
              {
                type: "enter",
                timestamp: clockInTime,
              },
              {
                type: "exit",
                timestamp: clockOutTime,
              }
            ]
          })
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return records
  }
  
  const handlePreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1))
  }
  
  const handleNextDay = () => {
    const tomorrow = addDays(new Date(), 1)
    if (currentDate < tomorrow) {
      setCurrentDate(prevDate => addDays(prevDate, 1))
    }
  }
  
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  
  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    if (nextMonth <= new Date()) {
      setCurrentDate(nextMonth)
    }
  }
  
  const filteredManagers = managers.filter(manager => 
    manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const getAttendanceStatus = (managerId: string) => {
    if (activeTab === "daily") {
      const stats = dailyStats[managerId]
      if (!stats) return "absent"
      if (stats.present > 0) return "present"
      if (stats.partial > 0) return "partial"
      return "absent"
    } else {
      // For monthly view, show the most recent day's status
      const manager = managers.find(m => m.id === managerId)
      if (!manager) return "absent"
      
      const todayRecord = manager.attendance.find(record => 
        isToday(new Date(record.date))
      )
      
      if (todayRecord) {
        if (todayRecord.clockInTime && todayRecord.clockOutTime) return "present"
        if (todayRecord.clockInTime || todayRecord.clockOutTime) return "partial"
      }
      
      return "absent"
    }
  }
  
  if (!user || (userRole !== "admin" && userRole !== "superadmin")) {
    return (
      <div className="container max-w-5xl py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <XCircle className="h-10 w-10 text-destructive mb-2" />
            <h2 className="text-xl font-bold mb-1">Access Denied</h2>
            <p className="text-muted-foreground text-center">
              You don't have permission to view this page.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      <BackButton href="/dashboard/admin" label="Back to Dashboard" />
      
      <div>
        <h1 className="text-3xl font-bold mb-2">Manager Attendance</h1>
        <p className="text-muted-foreground">Track and monitor manager attendance and work hours</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search managers..."
              className="pl-9 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Tabs value={activeTab} className="hidden">
        <TabsContent value="daily">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl">
                Daily Attendance
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-[150px]">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(currentDate, "MMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={currentDate}
                      onSelect={(date) => date && setCurrentDate(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleNextDay}
                  disabled={currentDate >= new Date()}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[120px]" />
                        </div>
                        <Skeleton className="h-6 w-20 ml-auto" />
                      </div>
                    ))}
                  </div>
                ) : filteredManagers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserSearch className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No managers found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  filteredManagers.map((manager) => {
                    const isTodays = isToday(currentDate)
                    const status = getAttendanceStatus(manager.id)
                    const stats = dailyStats[manager.id] || { totalHours: 0 }
                    
                    // Find the attendance record for the selected day
                    const record = manager.attendance.find(r => 
                      format(new Date(r.date), "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd")
                    )
                    
                    return (
                      <div 
                        key={manager.id} 
                        className="border rounded-lg p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium",
                              status === "present" ? "bg-green-500" : 
                              status === "partial" ? "bg-amber-500" : 
                              "bg-red-500"
                            )}
                          >
                            {manager.name.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-medium">{manager.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {manager.email}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-right">
                            <div className="font-medium">
                              {status === "present" ? (
                                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4" />
                                  Present
                                </span>
                              ) : status === "partial" ? (
                                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Partial
                                </span>
                              ) : (
                                <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                                  <XCircle className="h-4 w-4" />
                                  Absent
                                </span>
                              )}
                            </div>
                            
                            {record ? (
                              <div className="text-muted-foreground">
                                {record.clockInTime && (
                                  <span>
                                    In: {format(new Date(record.clockInTime), "h:mm a")}
                                  </span>
                                )}
                                {record.clockInTime && record.clockOutTime && (
                                  <span> - </span>
                                )}
                                {record.clockOutTime && (
                                  <span>
                                    Out: {format(new Date(record.clockOutTime), "h:mm a")}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-muted-foreground">
                                No record
                              </div>
                            )}
                          </div>
                          
                          <div className="min-w-[80px] text-right">
                            <div className="font-medium">
                              {record?.totalHours ? `${record.totalHours.toFixed(1)} hrs` : '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {isTodays ? 'Today' : format(currentDate, "MMM d")}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl">
                Monthly Attendance
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[120px] text-center font-medium">
                  {format(currentDate, "MMMM yyyy")}
                </span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleNextMonth}
                  disabled={new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) > new Date()}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[120px]" />
                        </div>
                        <Skeleton className="h-6 w-[300px] ml-auto" />
                      </div>
                    ))}
                  </div>
                ) : filteredManagers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserSearch className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No managers found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  filteredManagers.map((manager) => {
                    const status = getAttendanceStatus(manager.id)
                    const stats = monthlyStats[manager.id] || { 
                      present: 0, 
                      partial: 0, 
                      absent: 0, 
                      totalHours: 0,
                      averageHours: 0
                    }
                    
                    const workingDays = stats.present + stats.partial + stats.absent
                    const attendanceRate = workingDays > 0 
                      ? ((stats.present + stats.partial * 0.5) / workingDays) * 100 
                      : 0
                    
                    return (
                      <div 
                        key={manager.id} 
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium",
                                status === "present" ? "bg-green-500" : 
                                status === "partial" ? "bg-amber-500" : 
                                "bg-red-500"
                              )}
                            >
                              {manager.name.substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-medium">{manager.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {manager.email}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium">
                              {stats.totalHours.toFixed(1)} hours
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Avg: {stats.averageHours.toFixed(1)} hrs/day
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <div className="space-x-2">
                              <span className="text-green-600 dark:text-green-400">
                                Present: {stats.present} days
                              </span>
                              <span className="text-amber-600 dark:text-amber-400">
                                Partial: {stats.partial} days
                              </span>
                              <span className="text-red-600 dark:text-red-400">
                                Absent: {stats.absent} days
                              </span>
                            </div>
                            <span className="font-medium">
                              {attendanceRate.toFixed(0)}% attendance
                            </span>
                          </div>
                          
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${(stats.present / workingDays) * 100}%` }}
                            ></div>
                            <div 
                              className="h-full bg-amber-500" 
                              style={{ width: `${(stats.partial / workingDays) * 100}%` }}
                            ></div>
                            <div 
                              className="h-full bg-red-500" 
                              style={{ width: `${(stats.absent / workingDays) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
