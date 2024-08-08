import { NextResponse } from 'next/server'

import { getServerSession } from "next-auth";
import { nextAuthOptions } from "~/lib/next-auth";

export async function GET() {
  const session = await getServerSession(nextAuthOptions)
  
  return NextResponse.json({
    status: 200,
    message: "Success",
    data: session
  });
}