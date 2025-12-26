import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  return <div className="relative lg:w-full flex-1">
    <form className="h-10 rounded-xl bg-white relative border-none flex">
        <input type="text" placeholder="Search..." className="bg-white text-black flex-1 border-none pl-2.5 m-2.5 outline-none"/>
        <button type="submit" className="border rounded-[20px] w-14 h-8 mt-1 mr-1 mb-0 ml-0 bg-linear-to-r from-slate-500 to-slate-600 grid place-items-center cursor-pointer" >
            <SearchIcon/>
        </button>
    </form>
  </div>
  
}
