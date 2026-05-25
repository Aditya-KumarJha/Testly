"use client";

import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoaded, isSignedIn } = useUser();
  const hasPostedRef = useRef(false);

  const [userDetail, setUserDetail] = useState<any>();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasPostedRef.current) {
      return;
    }

    hasPostedRef.current = true;
    createNewUser();
  }, [isLoaded, isSignedIn]);

  const createNewUser = async () => {
    const result = await axios.post("/api/users", {});
    setUserDetail(result.data?.user);
    console.log("User creation result: ", result);
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }} >
      <div>{children}</div>
    </UserDetailContext.Provider>
  );
}

export default Provider;
