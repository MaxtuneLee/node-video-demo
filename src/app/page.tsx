import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { processVideo } from "./video-process";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form action={processVideo}>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">选择图片</Label>
          <Input id="picture" name="img" type="file" />
          <Button type="submit" className="mt-3">
            提交
          </Button>
        </div>
      </form>
    </main>
  );
}
