"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

type FeedbackType = "bug" | "improvement" | "question" | "other"
type Severity = "low" | "medium" | "high" | "critical"
type UserRole = "guest" | "client" | "manager" | "admin" | "superadmin"

export function UATFeedbackForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug")
  const [severity, setSeverity] = useState<Severity>("medium")
  const [userRole, setUserRole] = useState<UserRole>("client")
  const [steps, setSteps] = useState("")
  const [expectedResult, setExpectedResult] = useState("")
  const [actualResult, setActualResult] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("feedbackType", feedbackType)
      formData.append("severity", severity)
      formData.append("userRole", userRole)
      formData.append("steps", steps)
      formData.append("expectedResult", expectedResult)
      formData.append("actualResult", actualResult)
      if (screenshot) {
        formData.append("screenshot", screenshot)
      }

      // Submit feedback
      const response = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      // Show success message
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      })

      // Reset form
      setTitle("")
      setDescription("")
      setFeedbackType("bug")
      setSeverity("medium")
      setUserRole("client")
      setSteps("")
      setExpectedResult("")
      setActualResult("")
      setScreenshot(null)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>UAT Feedback Form</CardTitle>
        <CardDescription>
          Please provide your feedback on the Real Estate Management System. Your input is valuable for improving the
          system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your feedback"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of your feedback"
              required
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="feedbackType">Feedback Type</Label>
              <Select value={feedbackType} onValueChange={(value) => setFeedbackType(value as FeedbackType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={(value) => setSeverity(value as Severity)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userRole">Your Role</Label>
            <RadioGroup value={userRole} onValueChange={(value) => setUserRole(value as UserRole)}>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="guest" id="guest" />
                  <Label htmlFor="guest">Guest</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client">Client</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manager" id="manager" />
                  <Label htmlFor="manager">Manager</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Admin</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="superadmin" id="superadmin" />
                  <Label htmlFor="superadmin">Super Admin</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {feedbackType === "bug" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="steps">Steps to Reproduce</Label>
                <Textarea
                  id="steps"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  placeholder="Step-by-step instructions to reproduce the issue"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="expectedResult">Expected Result</Label>
                  <Textarea
                    id="expectedResult"
                    value={expectedResult}
                    onChange={(e) => setExpectedResult(e.target.value)}
                    placeholder="What you expected to happen"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualResult">Actual Result</Label>
                  <Textarea
                    id="actualResult"
                    value={actualResult}
                    onChange={(e) => setActualResult(e.target.value)}
                    placeholder="What actually happened"
                    rows={2}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="screenshot">Screenshot (optional)</Label>
            <Input
              id="screenshot"
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </CardFooter>
    </Card>
  )
}

