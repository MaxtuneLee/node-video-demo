"use server";

import { FFImage, FFScene, FFCreator } from "ffcreator";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import puppeteer from "puppeteer";
import { spawn } from "child_process";

export const processVideoByChrome = async (formData: FormData) => {
	const baseVideo: File | null = formData.get("base") as File;
	const effectVideo: File | null = formData.get("effect") as File;

	if (!baseVideo || !effectVideo) {
		return new Error("No video file found");
	}

	const htmlUrl = "http://localhost:5173";

	const args =
		process.env.NODE_ENV === "development"
			? [
					"--disable-web-security", // 本地 避免cors报错
					"--disable-features=IsolateOrigins",
					"--disable-site-isolation-trials",
					// '--auto-open-devtools-for-tabs'
			  ]
			: [
					"--no-sandbox",
					"--no-zygote",
					"--single-process",
					"--disable-web-security",
					"--disable-features=IsolateOrigins",
					"--disable-site-isolation-trials", // bypass cors https://stackoverflow.com/questions/52129649/puppeteer-cors-mistake
					"--disk-cache-size=2147483647",
			  ];

	// Launch the browser
	const browser = await puppeteer.launch({
		userDataDir: "/tmp",
		ignoreDefaultArgs: ["--disable-dev-shm-usage"],
		// devtools: true,
		args,
	});

	// Create a page
	const page = await browser.newPage();

	console.log("start generate");
	const loadStartTime = Date.now();
	await page.goto(htmlUrl);
	await page.waitForFunction('typeof window.createVideo === "function"');
	page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
	const baseVideoBuffer = new Uint8Array(await baseVideo.arrayBuffer());
	const effectVideoBuffer = new Uint8Array(await effectVideo.arrayBuffer());
	// Evaluate JavaScript
	const buffer = await page.evaluate(
		async (info) => {
			const { baseVideo, effectVideo } = info;
			const baseVideoBuffer = new Uint8Array(Object.values(baseVideo));
			const effectVideoBuffer = new Uint8Array(
				Object.values(effectVideo)
			);
			// @ts-ignore
			return await window.createVideo(baseVideoBuffer, effectVideoBuffer);
		},
		{
			baseVideo: baseVideoBuffer,
			effectVideo: effectVideoBuffer,
		}
	);

	// Close browser.
	await browser.close();
	// console.log("buffer", buffer);

	const resBuffer = Buffer.from(buffer, "binary");

	const mp4FilePath = `tmp/output/${Date.now()}.mp4`;

	await fs.promises.writeFile(mp4FilePath, resBuffer);

	console.log(`任务总时长 ${(Date.now() - loadStartTime) / 1000}`);
	return "1";
};

export const processVideo = async (formData: FormData) => {
	const imageFile: File | null = formData.get("img") as File;
	if (!imageFile) {
		return new Error("No image file found");
	}
	// get image file width and height
	const buffer = new Uint8Array(await imageFile.arrayBuffer());
	const image = await sharp(buffer).metadata();
	const width = image.width;
	const height = image.height;
	if (width === undefined || height === undefined) {
		return new Error("Could not get image width and height");
	}
	// save imageFilr to disk
	await new Promise((resolve, reject) => {
		fs.writeFile(`tmp/image.${image.format}`, buffer, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve("success");
			}
		});
	});
	const filename = `public/tmp/output/${Date.now()}.mp4`;
	const creator = new FFCreator({
		cacheDir: "tmp/cache/",
		outputDir: "tmp/output",
		output: filename,
		width: width,
		height: height,
		audioLoop: true,
		fps: 24,
		parallel: 4,
		debug: false,
		defaultOutputOptions: null,
	});
	const scene = new FFScene();
	scene.setBgColor("#000");
	scene.setDuration(5);
	const mainImage = new FFImage({
		path: `tmp/image.${image.format}`,
		x: 0,
		y: 0,
		width: width * 3,
		height: height * 3,
	});
	// from top left corner to bottom right corner
	mainImage.addAnimate({
		from: {
			x: width * 3 - width - width / 2,
			y: height * 3 - height - height / 2,
		},
		to: { x: 0 - width / 2, y: 0 - height / 2 },
		time: 5,
	});
	scene.addChild(mainImage);
	const scene2 = new FFScene();
	scene2.setBgColor("#fff");
	scene2.setDuration(5);
	const mainImage2 = new FFImage({
		path: `tmp/image.${image.format}`,
		x: width / 2,
		y: height / 2,
		scale: 1.15,
	});
	// mainImage2.setAnchor(width / 2, height / 2);
	mainImage2.addEffect(["bounceIn"], 0.5, 0);
	mainImage2.addEffect(["bounceIn"], 0.5, 0.5);
	mainImage2.addEffect(["bounceIn"], 0.5, 1);
	mainImage2.addEffect(["bounceIn"], 0.5, 1.5);
	mainImage2.addEffect(["bounceIn"], 0.5, 2);
	mainImage2.addEffect(["bounceIn"], 0.5, 2.5);
	mainImage2.addEffect(["bounceIn"], 0.5, 3);
	mainImage2.addEffect(["bounceIn"], 0.5, 3.5);
	mainImage2.addEffect(["bounceIn"], 0.5, 4);
	mainImage2.addEffect(["bounceIn"], 0.5, 4.5);
	mainImage2.addEffect(["bounceIn"], 0.5, 5);
	scene2.addChild(mainImage2);
	creator.addChild(scene);
	creator.addChild(scene2);
	console.log("start");
	const timer = Date.now();
	creator.start();
	await new Promise((resolve) => {
		creator.on("complete", () => {
			resolve("success");
			// log seconds
			console.log("render finish:", (Date.now() - timer) / 1000, "s");
		});
	});
	return await filename;
};
