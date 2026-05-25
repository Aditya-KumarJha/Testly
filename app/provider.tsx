"use client";

import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";
import type { User } from "@/db/schema";
import type { UserContextValue } from "@/lib/types";
import { toast } from "sonner";

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoaded, isSignedIn } = useUser();
  const hasPostedRef = useRef(false);
  const [userDetail, setUserDetail] = useState<User | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasPostedRef.current) {
      return;
    }

    hasPostedRef.current = true;
    void createOrLoadUser();
  }, [isLoaded, isSignedIn]);

  const createOrLoadUser = async () => {
    try {
      const response = await axios.post<{ data: User }>("/api/users");
      setUserDetail(response.data.data);
    } catch (error) {
      console.error("Failed to initialize user", error);
      toast.error("Unable to initialize your workspace session.");
      hasPostedRef.current = false;
    }
  };

  const contextValue: UserContextValue = {
    userDetail,
    setUserDetail,
  };

  return (
    <UserDetailContext.Provider value={contextValue}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  );
}

export default Provider;
