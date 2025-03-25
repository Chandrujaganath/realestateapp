"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Eye,
  Edit,
  Trash2,
  Download,
  UserPlus
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Define user interface
interface UserType {
  id: string
  displayName: string
  email: string
  phone: string
  city: string
  role: string
  status: string
  registeredOn: string
}

export default function UsersPage() {
  const { user, getAllUsers } = useAuth()
  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [userType, setUserType] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (getAllUsers) {
          const data = await getAllUsers()
          setUsers(data || [])
          setFilteredUsers(data || [])
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [getAllUsers])

  useEffect(() => {
    let filtered = users

    // Filter by user type
    if (userType !== "all") {
      filtered = filtered.filter(user => user.role === userType)
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(user => 
        (user.displayName && user.displayName.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.phone && user.phone.toLowerCase().includes(query)) ||
        (user.city && user.city.toLowerCase().includes(query))
      )
    }

    setFilteredUsers(filtered)
  }, [searchQuery, userType, users])

  if (loading) {
    return <UsersSkeleton />
  }

  // Mock data for demonstration
  const mockUsers: UserType[] = filteredUsers.length > 0 ? filteredUsers : [
    {
      id: "1",
      displayName: "John Smith",
      email: "john.smith@example.com",
      phone: "+1 234 567 8901",
      city: "New York",
      role: "manager",
      status: "active",
      registeredOn: "2023-01-15",
    },
    {
      id: "2",
      displayName: "Emily Johnson",
      email: "emily.johnson@example.com",
      phone: "+1 345 678 9012",
      city: "Los Angeles",
      role: "manager",
      status: "active",
      registeredOn: "2023-02-22",
    },
    {
      id: "3",
      displayName: "Michael Brown",
      email: "michael.brown@example.com",
      phone: "+1 456 789 0123",
      city: "Chicago",
      role: "client",
      status: "active",
      registeredOn: "2022-11-10",
    },
    {
      id: "4",
      displayName: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      phone: "+1 567 890 1234",
      city: "Houston",
      role: "manager",
      status: "active",
      registeredOn: "2023-03-05",
    },
    {
      id: "5",
      displayName: "David Lee",
      email: "david.lee@example.com",
      phone: "+1 678 901 2345",
      city: "San Francisco",
      role: "guest",
      status: "active",
      registeredOn: "2023-04-18",
    },
    {
      id: "6",
      displayName: "Jennifer Garcia",
      email: "jennifer.garcia@example.com",
      phone: "+1 789 012 3456",
      city: "Miami",
      role: "client",
      status: "inactive",
      registeredOn: "2022-12-03",
    },
    {
      id: "7",
      displayName: "Robert Martinez",
      email: "robert.martinez@example.com",
      phone: "+1 890 123 4567",
      city: "Dallas",
      role: "client",
      status: "active",
      registeredOn: "2023-02-14",
    },
    {
      id: "8",
      displayName: "Lisa Anderson",
      email: "lisa.anderson@example.com",
      phone: "+1 901 234 5678",
      city: "Seattle",
      role: "guest",
      status: "active",
      registeredOn: "2023-05-20",
    },
  ]

  // Calculate user stats
  const totalUsers = mockUsers.length
  const clientUsers = mockUsers.filter(user => user.role === "client").length
  const managerUsers = mockUsers.filter(user => user.role === "manager").length
  const guestUsers = mockUsers.filter(user => user.role === "guest").length

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "manager":
        return "default"
      case "client":
        return "secondary"
      case "guest":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage system users and their access</p>
        </div>
        <Link href="/admin/users/create">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((clientUsers / totalUsers) * 100)}% of users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Managers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managerUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((managerUsers / totalUsers) * 100)}% of users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guestUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((guestUsers / totalUsers) * 100)}% of users
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage system users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
            <div className="grid w-full md:w-64">
              <Select 
                value={userType} 
                onValueChange={setUserType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="manager">Managers</SelectItem>
                  <SelectItem value="guest">Guests</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="ml-auto">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {user.displayName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{user.city}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        <Shield className="mr-1 h-3 w-3" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{user.registeredOn}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <span className="sr-only">Open menu</span>
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                            >
                              <path
                                d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UsersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-24 ml-auto" />
          </div>

          <div className="rounded-md border">
            <div className="p-4">
              <div className="flex gap-4 border-b pb-4 mb-4">
                <Skeleton className="h-4 w-full max-w-[120px]" />
                <Skeleton className="h-4 w-full max-w-[180px]" />
                <Skeleton className="h-4 w-full max-w-[100px]" />
                <Skeleton className="h-4 w-full max-w-[80px]" />
                <Skeleton className="h-4 w-full max-w-[100px]" />
                <Skeleton className="h-4 w-full max-w-[50px]" />
              </div>
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-4 py-3">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                    <Skeleton className="h-4 w-full max-w-[180px]" />
                    <Skeleton className="h-4 w-full max-w-[100px]" />
                    <Skeleton className="h-4 w-full max-w-[80px]" />
                    <Skeleton className="h-4 w-full max-w-[100px]" />
                    <Skeleton className="h-4 w-full max-w-[50px]" />
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 