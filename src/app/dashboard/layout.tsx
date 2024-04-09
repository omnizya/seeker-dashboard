export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className=" text-black-2 h-full text-center rounded-md bg-slate-300">
      {children}
    </main>
  );
}
