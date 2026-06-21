"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function VerifyEmailForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl">Verify your Email</CardTitle>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            We have sent code to your email
          </p>
          <p className="text-sm md:text-base font-bold text-gray-600 dark:text-gray-400">
            username@mail.com
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="flex justify-center gap-2">
              <Input type="text" maxLength={1} className="w-12 text-center" />
              <Input type="text" maxLength={1} className="w-12 text-center" />
              <Input type="text" maxLength={1} className="w-12 text-center" />
              <Input type="text" maxLength={1} className="w-12 text-center" />
            </div>
            <Button className="w-full">Verify</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
