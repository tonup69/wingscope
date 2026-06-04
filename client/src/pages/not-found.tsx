import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-xl font-bold text-foreground mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-4">The page you are looking for does not exist.</p>
      <Link href="/">
        <Button size="sm">Go to Analyze</Button>
      </Link>
    </div>
  );
}
