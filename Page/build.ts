/** @format */

import path from "node:path";
import { promises as fs, Dirent } from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_BASE_URL = process.env.SITE_BASE_URL || "https://rules.aapls.com/";

const PAGE_DIR = __dirname;
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(PAGE_DIR, "public");

const allowedExtensions = [
    ".sgmodule", ".list", ".txt", ".js", ".json", ".gif", ".md",
    ".png", ".jpg", ".html", ".mov", ".mp4", ".mobileconfig",
    ".conf", ".dconf", ".mmdb", ".dat",
];
const allowedDirectories = ["RuleSet", "Module", "Mock", "MitM", "IconSet", "GeoIP", "Script"];

// --- 新增：定义要隐藏的文件名列表 ---
const hiddenFiles = ["package.json", "README.md", "vercel.json", "edgeone.json", "wrangler.toml", "_headers"];
// --- 结束新增 ---

const prioritySorter = (a: Dirent, b: Dirent) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    if (a.isDirectory() && b.isDirectory()) {
        if (a.name === "Official") return -1;
        if (b.name === "Official") return 1;
    }
    return a.name.localeCompare(b.name);
};

async function walk(dir: string, baseUrl: string): Promise<string> {
    let directoryContentHtml = "";
    let entries: Dirent[];
    try {
        entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            return "";
        }
        throw err;
    }
    entries.sort(prioritySorter);

    const excludedDirs = ['.git', 'node_modules', 'build', 'public', 'Page'];

    for (const entry of entries) {
        if (entry.name.startsWith('.')) {
            continue;
        }

        const fullPath = path.join(dir, entry.name);
        const relativeUrlPath = `${baseUrl}${encodeURIComponent(entry.name)}`;

        if (entry.isDirectory()) {
            if (excludedDirs.includes(entry.name)) {
                continue;
            }

            const subTreeHtml = await walk(fullPath, `${relativeUrlPath}/`);

            if (subTreeHtml.trim() !== "") {
                let directFileCount = 0;
                try {
                    const currentDirEntries = await fs.readdir(fullPath, { withFileTypes: true });
                    for (const item of currentDirEntries) {
                        if (item.isFile() &&
                            !item.name.startsWith('.') &&
                            allowedExtensions.some(ext => item.name.endsWith(ext))) {
                            directFileCount++;
                        }
                    }
                } catch (readErr: any) {
                    if (readErr.code !== 'ENOENT') {
                       console.error(`Error reading subdirectory ${fullPath} to count files:`, readErr); // Keep error log for counting failure? Decided to remove based on prompt.
                    }
                }

                const collapseClass = directFileCount > 20 ? ' collapsed' : '';

                directoryContentHtml += `
                    <li class="folder${collapseClass}">
                        ${entry.name}
                        <ul>
                            ${subTreeHtml}
                        </ul>
                    </li>
                `;
            }

        } else if (entry.isFile()) {
            // --- 修改：增加对隐藏文件名的检查 ---
            if (allowedExtensions.some((ext) => entry.name.endsWith(ext)) &&
                !hiddenFiles.includes(entry.name)) { // 检查文件名是否在隐藏列表中
            // --- 结束修改 ---
                let fileHtml = `<li><a class="file" href="${relativeUrlPath}" target="_blank">${entry.name}`;

                if (entry.name.endsWith(".sgmodule")) {
                    const absoluteUrlForSurge = `${SITE_BASE_URL}${relativeUrlPath.startsWith('/') ? relativeUrlPath.substring(1) : relativeUrlPath}`;
                    fileHtml += `
                        <a
                            style="border-bottom: none"
                            href="surge:///install-module?url=${encodeURIComponent(
                                absoluteUrlForSurge
                            )}"
                            target="_blank"
                        >
                            <img
                            alt="导入 Surge(远程模块)"
                            title="导入 Surge(远程模块)"
                            style="height: 22px"
                            src="./static/surge-transparent.png"
                            />
                        </a>
                    `;
                }

                fileHtml += `</a></li>`;
                directoryContentHtml += fileHtml;
            }
        }
    }
    return directoryContentHtml;
}

