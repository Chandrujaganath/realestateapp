"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function FeedbackPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const visitId = params.id

  const [rating, setRating] = useState<number>(0)
  const [comments, setComments] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [visitDetails, setVisitDetails] = useState<any>(null)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  useEffect(() => {
    const fetchVisitDetails = async () => {
      if (!user) return

      try {
        // In a real implementation, fetch visit details from Firestore
        // For now, we'll use mock data
        setVisitDetails({
          id: visitId,
          projectName: "Riverside Villas",
          visitDate: new Date(2025, 2, 10), // March 10, 2025
          timeSlot: "11:15 AM",
          status: "completed",
        })
      } catch (error) {
        console.error("Error fetching visit details:", error)
      }
    }

    fetchVisitDetails()
  }, [user, visitId])

  const handleSubmitFeedback = async () => {
    if (!user || !visitDetails || rating === 0) {
      return
    }

    setIsLoading(true)

    try {
      // In a real implementation, submit feedback to Firestore
      // For now, we'll just simulate the submission

      // Create feedback document
      /*
      await setDoc(doc(db, 'feedback', visitId), {
        visitId,
        userId: user.uid,
        projectId: visitDetails.projectId,
        rating,
        comments,
        submittedAt: serverTimestamp(),
      });
      
      // Update visit document to mark feedback as submitted
      await updateDoc(doc(db, 'visits', visitId), {
        feedbackSubmitted: true,
      });
      */

      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setFeedbackSubmitted(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/visit/my-visits")
      }, 2000)
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (feedbackSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4 mb-4">
          <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Thank You for Your Feedback!</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Your feedback helps us improve our services and properties.
        </p>
        <Link href="/visit/my-visits">
          <Button>Return to My Visits</Button>
        </Link>
      </div>
    )
  }

  if (!visitDetails) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/visit/my-visits" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to My Visits
        </Link>
        <h1 className="text-3xl font-bold mb-2">Share Your Feedback</h1>
        <p className="text-muted-foreground">Tell us about your experience visiting {visitDetails.projectName}</p>
      </div>

      <Card className="glass-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Visit Feedback</CardTitle>
          <CardDescription>Your feedback helps us improve our services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">How would you rate your visit experience?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${rating >= star ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Comments</label>
            <Textarea
              placeholder="Share your thoughts about the property, staff, and overall experience..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          <Button className="w-full" disabled={rating === 0 || isLoading} onClick={handleSubmitFeedback}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                Submitting...
              </span>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

