/** @format */

import path from "node:path";
import { promises as fs, Dirent } from "node:fs";

const SITE_BASE_URL = process.env.SITE_BASE_URL || "https://rules.aapls.com/";

const PAGE_DIR = path.resolve(".");
const REPO_ROOT = path.resolve("..");
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
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="msapplication-TileColor" content="#0F7D00">
            <meta name="theme-color" content="#0F7D00">
            <meta property="og:image" content="https://static.nange.cn/image/others/bingo.jpeg">
            <link rel="icon" type="image/svg+xml" href="./static/favicon.svg">
            <title>Surge 规则</title>
            <link rel="stylesheet" href="./static/style.css" />
            <style>
                .folder {
                    cursor: pointer;
                    font-weight: bold;
                    list-style-type: none;
                    padding-left: 0
                }
                .folder ul {
                    display: block;
                    border-left: 1px dashed #ddd;
                    margin-left: 10px;
                    padding-left: 20px
                }
                .folder.collapsed ul {
                    display: none;
                }
                .hidden {
                    display: none;
                }
                #search {
                    width: 100%;
                    padding: 10px 15px;
                    margin: 20px 0;
                    font-size: 1rem;
                    border: 1px solid #ddd;
                    border-radius: 30px;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                #search:focus {
                    border-color: #007bff;
                    outline: none;
                    box-shadow: 0px 4px 12px rgba(0, 123, 255, 0.4);
                }
                .container {
                    padding: 20px;
                }
                .search-section {
                    margin-bottom: 30px;
                }
                .directory-list {
                    margin-top: 20px;
                    padding-left: 0;
                }
            </style>
        </head>
        <body>
        <main class="container">
            <h1> Surge 规则 </h1>
            <span>日用夜用</span>
            <br>
            <small>Last Build: ${new Date().toLocaleString("zh-CN", {
                timeZone: "Asia/Shanghai",
            })}  | Made by  <a href="https://github.com/xOS/Config">xOS</a></small>

            <div class="search-section">
                <input type="text" id="search" placeholder="🔍 搜索文件和文件夹..."/>
                <small>ℹ️ 模块内容点击此<img alt="导入 Surge(远程模块)" title="导入 Surge(远程模块)" style="height: 22px" src="./static/surge-transparent.png">图标一键导入 Surge</small>
                <br>
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
                            let currentItem = item.closest('ul').parentElement;
                            while (currentItem && currentItem.classList.contains('folder')) {
                                foldersToExpand.add(currentItem);
                                currentItem = currentItem.closest('ul').parentElement;
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
                        if (event.target.tagName === 'A' && event.target.classList.contains('file')) {
                                return;
                                }
                        event.stopPropagation();
                        folder.classList.toggle('collapsed');
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
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="msapplication-TileColor" content="#0F7D00">
            <meta name="theme-color" content="#0F7D00">
            <meta property="og:image" content="https://static.nange.cn/image/others/bingo.jpeg">
            <link rel="icon" type="image/svg+xml" href="./static/favicon.svg">
            <title>404 - 页面未找到</title>
            <link rel="stylesheet" href="./static/style.css" />
            <style>
                .container {
                    text-align: center;
                    padding: 50px 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .error-code {
                    font-size: 120px;
                    margin: 0;
                    color: #ff9800;
                    font-weight: bold;
                }
                .error-message {
                    font-size: 24px;
                    margin: 20px 0 40px;
                }
                .home-link {
                    display: inline-block;
                    padding: 10px 25px;
                    background-color: #ff9800;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    transition: background-color 0.3s ease;
                }
            </style>
        </head>
        <body>
        <main class="container">
            <h1 class="error-code">404</h1>
            <p class="error-message">很抱歉，您访问的页面不存在</p>
            <a href="/" class="home-link" style="text-decoration: none;">返回首页</a>
            <br><br>
            <small>Last Updated: ${new Date().toLocaleString("zh-CN", {
                timeZone: "Asia/Shanghai",
            })} | Made by <a href="https://github.com/xOS/Config">xOS</a></small>
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