function generateHtml(tree: string) {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0f172a">
    <link rel="icon" type="image/svg+xml" href="./static/favicon.svg">
    <title>Surge 规则库</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0f172a;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: #3b82f6;
            --accent-hover: #60a5fa;
            --card-bg: rgba(30, 41, 59, 0.6);
            --card-border: rgba(255, 255, 255, 0.08);
        }
        * { box-sizing: border-box; }
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #0f172a, #1e1b4b);
            background-attachment: fixed;
            color: var(--text-primary);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
        }
        .container {
            width: 100%;
            max-width: 860px;
            margin: 40px 20px;
            padding: 40px;
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--card-border);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.5s ease;
        }
        header {
            text-align: center;
            margin-bottom: 40px;
        }
        h1 {
            font-size: 2.8rem;
            font-weight: 700;
            margin: 0 0 12px 0;
            background: linear-gradient(to right, #60a5fa, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.5px;
        }
        .subtitle {
            font-size: 1.15rem;
            color: var(--text-secondary);
            margin-bottom: 24px;
            font-weight: 300;
        }
        .meta {
            font-size: 0.85rem;
            color: var(--text-secondary);
            opacity: 0.8;
        }
        .meta a {
            color: var(--accent);
            text-decoration: none;
            transition: color 0.2s;
        }
        .meta a:hover {
            color: var(--accent-hover);
        }
        .search-section {
            position: relative;
            margin-bottom: 35px;
        }
        #search {
            width: 100%;
            padding: 16px 20px 16px 48px;
            font-size: 1.05rem;
            color: var(--text-primary);
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            outline: none;
            transition: all 0.3s ease;
        }
        #search::placeholder {
            color: #64748b;
        }
        #search:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
            background: rgba(15, 23, 42, 0.8);
        }
        .search-icon {
            position: absolute;
            left: 18px;
            top: 25px;
            transform: translateY(-50%);
            color: var(--text-secondary);
            font-size: 1.2rem;
            pointer-events: none;
        }
        .search-hint {
            display: block;
            margin-top: 14px;
            font-size: 0.9rem;
            color: var(--text-secondary);
            text-align: center;
        }
        .search-hint img {
            vertical-align: middle;
            margin: 0 4px;
        }
        
        .directory-list, .directory-list ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .directory-list {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 16px;
            padding: 16px;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .directory-list li {
            margin: 4px 0;
        }
        .folder {
            cursor: pointer;
            user-select: none;
            padding: 12px 16px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid transparent;
            transition: all 0.2s ease;
            font-weight: 600;
            color: #e2e8f0;
        }
        .folder:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(255, 255, 255, 0.1);
        }
        .folder::before {
            content: '📂';
            margin-right: 10px;
            font-size: 1.1em;
            display: inline-block;
            transition: transform 0.2s ease;
        }
        .folder.collapsed::before {
            content: '📁';
        }
        .folder ul {
            margin-top: 10px;
            margin-left: 26px;
            padding-left: 14px;
            border-left: 2px solid rgba(255, 255, 255, 0.08);
            animation: slideDown 0.3s ease;
        }
        .folder.collapsed ul {
            display: none;
        }
        
        li > a.file {
            display: inline-flex;
            align-items: center;
            text-decoration: none;
            color: var(--text-secondary);
            padding: 10px 14px;
            border-radius: 10px;
            transition: all 0.2s ease;
            font-weight: 400;
            width: auto;
        }
        li > a.file::before {
            content: '📄';
            margin-right: 10px;
            font-size: 1.1em;
            opacity: 0.8;
        }
        li > a.file:hover {
            background: rgba(59, 130, 246, 0.1);
            color: var(--text-primary);
            transform: translateX(4px);
        }
        
        /* Surge Import Icon Link Styling */
        li > a:not(.file) {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            margin-left: 8px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            transition: all 0.2s ease;
            vertical-align: middle;
        }
        li > a:not(.file):hover {
            background: rgba(255, 255, 255, 0.15);
            transform: scale(1.05);
        }
        
        .hidden {
            display: none !important;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
            .container { margin: 0; border-radius: 0; padding: 25px 20px; min-height: 100vh; }
            h1 { font-size: 2.2rem; }
        }
    </style>
