export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-white  -mb-2 m-4 text-black-2 h-screen w-screen text-center rounded-md">
      {children}
    </main>
  );
}
