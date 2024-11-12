// app/page.tsx
"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 當用戶已登入時，自動跳轉到群組頁面
    if (status === "authenticated") {
      router.push("/groups");
    }
  }, [status, router]);

  // 加載中狀態
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  // 未登入時顯示的內容
  if (!session) {
    return (
      <div>
        <h1>Welcome to the Web App</h1>
        <p>Please sign in to access your groups.</p>
        <button onClick={() => signIn()}>Sign in</button>
      </div>
    );
  }

  return null; // 當已登入時不顯示此頁面內容
}
