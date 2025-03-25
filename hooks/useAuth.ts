import { useAuth as useOriginalAuth } from "./use-auth"

export function useAuth() {
  const auth = useOriginalAuth()
  
  // Provide mock implementation for missing functions
  return {
    ...auth,
    getAllUsers: auth.getAllUsers || (async () => {
      console.log("Using mock getAllUsers implementation")
      // Return mock data that matches the UserType interface
      return [
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
        // Additional mock users can be populated here
      ]
    }),
    getSystemAnalytics: auth.getSystemAnalytics || (async () => {
      console.log("Using mock getSystemAnalytics implementation")
      return null // This will trigger the mock data in the analytics page
    }),
    getProjects: auth.getProjects || (async () => {
      console.log("Using mock getProjects implementation")
      return null
    }),
    getVisitRequests: auth.getVisitRequests || (async () => {
      console.log("Using mock getVisitRequests implementation")
      return null
    }),
    getAllLeaveRequests: auth.getAllLeaveRequests || (async () => {
      console.log("Using mock getAllLeaveRequests implementation")
      return null
    })
  }
} 