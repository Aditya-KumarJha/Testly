import { createContext } from "react";
import type { UserContextValue } from "@/lib/types";

export const UserDetailContext = createContext<UserContextValue | null>(null);