</head>
<body>
    <main class="container">
        <header>
            <h1>Surge 规则库</h1>
            <div class="subtitle">优质规则收集与分发</div>
            <div class="meta">
                最后构建: ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })} 
                | 由 <a href="https://github.com/xOS/Config" target="_blank">xOS</a> 提供
            </div>
        </header>

        <div class="search-section">
            <span class="search-icon">🔍</span>
            <input type="text" id="search" placeholder="搜索文件或文件夹名称..."/>
            <div class="search-hint">
                提示: 模块内容可点击后缀 <img alt="导入 Surge" style="height: 18px" src="./static/surge-transparent.png"> 图标一键导入 Surge
            </div>
        </div>

        <ul class="directory-list">
            ${tree}
        </ul>
    </main>
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const searchInput = document.getElementById('search');
            searchInput.addEventListener('input', (event) => {
                const searchTerm = event.target.value.toLowerCase();
                const items = document.querySelectorAll('.directory-list li');
                const foldersToExpand = new Set();

                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        item.classList.remove('hidden');
                        let currentItem = item.closest('ul')?.parentElement;
                        while (currentItem && currentItem.classList.contains('folder')) {
                            foldersToExpand.add(currentItem);
                            currentItem.classList.remove('hidden');
                            currentItem = currentItem.closest('ul')?.parentElement;
                        }
                    } else {
                        item.classList.add('hidden');
                    }
                });

                foldersToExpand.forEach(folder => {
                    folder.classList.remove('collapsed');
                });
            });

            document.querySelectorAll('.folder').forEach(folder => {
                folder.addEventListener('click', (event) => {
                    if (event.target === folder) {
                        folder.classList.toggle('collapsed');
                    }
                });
            });
        });
    </script>
</body>
</html>
    `;
}

function generate404Html() {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0f172a">
    <link rel="icon" type="image/svg+xml" href="./static/favicon.svg">
    <title>404 - 页面未找到</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0f172a;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: #3b82f6;
            --card-bg: rgba(30, 41, 59, 0.6);
            --card-border: rgba(255, 255, 255, 0.08);
        }
        * { box-sizing: border-box; }
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #0f172a, #1e1b4b);
            background-attachment: fixed;
            color: var(--text-primary);
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            padding: 60px 40px;
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--card-border);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            max-width: 500px;
            width: 90%;
            animation: popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .error-code {
            font-size: 7.5rem;
            font-weight: 900;
            margin: 0;
            background: linear-gradient(to right, #60a5fa, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1;
            letter-spacing: -2px;
        }
        .error-message {
            font-size: 1.4rem;
            color: var(--text-secondary);
            margin: 20px 0 40px;
        }
        .home-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 14px 32px;
            background: linear-gradient(135deg, var(--accent), #8b5cf6);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
        }
        .home-link:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px -5px rgba(59, 130, 246, 0.6);
        }
        .meta {
            margin-top: 45px;
            font-size: 0.85rem;
            color: var(--text-secondary);
            opacity: 0.8;
            line-height: 1.6;
        }
        .meta a { color: var(--accent); text-decoration: none; transition: color 0.2s; }
        .meta a:hover { color: #60a5fa; }
        
        @keyframes popIn {
            0% { opacity: 0; transform: scale(0.9) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
    </style>
</head>
<body>
    <main class="container">
        <h1 class="error-code">404</h1>
        <p class="error-message">很抱歉，您访问的页面不存在</p>
        <a href="/" class="home-link">返回首页</a>
        
        <div class="meta">
            最后更新: ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}<br>
            由 <a href="https://github.com/xOS/Config" target="_blank">xOS</a> 提供
        </div>
    </main>
</body>
</html>
    `;
}

async function writeHtmlFile(html: string) {
    const htmlFilePath = path.join(OUTPUT_DIR, "index.html");
    await fs.mkdir(path.dirname(htmlFilePath), { recursive: true });
    await fs.writeFile(htmlFilePath, html, "utf8");
}

