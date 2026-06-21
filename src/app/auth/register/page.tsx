"use client";

import { useState } from "react";
import { signup } from "../actions";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import Link from "next/link";

const SignupCardText: { [x: string]: any } = {
  heading: "Sign up",
  description: "to enjoy all of our cool features ✌️",
  form: {
    firstName: {
      label: "First Name",
    },
    lastName: {
      label: "Last Name",
    },
    email: {
      label: "Email Address",
    },
    password: {
      label: "Password",
    },
    action: {
      loadingText: "Submitting",
      buttonText: "Sign up",
    },
    footerText: "Already a user?",
    LoginLink: "Login",
  },
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl">{SignupCardText.heading}</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            {SignupCardText.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{SignupCardText.form.firstName.label}</Label>
                <Input type="text" id="firstName" name="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{SignupCardText.form.lastName.label}</Label>
                <Input type="text" id="lastName" name="lastName" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{SignupCardText.form.email.label}</Label>
              <Input type="email" id="email" name="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{SignupCardText.form.password.label}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <Button type="submit" formAction={signup} className="w-full" size="lg">
              {SignupCardText.form.action.buttonText}
            </Button>
            <p className="text-center text-sm">
              {SignupCardText.form.footerText}{" "}
              <Link href="/login" className="text-blue-500 hover:underline">
                {SignupCardText.form.LoginLink}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
