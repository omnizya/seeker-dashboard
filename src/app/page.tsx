import Link from "next/link";
export default function Home() {
  return (
    <main
      className="bg-white  -mb-2 m-4 text-black-2 h-screen w-screen text-center rounded-md"
      dir="ltr"
    >
      <header className="mt-0 p-2 bg-indigo-500 min-h-50 flex justify-center items-center relative">
        <h1 className="text-4xl font-satoshi text-orange-100">Landing</h1>
      </header>
      <aside className="min-h-12 flex justify-around items-center bg-orange-500">
        <Link href={"/login"} className="bg-indigo-500 text-orange-100 w-1/3 h-8">
          Login
        </Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href={'/error'} className="bg-zinc-500 text-slate-50 w-1/3 h-8">Login</Link>
      </aside>
    </main>
  );
}