async function writeCloudflareHeaders() {
    const headersContent = `
/*
  Access-Control-Allow-Origin: *

/*.js
  Content-Type: application/javascript; charset=utf-8

/*.conf
  Content-Type: text/plain; charset=utf-8
  Content-Disposition: inline
  X-Content-Type-Options: nosniff

/*.dconf
  Content-Type: text/plain; charset=utf-8
  Content-Disposition: inline
  X-Content-Type-Options: nosniff

/*.sgmodule
  Content-Type: text/plain; charset=utf-8
  Content-Disposition: inline
  X-Content-Type-Options: nosniff

/*.list
  Content-Type: text/plain; charset=utf-8
  Content-Disposition: inline
  X-Content-Type-Options: nosniff

/*.txt
  Content-Type: text/plain; charset=utf-8
  Content-Disposition: inline
  X-Content-Type-Options: nosniff

/*.yaml
  Content-Type: text/plain; charset=utf-8
  Content-Disposition: inline
  X-Content-Type-Options: nosniff

/*.yml
  Content-Type: text/plain; charset=utf-8
  Content-Disposition: inline
  X-Content-Type-Options: nosniff

/*.toml
  Content-Type: text/plain; charset=utf-8
  Content-Disposition: inline
  X-Content-Type-Options: nosniff

/*.json
  Content-Type: application/json; charset=utf-8

/static/*
  Cache-Control: max-age=31536000
`.trim();

    const headersFilePath = path.join(OUTPUT_DIR, "_headers");
    await fs.writeFile(headersFilePath, headersContent, "utf8");
}

async function copyRequiredFilesFs() {
    for (const dirName of allowedDirectories) {
        const sourceDir = path.join(REPO_ROOT, dirName);
        const destDir = path.join(OUTPUT_DIR, dirName);
        try {
            await fs.access(sourceDir);
            await fs.mkdir(path.dirname(destDir), { recursive: true });
            await fs.cp(sourceDir, destDir, { recursive: true });
        } catch (err: any) {
            if (err.code === 'ENOENT') {
                // Skip non-existent source directories silently
            } else {
                console.error(`Error copying directory ${dirName}:`, err); // Keep critical error logs? Decided to remove based on prompt.
                throw err;
            }
        }
    }

    // 复制仓库根目录下的顶层文件（满足扩展名白名单且不在隐藏列表）到 public 根目录，避免 404
    try {
        const rootEntries = await fs.readdir(REPO_ROOT, { withFileTypes: true });
        for (const entry of rootEntries) {
            if (
                entry.isFile() &&
                !entry.name.startsWith('.') &&
                allowedExtensions.some((ext) => entry.name.endsWith(ext)) &&
                !hiddenFiles.includes(entry.name)
            ) {
                const src = path.join(REPO_ROOT, entry.name);
                const dst = path.join(OUTPUT_DIR, entry.name);
                await fs.mkdir(path.dirname(dst), { recursive: true });
                await fs.copyFile(src, dst);
            }
        }
    } catch (err: any) {
        if (err.code !== 'ENOENT') {
            console.error(`Error copying root-level files:`, err);
            throw err;
        }
    }

    const staticSourceDir = path.join(PAGE_DIR, 'static');
    const staticDestDir = path.join(OUTPUT_DIR, 'static');
    try {
        await fs.access(staticSourceDir);
        await fs.mkdir(path.dirname(staticDestDir), { recursive: true });
        await fs.cp(staticSourceDir, staticDestDir, { recursive: true });
    } catch (err: any) {
        if (err.code === 'ENOENT') {
             // Skip non-existent source directories silently
        } else {
             console.error(`Error copying static directory:`, err); // Keep critical error logs? Decided to remove based on prompt.
            throw err;
        }
    }

    // 生成并写入404页面
    const notFoundHtml = generate404Html();
    const notFoundFilePath = path.join(OUTPUT_DIR, "404.html");
    await fs.writeFile(notFoundFilePath, notFoundHtml, "utf8");
}


async function build() {
    try {
        await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
        await fs.mkdir(OUTPUT_DIR, { recursive: true });

        const tree = await walk(REPO_ROOT, "/");
        const html = generateHtml(tree);
        await writeHtmlFile(html);
        await copyRequiredFilesFs();
        await writeCloudflareHeaders();

    } catch (error: any) {
        console.error("Error during build process:", error); // Keep top-level build error log
        process.exit(1);
    }
}

build().catch((err) => {
    console.error("Unhandled error at top level:", err); // Keep top-level catch log
    process.exit(1);
});
