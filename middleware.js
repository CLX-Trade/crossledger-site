import { NextResponse } from "next/server";

// Runs on the landing page only. Vercel injects the visitor's country as
// `x-vercel-ip-country`; we surface it to the client as a readable cookie so
// the presale widget can disable itself in restricted jurisdictions.
//
// This is an IP-based control. It is a good-faith screen, not a guarantee of
// identity or residence — the FAQ copy says exactly that and must stay aligned.
export const config = { matcher: "/" };

export function middleware(request) {
  const country = request.headers.get("x-vercel-ip-country") || "XX";
  const res = NextResponse.next();
  res.cookies.set("clxt_geo", country, {
    path: "/",
    sameSite: "lax",
    httpOnly: false, // must be readable by the presale widget
    maxAge: 3600,
  });
  return res;
}
