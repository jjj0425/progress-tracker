import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; dataId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { dataId } = params;

  try {
    // 確認資料存在
    const data = await db.groupData.findUnique({
      where: { id: parseInt(dataId, 10) },
      include: { group: { include: { members: true } } },
    });

    if (!data) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    const userId = session.user.id;

    // 檢查是否為創建人或管理員
    const isCreator = data.createdById === userId;
    const isAdmin = data.group.members.some(
      (member) => member.userId === userId && member.role === "ADMIN"
    );

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // 刪除資料
    await db.groupData.delete({
      where: { id: parseInt(dataId, 10) },
    });

    return NextResponse.json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting data:", error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
