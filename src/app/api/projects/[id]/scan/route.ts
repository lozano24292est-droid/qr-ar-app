import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await getStore().incrementScan(id);
  return NextResponse.json({ ok: true });
}
