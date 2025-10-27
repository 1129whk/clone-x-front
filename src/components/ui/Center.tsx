"use client";

import React from "react";

export default function Center({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      {children}
    </div>
  );
}
