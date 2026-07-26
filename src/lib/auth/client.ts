"use client";

import { createAuthClient } from "@neondatabase/auth/next";

// Client-side counterpart to lib/auth/server.ts. Use this in 'use client'
// components for things like a "Sign out" button or reading session state
// with hooks. Server components/actions should use `auth` from
// lib/auth/server.ts instead.
export const authClient = createAuthClient();
