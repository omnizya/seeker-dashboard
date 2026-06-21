"use client";

import { login } from "../actions";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";

const LoginPageText: { [x: string]: any } = {
  heading: "Sign in to your account",
  description: "to enjoy all of our cool features ✌️",
  form: {
    email: {
      label: "Email Address",
    },
    password: {
      label: "Password",
    },
    action: {
      checbox: "Remember me",
      forgotPass: "Forgot password?",
      login: "Sign in",
    },
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl">{LoginPageText.heading}</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            {LoginPageText.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{LoginPageText.form.email.label}</Label>
              <Input type="email" id="email" name="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{LoginPageText.form.password.label}</Label>
              <Input type="password" id="password" name="password" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                {LoginPageText.form.action.checbox}
              </label>
              <span className="text-sm text-blue-500 cursor-pointer">
                {LoginPageText.form.action.forgotPass}
              </span>
            </div>
            <Button type="submit" formAction={login} className="w-full">
              {LoginPageText.form.action.login}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
