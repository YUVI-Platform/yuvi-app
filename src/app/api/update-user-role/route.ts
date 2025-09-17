import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: Request) {
  const { userId, role, userName } = await req.json();

  if (!userId || !role || !userName) {
    return NextResponse.json(
      { error: "userId, role, and userName are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        userName,
        role,
      },
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
