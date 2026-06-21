'use client'

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

export default function ForgotPasswordForm() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-800 p-4">
      <Card className="w-full max-w-md my-12">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Forgot your password?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            You&apos;ll get an email with a reset link
          </p>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="your-email@example.com"
              type="email"
            />
          </div>
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            Request Reset
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
