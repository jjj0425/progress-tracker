// app/page.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function HomePage() {
  const { data: session } = useSession();
  console.log("Session user:", session?.user.id);


  if (!session) {
    return (
      <div>
        <h1>Welcome to the Web App</h1>
        <p>Please sign in to access your groups.</p>
        <button onClick={() => signIn()}>Sign in</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      <p>User ID: {session.user.id}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
