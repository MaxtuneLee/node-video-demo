/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ["canvas", "@ffmpeg-installer/ffmpeg", "fluent-ffmpeg", "ffprobe-installer", "ffcreator"],
    },
    webpack: (config) => {
        config.externals = [...config.externals, { canvas: 'canvas' }]; // required to make Konva & react-konva work
        return config;
    },
};

export default nextConfig;
