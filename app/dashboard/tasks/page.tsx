"use client";

import { useState } from "react";
import { TaskList } from "@/features/tasks/components/task-list";
import { CreateTaskForm } from "@/features/tasks/components/create-task-form";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";

export default function TasksDashboardPage() {
  const { statistics, loading, fetchTaskStatistics } = useTasks();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  
  return (
    <div className="container p-4 mx-auto">
      <PageHeader 
        title="Tasks Dashboard" 
        description="Manage and track your project tasks"
        actions={
          <Sheet open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md" side="right">
              <SheetHeader>
                <SheetTitle>Create New Task</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <CreateTaskForm 
                  onSuccess={() => setIsCreateTaskOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        }
      />
      
      <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={statistics?.total.toString() || "0"}
          description="All tasks"
          loading={loading}
        />
        <StatCard
          title="In Progress"
          value={(statistics?.byStatus?.in_progress || 0).toString()}
          description="Active tasks"
          loading={loading}
        />
        <StatCard
          title="Completed"
          value={(statistics?.byStatus?.completed || 0).toString()}
          description="Finished tasks"
          loading={loading}
        />
        <StatCard
          title="Pending"
          value={(statistics?.byStatus?.pending || 0).toString()}
          description="Awaiting action"
          loading={loading}
        />
      </div>
      
      <div className="mt-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <TaskList 
              title="All Tasks" 
              emptyMessage="No tasks found. Create your first task to get started!"
              showFilters={true}
            />
          </TabsContent>
          <TabsContent value="my-tasks" className="mt-4">
            <TaskList 
              title="My Tasks" 
              emptyMessage="You don't have any tasks assigned to you."
              showFilters={true}
            />
          </TabsContent>
          <TabsContent value="pending" className="mt-4">
            <TaskList 
              title="Pending Tasks" 
              emptyMessage="No pending tasks found."
              showFilters={false}
            />
          </TabsContent>
          <TabsContent value="in-progress" className="mt-4">
            <TaskList 
              title="In Progress Tasks" 
              emptyMessage="No tasks in progress."
              showFilters={false}
            />
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <TaskList 
              title="Completed Tasks" 
              emptyMessage="No completed tasks found."
              showFilters={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  loading?: boolean;
}

function StatCard({ title, value, description, loading = false }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? "..." : value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
} 