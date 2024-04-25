"use client";

import { useState } from "react";

export default function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
  ];

  return (
    <nav>
      <div>
        <span
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <span>
          <p className="font-bold text-inherit">الباحث</p>
        </span>
      </div>

      <ul className="hidden sm:flex gap-4">
        <li>
          <a color="primary" href="/dashboard">
            حساب الجمل
          </a>
        </li>
        <li>
          <a href="/dashboard/holy-names" aria-current="page">
            القرآن الكريم
          </a>
        </li>
      </ul>
      <ul>
        <li className="hidden lg:flex">
          <a href="#">Login</a>
        </li>
        <li>
          <a color="primary" className="hidden" href="#">
            Sign Up
          </a>
        </li>
      </ul>
      <ul>
        {menuItems.map((item, index) => (
          <li key={`${item}-${index}`}>
            <a
              color={
                index === 2
                  ? "primary"
                  : index === menuItems.length - 1
                  ? "danger"
                  : "primary"
              }
              className="w-full"
              href="#"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
