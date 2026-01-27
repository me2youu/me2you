import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import Header from '@/components/Header';
import AdminForm from './AdminForm';

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  if (!isAdmin(userId)) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <AdminForm />
      </main>
    </div>
  );
}
