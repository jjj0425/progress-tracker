// app/api/groups/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userGroups = await db.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        select: { id: true, name: true, description: true },
      },
    },
  });

  return NextResponse.json(userGroups.map((member) => member.group));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { name, description, fields } = await req.json();

    // 創建群組及其相關欄位
    const group = await db.group.create({
      data: {
        name,
        description,
        creator: { connect: { id: session.user.id } },
        members: {
          create: [
            {
              userId: session.user.id,
              role: "ADMIN", // 設定創建者的角色為 ADMIN
            },
          ],
        },
        fields: {
          create: fields.map((field: { name: string; required: boolean }) => ({
            name: field.name,
            required: field.required,
          })),
        },
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Failed to create group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}