/** @type {import('next').NextConfig} */
const isStaticExport = process.env.BUILD_HTML === "1";
const isGithubPages = process.env.GITHUB_PAGES === "1";
const basePath = isGithubPages ? "/agent-hub" : "";

const nextConfig = {
  ...(basePath ? { basePath } : {}),
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
