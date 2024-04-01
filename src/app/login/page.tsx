import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <article className="max-w-xs my-2 overflow-hidden rounded shadow-lg">
      <div className="px-6 py-4">
        <div className="mb-2 p-2 drop-shadow-lg    text-center text-[3rem] font-bold  text-indigo-500">
          BRAND
        </div>
        <form dir="ltr" className="flex flex-col">
          <label htmlFor="email" className="mb-2 italic">
            Email:
          </label>
          <input
            className="mb-4 border-b-2 p-2 text-black text-lg font-satoshi"
            id="email"
            name="email"
            type="email"
            required
          />
          <label htmlFor="password" className="mb-2 italic">
            Password:
          </label>
          <input
            id="password"
            className="mb-4 border-b-2 p-2 text-black text-lg font-satoshi"
            name="password"
            type="password"
            required
          />
          <div className="flex justify-between flex-col min-h-20">
            <button
              className="my-2 px-4 py-2 font-bold text-white bg-emerald-500 rounded-sm  hover:bg-blue-700"
              formAction={login}
            >
              Log in
            </button>
            <button
              className="my-2 px-4 py-2 font-bold text-white bg-zinc-500 rounded-sm  hover:bg-blue-700"
              formAction={signup}
            >
              Sign up
            </button>
          </div>
          <span className="w-[2ch] aspect-square h-[2ch] place-self-end shadow-2 hover:text-zinc-100  hover:bg-blue-500 align-text-bottom text-center text-md rounded-full bg-white text-black font-black block ">
            ?
          </span>
        </form>
      </div>
    </article>
  );
}
