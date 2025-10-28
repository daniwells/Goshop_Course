import ThemeToggle from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="p-5">
      <div className="w-full flex justify-end">
        <ThemeToggle/>
      </div>
      Hello World!
      <Button>Click Me</Button>
    </div>
    
  );
}
