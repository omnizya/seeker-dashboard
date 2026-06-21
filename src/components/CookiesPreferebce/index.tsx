"use client";

import React from "react";
import { FcLock } from "react-icons/fc";
import { Button } from "~/components/ui/button";

export default function SimpleCookiePreference() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white p-4 shadow-lg dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">Your Privacy</span>
          <FcLock />
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm max-w-4xl dark:text-gray-300">
            We use cookies and similar technologies to help personalise content,
            tailor and measure ads, and provide a better experience. By clicking
            OK or turning an option on in Cookie Preferences, you agree to this,
            as outlined in our Cookie Policy. To change preferences or withdraw
            consent, please update your Cookie Preferences.
          </p>
          <div className="flex flex-col md:flex-row gap-2">
            <Button variant="outline">Cookie Preferences</Button>
            <Button>OK</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
    