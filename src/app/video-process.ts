"use server"

import { FFImage, FFScene, FFCreator } from "ffcreator";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const processVideo = async (formData: FormData) => {
    const imageFile: File | null = formData.get('img') as File;
    if (!imageFile) {
        return new Error('No image file found');
    }
    // get image file width and height
    const buffer = new Uint8Array(await imageFile.arrayBuffer());
    const image = await sharp(buffer).metadata();
    const width = image.width;
    const height = image.height;
    if (width === undefined || height === undefined) {
        return new Error('Could not get image width and height');
    }
    // save imageFilr to disk
    await new Promise((resolve, reject) => {
        fs.writeFile(`tmp/image.${image.format}`, buffer, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve('success');
            }
        });
    })
    const creator = new FFCreator({
        cacheDir: 'tmp/cache/',
        outputDir: 'tmp/output',
        output: `tmp/output/${Date.now()}.mp4`,
        width: width,
        height: height,
        audioLoop: true,
        fps: 24,
        parallel: 4,
        debug: false,
        defaultOutputOptions: null,
    });
    const scene = new FFScene();
    scene.setBgColor('#000');
    scene.setDuration(5);
    const mainImage = new FFImage({ path: `tmp/image.${image.format}`, x: 0, y: 0, width: width * 3, height: height * 3 });
    // from top left corner to bottom right corner
    mainImage.addAnimate({
        from: { x: width * 3 - width - width / 2, y: height * 3 - height - height / 2 },
        to: { x: 0 - width / 2, y: 0 - height / 2 },
        time: 5,
    })
    scene.addChild(mainImage);
    const scene2 = new FFScene();
    scene2.setBgColor('#fff');
    scene2.setDuration(5);
    const mainImage2 = new FFImage({ path: `tmp/image.${image.format}`, x: width / 2, y: height / 2, scale: 1.15 });
    // mainImage2.setAnchor(width / 2, height / 2);
    mainImage2.addEffect(['bounceIn'], 0.5, 0);
    mainImage2.addEffect(['bounceIn'], 0.5, 0.5);
    mainImage2.addEffect(['bounceIn'], 0.5, 1);
    mainImage2.addEffect(['bounceIn'], 0.5, 1.5);
    mainImage2.addEffect(['bounceIn'], 0.5, 2);
    mainImage2.addEffect(['bounceIn'], 0.5, 2.5);
    mainImage2.addEffect(['bounceIn'], 0.5, 3);
    mainImage2.addEffect(['bounceIn'], 0.5, 3.5);
    mainImage2.addEffect(['bounceIn'], 0.5, 4);
    mainImage2.addEffect(['bounceIn'], 0.5, 4.5);
    mainImage2.addEffect(['bounceIn'], 0.5, 5);
    scene2.addChild(mainImage2);
    creator.addChild(scene);
    creator.addChild(scene2);
    console.log('start');
    const timer = Date.now();
    creator.start();
    await new Promise((resolve) => {
        creator.on('complete', () => {
            resolve('success');
            // log seconds
            console.log("render finish:", (Date.now() - timer) / 1000, 's');
        });
    })
    return 'success';
};