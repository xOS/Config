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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="icon" type="image/svg+xml" href="./static/favicon.svg">
    <title>Surge 规则库</title>
    <style>
        :root {
            --bg-color: #f5f5f7;
            --text-primary: #1d1d1f;
            --text-secondary: #86868b;
            --accent: #0071e3;
            --accent-hover: #0077ed;
            --card-bg: #ffffff;
            --card-border: rgba(0, 0, 0, 0.04);
            --item-hover: rgba(0, 0, 0, 0.03);
            --divider: rgba(0, 0, 0, 0.06);
            --icon-filter: none;
        }
        @media (prefers-color-scheme: dark) {
            :root {
                --bg-color: #000000;
                --text-primary: #f5f5f7;
                --text-secondary: #86868b;
                --accent: #2997ff;
                --accent-hover: #42a1ff;
                --card-bg: #1c1c1e;
                --card-border: rgba(255, 255, 255, 0.05);
                --item-hover: rgba(255, 255, 255, 0.06);
                --divider: rgba(255, 255, 255, 0.08);
                --icon-filter: invert(1);
            }
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
            background: var(--bg-color);
            color: var(--text-primary);
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            line-height: 1.5;
        }
        .container {
            width: 100%;
            max-width: 760px;
        }
        header {
            margin-bottom: 30px;
            padding: 0 10px;
        }
        h1 {
            font-size: 2.2rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin: 0 0 8px 0;
            color: var(--text-primary);
        }
        .subtitle {
            font-size: 1.05rem;
            color: var(--text-secondary);
            margin-bottom: 16px;
        }
        .meta {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }
        .meta a {
            color: var(--accent);
            text-decoration: none;
        }
        .search-section {
            position: relative;
            margin-bottom: 24px;
        }
        #search {
            width: 100%;
            padding: 14px 16px 14px 44px;
            font-size: 1.05rem;
            font-family: inherit;
            color: var(--text-primary);
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 14px;
            outline: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
            transition: box-shadow 0.2s, border-color 0.2s;
        }
        #search::placeholder {
            color: var(--text-secondary);
        }
        #search:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
        }
        .search-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-secondary);
            font-size: 1.1rem;
            pointer-events: none;
        }
        .search-hint {
            display: block;
            margin-top: 12px;
            padding: 0 10px;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }
        .search-hint img {
            vertical-align: middle;
            margin: 0 4px;
            filter: var(--icon-filter);
        }
        
        .directory-list {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 8px 0;
            border: 1px solid var(--card-border);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
            list-style: none;
            margin: 0;
        }
        .directory-list ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .directory-list li {
            margin: 0;
            position: relative;
        }
        
        /* Folders */
        .folder {
            cursor: pointer;
            user-select: none;
            padding: 12px 20px;
            font-weight: 600;
            color: var(--text-primary);
            transition: background-color 0.2s;
            display: block;
            border-bottom: 1px solid var(--divider);
        }
        .folder:hover {
            background-color: var(--item-hover);
        }
        .directory-list > li:last-child > .folder {
            border-bottom: none;
        }
        .folder::before {
            content: '';
            display: inline-block;
            width: 18px;
            height: 18px;
            margin-right: 12px;
            vertical-align: -3px;
            background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="%230071e3" xmlns="http://www.w3.org/2000/svg"><path d="M10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z"/></svg>');
            background-size: contain;
            background-repeat: no-repeat;
        }
        .folder.collapsed::before {
            opacity: 0.7;
        }
        .folder::after {
            content: '';
            position: absolute;
            right: 20px;
            top: 18px;
            width: 8px;
            height: 8px;
            border-right: 2px solid var(--text-secondary);
            border-bottom: 2px solid var(--text-secondary);
            transform: rotate(45deg);
            transition: transform 0.2s;
        }
        .folder.collapsed::after {
            transform: rotate(-45deg);
        }
        
        .folder ul {
            background: var(--bg-color);
            padding: 4px 10px 4px 30px;
            border-bottom: 1px solid var(--divider);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);
        }
        .folder.collapsed ul {
            display: none;
        }
        .folder ul > li {
            border-bottom: 1px solid var(--divider);
        }
        .folder ul > li:last-child {
            border-bottom: none;
        }
        
        /* Files */
        li > a.file {
            display: flex;
            align-items: center;
            text-decoration: none;
            color: var(--text-primary);
            padding: 12px 10px;
            font-weight: 400;
            transition: color 0.2s;
        }
        li > a.file::before {
            content: '';
            display: inline-block;
            width: 16px;
            height: 16px;
            margin-right: 12px;
            background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="%2386868b" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"/></svg>');
            background-size: contain;
            background-repeat: no-repeat;
            opacity: 0.7;
        }
        li > a.file:hover {
            color: var(--accent);
        }
        
        /* Surge Icon */
        li > a:not(.file) {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            padding: 6px;
            border-radius: 8px;
            background: var(--item-hover);
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        li > a:not(.file):hover {
            background: var(--divider);
        }
        
        .hidden { display: none !important; }
        
        @media (max-width: 600px) {
            body { padding: 20px 16px; }
            h1 { font-size: 1.8rem; }
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
            <input type="text" id="search" placeholder="搜索文件或文件夹..."/>
            <div class="search-hint">
                提示: 模块点击后缀 <img alt="导入 Surge" style="height: 16px" src="./static/surge-transparent.png"> 一键导入 Surge
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="icon" type="image/svg+xml" href="./static/favicon.svg">
    <title>404 - 页面未找到</title>
    <style>
        :root {
            --bg-color: #f5f5f7;
            --text-primary: #1d1d1f;
            --text-secondary: #86868b;
            --accent: #0071e3;
        }
        @media (prefers-color-scheme: dark) {
            :root {
                --bg-color: #000000;
                --text-primary: #f5f5f7;
                --text-secondary: #86868b;
                --accent: #2997ff;
            }
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
            background: var(--bg-color);
            color: var(--text-primary);
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .container {
            padding: 40px;
        }
        .error-code {
            font-size: 6rem;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.04em;
        }
        .error-message {
            font-size: 1.2rem;
            color: var(--text-secondary);
            margin: 16px 0 32px;
        }
        .home-link {
            display: inline-block;
            padding: 12px 24px;
            background: var(--accent);
            color: #ffffff;
            text-decoration: none;
            border-radius: 20px;
            font-weight: 600;
            font-size: 1rem;
            transition: opacity 0.2s;
        }
        .home-link:hover {
            opacity: 0.9;
        }
        .meta {
            margin-top: 40px;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }
    </style>
</head>
<body>
    <main class="container">
        <h1 class="error-code">404</h1>
        <p class="error-message">很抱歉，您访问的页面不存在</p>
        <a href="/" class="home-link">返回首页</a>
        <div class="meta">
            由 <a href="https://github.com/xOS/Config" style="color:var(--accent);text-decoration:none;" target="_blank">xOS</a> 提供
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
