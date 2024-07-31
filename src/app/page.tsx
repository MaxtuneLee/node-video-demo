"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { processVideo, processVideoByChrome } from "./video-process";
import { useFormStatus } from "react-dom";
import { useState } from "react";

export default function Home() {
	const { pending } = useFormStatus();
	const { pending: pending2 } = useFormStatus();
	const [videoFile, setVideoFile] = useState<string | null>(null);
	console.log("videoFile", videoFile);
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<form
				action={async (formData: FormData) => {
					const videoFile = await processVideoByChrome(formData);
				}}
			>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label htmlFor="picture">视频合成</Label>
					<Input id="base" name="base" type="file" />
					<Input id="effect" name="effect" type="file" />
					<Button type="submit" className="mt-3" disabled={pending}>
						提交
					</Button>
				</div>
			</form>
			<form
				action={async (formData: FormData) => {
					const videoFile = await processVideo(formData);
					if (videoFile instanceof Error) {
						console.error(videoFile);
						return;
					}
					setVideoFile(videoFile);
				}}
			>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label htmlFor="picture">选择图片生成视频</Label>
					<Input id="picture" name="img" type="file" />
					<Button type="submit" className="mt-3" disabled={pending2}>
						提交
					</Button>
				</div>
			</form>
		</main>
	);
}
