'use client';

import { Building2, ArrowLeft, LayoutTemplateIcon as Template, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';

// Define the type for day
type DayType = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Define the type for the status
type StatusType = 'active' | 'inactive' | 'completed';

// Define the type for form data
interface TimeSlot {
  start: string;
  end: string;
}

interface DayTimeSlots {
  day: DayType;
  slots: TimeSlot[];
}

interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  defaultTimeSlots: DayTimeSlots[];
}

interface FormData {
  name: string;
  city: string;
  description: string;
  status: StatusType;
  managersAssigned: string[];
  timeSlots: DayTimeSlots[];
}

export default function CreateProjectPage() {
  const router = useRouter();
  const { createProject, getProjectTemplates } = useAuth();
  const [activeTab, setActiveTab] = useState<'template' | 'scratch'>('template');

  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    city: '',
    description: '',
    status: 'active',
    managersAssigned: [],
    timeSlots: [
      {
        day: 'monday',
        slots: [{ start: '09:00', end: '10:00' }],
      },
    ],
  });

  const [fetchingTemplates, setFetchingTemplates] = useState(true);

  // Use useEffect instead of useState for fetching templates
  useEffect(() => {
    const _fetchTemplates = async () => {
      try {
        const _templatesData = await getProjectTemplates();
        setTemplates(_templatesData);
        setFetchingTemplates(false);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setFetchingTemplates(false);
      }
    };

    _fetchTemplates();
  }, [getProjectTemplates]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as StatusType }));
  };

  const _handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);

    // Find the selected template
    const template = templates.find((_t) => _t.id === templateId);

    if (template) {
      // Pre-fill form with template data
      setFormData((prev) => ({
        ...prev,
        timeSlots: template.defaultTimeSlots,
      }));
    }
  };

  const _addTimeSlot = (dayIndex: number) => {
    const updatedTimeSlots = [...formData.timeSlots];
    updatedTimeSlots[dayIndex].slots.push({ start: '09:00', end: '10:00' });
    setFormData((prev) => ({ ...prev, timeSlots: updatedTimeSlots }));
  };

  const _removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updatedTimeSlots = [...formData.timeSlots];
    updatedTimeSlots[dayIndex].slots.splice(slotIndex, 1);
    setFormData((prev) => ({ ...prev, timeSlots: updatedTimeSlots }));
  };

  const updateTimeSlot = (
    dayIndex: number,
    slotIndex: number,
    _field: 'start' | 'end',
    value: string
  ) => {
    const updatedTimeSlots = [...formData.timeSlots];
    updatedTimeSlots[dayIndex].slots[slotIndex][_field] = value;
    setFormData((prev) => ({ ...prev, timeSlots: updatedTimeSlots }));
  };

  const _handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const _projectData = {
        ...formData,
        templateId: activeTab === 'template' ? selectedTemplate : undefined,
      };

      await createProject(_projectData);
      router.push('/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Create New Project</h1>
      </div>

      <Tabs
        defaultValue="template"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'template' | 'scratch')}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="template">
            <Template className="mr-2 h-4 w-4" />
            Use Template
          </TabsTrigger>
          <TabsTrigger value="scratch">
            <Plus className="mr-2 h-4 w-4" />
            Create from Scratch
          </TabsTrigger>
        </TabsList>

        <form onSubmit={_handleSubmit}>
          <TabsContent value="template" className="space-y-6 mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Select a Template</CardTitle>
                <CardDescription>
                  Choose a pre-defined template to quickly set up your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fetchingTemplates ? (
                  <div className="space-y-4">
                    {Array(3)
                      .fill(0)
                      .map((_, _i) => (
                        <Card key={_i} className="border border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="h-5 w-5 mt-0.5 rounded-full bg-muted animate-pulse" />
                              <div className="space-y-2 flex-1">
                                <div className="h-5 w-40 bg-muted animate-pulse rounded" />
                                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-6">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No templates available</h3>
                    <p className="text-muted-foreground mb-4">
                      There are no project templates available. You can create a project from
                      scratch.
                    </p>
                    <Button type="button" onClick={() => setActiveTab('scratch')}>
                      Create from Scratch
                    </Button>
                  </div>
                ) : (
                  <RadioGroup value={selectedTemplate} onValueChange={_handleTemplateSelect}>
                    <div className="space-y-4">
                      {templates.map((template) => (
                        <Card
                          key={template.id}
                          className={`border ${selectedTemplate === template.id ? 'border-primary' : 'border-border/50'}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <RadioGroupItem
                                value={template.id}
                                id={template.id}
                                className="mt-0.5"
                              />
                              <div>
                                <Label htmlFor={template.id} className="text-base font-medium">
                                  {template.name}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {template.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {selectedTemplate && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>
                    Customize the basic information for your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Project Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter project name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Enter project description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={handleStatusChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Project'}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scratch" className="space-y-6 mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Enter the basic information for your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name-scratch">Project Name</Label>
                    <Input
                      id="name-scratch"
                      name="name"
                      placeholder="Enter project name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="city-scratch">City</Label>
                    <Input
                      id="city-scratch"
                      name="city"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description-scratch">Description</Label>
                    <Textarea
                      id="description-scratch"
                      name="description"
                      placeholder="Enter project description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Visit Time Slots</CardTitle>
                <CardDescription>Configure available time slots for site visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {formData.timeSlots.map((daySlot, dayIndex) => (
                    <div key={daySlot.day} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium capitalize">{daySlot.day}</h3>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`enable-${daySlot.day}`} className="text-sm">
                            Enable
                          </Label>
                          <Switch id={`enable-${daySlot.day}`} checked={daySlot.slots.length > 0} />
                        </div>
                      </div>

                      {daySlot.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-2">
                          <div className="grid grid-cols-2 gap-2 flex-1">
                            <div className="grid gap-1.5">
                              <Label
                                htmlFor={`${daySlot.day}-start-${slotIndex}`}
                                className="text-sm"
                              >
                                Start Time
                              </Label>
                              <Input
                                type="time"
                                id={`${daySlot.day}-start-${slotIndex}`}
                                value={slot.start}
                                onChange={(e) =>
                                  updateTimeSlot(dayIndex, slotIndex, 'start', e.target.value)
                                }
                              />
                            </div>
                            <div className="grid gap-1.5">
                              <Label
                                htmlFor={`${daySlot.day}-end-${slotIndex}`}
                                className="text-sm"
                              >
                                End Time
                              </Label>
                              <Input
                                type="time"
                                id={`${daySlot.day}-end-${slotIndex}`}
                                value={slot.end}
                                onChange={(e) =>
                                  updateTimeSlot(dayIndex, slotIndex, 'end', e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-6"
                            onClick={() => _removeTimeSlot(dayIndex, slotIndex)}
                            disabled={daySlot.slots.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => _addTimeSlot(dayIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Slot
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
}
