import Link from 'next/link';
import type { Metadata } from 'next';
import { AdminLoginForm } from '@/components/admin/admin-login-form';

export const metadata: Metadata = {
  title: 'Log In - WordPress Admin',
  robots: { index: false, follow: false }
};

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-start justify-center bg-[#f0f0f1] pt-[8vh] text-[#3c434a]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif' }}>
      <style>{`body:has(.hlt-admin-login) > header, body:has(.hlt-admin-login) > footer { display: none !important; } body:has(.hlt-admin-login) { margin: 0; background: #f0f0f1; }`}</style>
      <section className="hlt-admin-login flex flex-col items-center" data-admin-panel translate="no">
        <div className="grid h-[84px] w-[84px] place-items-center text-[64px] font-semibold leading-none text-[#3c434a]">W</div>
        <AdminLoginForm />
        <p className="mt-[16px] w-[320px] text-[13px]"><Link className="text-[#2271b1] hover:text-[#135e96]" href="/">Go to site</Link></p>
      </section>
    </main>
  );
}
