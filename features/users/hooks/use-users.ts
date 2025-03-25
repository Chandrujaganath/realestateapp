"use client";

import { useState, useCallback } from "react";

// Simple user type for the hook
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

/**
 * Hook for accessing user data
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Mock implementation
      const mockUsers: User[] = [
        { id: "user1", name: "John Doe", email: "john@example.com", role: "admin" },
        { id: "user2", name: "Jane Smith", email: "jane@example.com", role: "user" },
        { id: "user3", name: "Bob Johnson", email: "bob@example.com", role: "manager" },
      ];
      
      setUsers(mockUsers);
      return mockUsers;
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
  };
} 