// app/groups/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import Link from "next/link";
import { Group } from "@prisma/client";

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const router = useRouter();

  useEffect(() => {
    // 檢查用戶是否登入，未登入則跳回首頁
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    // 當用戶已登入時，載入與用戶相關的群組資料
    if (session) {
      async function fetchGroups() {
        const res = await fetch("/api/groups");
        const data: Group[] = await res.json();
        setGroups(data);
      }
      fetchGroups();
    }
  }, [session]);

  // 加載中狀態
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome, {session?.user?.name}</h1>
      <button onClick={() => signOut()}>Sign out</button>

      <h2>Your Groups</h2>
      {groups.length === 0 ? (
        <p>You are not part of any groups yet.</p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group.id}>
              {/* <Link href={`/groups/${group.id}`}>
                <a>{group.name}</a>
              </Link> */}
              <p>{group.description}</p>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => router.push("/groups/create")}>
        Create New Group
      </button>
    </div>
  );
}
