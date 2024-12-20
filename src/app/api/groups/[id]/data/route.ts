import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: groupId } = params;
  const userId = session.user.id;

  try {
    // 確認群組存在
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: { members: true, fields: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // 確認用戶是否為管理員或參與者
    const isMember = group.members.some((member) => member.userId === userId);
    const isAdminOrParticipant = group.members.some(
      (member) =>
        member.userId === userId &&
        (member.role === "ADMIN" || member.role === "PARTICIPANT")
    );

    if (!isMember || !isAdminOrParticipant) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await req.json();

    // 驗證必填欄位
    const requiredFields = group.fields.filter((field) => field.required);
    const missingFields = requiredFields.filter((field) => !body[field.name]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields: missingFields.map((field) => field.name),
        },
        { status: 400 }
      );
    }

    // 新增資料
    const createdData = await db.groupData.create({
      data: {
        groupId,
        fieldData: body,
        createdById: userId,
        editableBy: [userId, group.creatorId], // 添加 editableBy 屬性
      },
    });

    return NextResponse.json({
      message: "Data added successfully",
      createdData,
    });
  } catch (error) {
    console.error("Error adding data:", error);
    return NextResponse.json({ error: "Failed to add data" }, { status: 500 });
  }
}
