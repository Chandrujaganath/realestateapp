'use client';

import { MessageSquare, User, Send } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

export default function MessagesPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Your conversations</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>Connect with other users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mock messages - would be populated from a database in a real app */}
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">System Admin</h3>
                  <p className="text-xs text-muted-foreground">5 mins ago</p>
                </div>
                <p className="text-sm mt-1">
                  Welcome to the Real Estate Management Platform! Let us know if you need any
                  assistance.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Project Manager</h3>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
                <p className="text-sm mt-1">
                  Your recent request has been approved. Check your dashboard for more details.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center space-x-2">
            <Input placeholder="Type a message..." className="flex-1" />
            <Button size="icon" className="h-10 w-10">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
          <CardDescription>Your project contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Admin Support</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Property Agent</p>
                  <p className="text-xs text-muted-foreground">Last seen 2h ago</p>
                </div>
              </div>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
