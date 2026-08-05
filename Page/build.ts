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
const hiddenFiles = ["package.json", "package-lock.json", "README.md", "vercel.json", "edgeone.json", "wrangler.toml", "_headers"];
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

    const excludedDirs = ['.git', 'node_modules', 'build', 'public', 'Page', 'test', 'Test'];

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
                            src="/static/surge-transparent.png"
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
    <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
    <title>Surge 规则库</title>
    <style>
        :root {
            --bg: #e2e8f0;
            --island-bg: linear-gradient(135deg, #ffffff 0%, #f8fafc 52%, #eef2f7 100%);
            --island-border: rgba(255, 255, 255, 0.5);
            --island-border-top: rgba(255, 255, 255, 0.5);
            --island-shadow: 0 10px 28px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(15, 23, 42, 0.04);
            --text: #333333;
            --text-muted: #777777;
            --border: rgba(0, 0, 0, 0.06);
            --primary: #f97316;
            --active-bg: rgba(249, 115, 22, 0.1);
            --element-bg: rgba(0, 0, 0, 0.03);
        }
        @media (prefers-color-scheme: dark) {
            :root {
                --bg: #0f172a;
                --island-bg: linear-gradient(135deg, #24314f 0%, #1e2a45 54%, #172039 100%);
                --island-border: rgba(255, 255, 255, 0.15);
                --island-border-top: rgba(255, 255, 255, 0.25);
                --island-shadow: 0 10px 28px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 -1px 0 rgba(0, 0, 0, 0.22);
                --text: #eeeeee;
                --text-muted: #94a3b8;
                --border: rgba(255, 255, 255, 0.08);
                --primary: #f97316;
                --active-bg: rgba(249, 115, 22, 0.15);
                --element-bg: rgba(255, 255, 255, 0.06);
            }
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            margin: 0;
            padding: 12px;
            box-sizing: border-box;
            height: 100vh;
            display: flex;
            gap: 12px;
            background: var(--bg);
            color: var(--text);
            overflow: hidden;
            font-size: 13px;
            -webkit-tap-highlight-color: transparent;
        }

        /* Islands */
        .island {
            background: var(--island-bg);
            background-clip: padding-box;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--island-border);
            border-top: 1px solid var(--island-border-top);
            border-radius: 10px;
            box-shadow: var(--island-shadow);
        }

        /* Sidebar */
        .sidebar {
            width: 220px;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            overflow: hidden;
        }
        .sidebar-header {
            padding: 16px 14px;
            border-bottom: 1px solid var(--border);
        }
        .sidebar-header h1 {
            font-size: 14px;
            margin: 0 0 4px 0;
            font-weight: 600;
        }
        .sidebar-header .meta {
            font-size: 11px;
            color: var(--text-muted);
            line-height: 1.5;
            margin-top: 6px;
        }
        .sidebar-header .meta a {
            color: var(--text);
            font-weight: 600;
            text-decoration: none;
        }
        .sidebar-content {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        }

        /* Main Wrapper */
        .main-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-width: 0;
        }

        /* Main Header */
        .main-header {
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            flex-shrink: 0;
        }
        .breadcrumbs {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 500;
            overflow-x: auto;
            white-space: nowrap;
            scrollbar-width: none;
        }
        .breadcrumbs::-webkit-scrollbar { display: none; }

        .crumb {
            cursor: pointer;
            color: var(--text-muted);
            display: flex;
            align-items: center;
        }
        .crumb.active { color: var(--text); font-weight: 600; cursor: default; }
        .sep { color: var(--border); margin: 0 2px; }

        .search-box {
            position: relative;
            width: 220px;
        }
        .search-box input {
            width: 100%;
            padding: 6px 10px 6px 28px;
            border-radius: 9999px;
            border: 1px solid var(--border);
            background: var(--element-bg);
            color: var(--text);
            outline: none;
            font-size: 12px;
            box-sizing: border-box;
        }
        .search-box input:focus { border-color: var(--primary); }
        .search-box svg {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 13px;
            height: 13px;
            color: var(--text-muted);
        }

        /* Main Body */
        .main-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }

        /* Sidebar Tree */
        .tree-item {
            display: flex;
            align-items: center;
            padding: 6px 8px;
            border-radius: 15px;
            cursor: pointer;
            user-select: none;
            color: var(--text);
            margin-bottom: 2px;
            gap: 6px;
        }
        .tree-item.active { background: var(--active-bg); color: var(--primary); font-weight: 600; }
        .tree-children { padding-left: 20px; display: none; }
        .tree-children.open { display: block; }
        .tree-icon { width: 14px; height: 14px; fill: currentColor; flex-shrink: 0; }
        .tree-chevron { width: 14px; height: 14px; opacity: 0.5; display: flex; align-items: center; justify-content: center; padding: 2px; border-radius: 3px; }
        .tree-chevron:hover { background: var(--element-bg); }
        .tree-chevron svg { width: 12px; height: 12px; transition: transform 0.15s; }
        .tree-chevron.open svg { transform: rotate(90deg); }
        .tree-chevron.hidden { visibility: hidden; }

        /* Grid */
        .grid-view {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
            gap: 8px;
        }
        .card {
            background: var(--element-bg);
            border-radius: 6px;
            padding: 6px 4px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            cursor: pointer;
            position: relative;
            aspect-ratio: 1 / 1;
        }
        .card .icon { width: 22px; height: 22px; margin-bottom: 2px; }
        .card .icon .thumbnail { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
        .card .name {
            font-size: 12px;
            font-weight: 500;
            color: var(--text);
            word-break: break-all;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.3;
        }
        .action-btn {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 22px;
            height: 22px;
            border-radius: 4px;
            background: var(--element-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid var(--border);
        }
        .action-btn img { width: 11px; height: 11px; filter: brightness(0) saturate(100%) invert(43%) sepia(85%) saturate(1636%) hue-rotate(193deg) brightness(98%) contrast(92%); }
        
        .copy-btn {
            position: absolute;
            top: 4px;
            left: 4px;
            width: 22px;
            height: 22px;
            border-radius: 4px;
            background: var(--element-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid var(--border);
            opacity: 0;
            transition: opacity 0.2s;
            cursor: pointer;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
        }
        .card:hover .copy-btn { opacity: 1; }
        .copy-btn svg { width: 11px; height: 11px; stroke: var(--text-muted); }
        .copy-btn:hover svg { stroke: var(--primary); }

        .empty {
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px 20px;
            color: var(--text-muted);
            border: 1px dashed var(--border);
            border-radius: 6px;
        }

        @media (max-width: 600px) {
            body { padding: 10px; gap: 10px; flex-direction: column; height: auto; overflow: auto; }
            .sidebar { width: 100%; height: auto; }
            .sidebar-content { display: none; }
            .sidebar-header { border-bottom: none; }
            .main-wrapper { min-height: 0; display: flex; flex-direction: column; gap: 10px; }
            .main-header { flex-direction: column; height: auto; padding: 12px; gap: 8px; align-items: flex-start; }
            .search-box { width: 100%; }
            .main-body { padding: 12px; overflow: visible; }
            .grid-view { grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 8px; }
            .card { padding: 6px 4px; }
            .copy-btn { opacity: 1; }
        }
    </style>
</head>
<body>
    <aside class="sidebar island">
        <div class="sidebar-header">
            <h1>Surge 规则库</h1>
            <div class="meta">最后构建: ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}<br>由 <a href="https://github.com/xOS/Config" target="_blank">xOS</a> 提供</div>
        </div>
        <div class="sidebar-content" id="sidebar-tree"></div>
    </aside>

    <div class="main-wrapper">
        <header class="main-header island">
            <div class="breadcrumbs" id="breadcrumbs"></div>
            <div class="search-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" id="search" placeholder="全局搜索..." autocomplete="off"/>
            </div>
        </header>
        <main class="main-body island">
            <div class="grid-view" id="grid-view"></div>
        </main>
    </div>

    <ul id="raw-tree" style="display: none;">
        ${tree}
    </ul>

    <script>
        const FOLDER_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6.5C3 5.11929 4.11929 4 5.5 4H9.87868C10.5417 4 11.1776 4.26339 11.6464 4.73223L13 6.08579H18.5C19.8807 6.08579 21 7.20507 21 8.58579V17.5C21 18.8807 19.8807 20 18.5 20H5.5C4.11929 20 3 18.8807 3 17.5V6.5Z" fill="#FDBA74"/><path d="M2.5 10.5C2.5 9.11929 3.61929 8 5 8H19C20.3807 8 21.5 9.11929 21.5 10.5V17.5C21.5 18.8807 20.3807 20 19 20H5C3.61929 20 2.5 18.8807 2.5 17.5V10.5Z" fill="#F97316"/></svg>';
        const FILE_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8.82843C20 8.29799 19.7893 7.78929 19.4142 7.41421L14.5858 2.58579C14.2107 2.21071 13.702 2 13.1716 2H6Z" fill="#818CF8"/><path d="M14 2V6C14 7.10457 14.8954 8 16 8H20L14 2Z" fill="#A5B4FC"/><path d="M8 13H16" stroke="#C7D2FE" stroke-width="2" stroke-linecap="round"/><path d="M8 17H13" stroke="#C7D2FE" stroke-width="2" stroke-linecap="round"/></svg>';
        const CHEVRON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        const HOME_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
        const COPY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

        document.addEventListener("DOMContentLoaded", () => {
            const rawTree = document.getElementById('raw-tree');
            const treeData = parseNode(rawTree);
            let currentPath = [];
            let currentFolder = treeData;

            function parseNode(ul) {
                if (!ul) return [];
                const items = [];
                for (let li of ul.children) {
                    if (li.classList.contains('folder')) {
                        const name = li.childNodes[0].textContent.trim();
                        const childUl = li.querySelector('ul');
                        items.push({ type: 'folder', name, children: parseNode(childUl), isOpen: false });
                    } else {
                        const fileLink = li.querySelector('a.file');
                        if (!fileLink) continue;
                        const name = fileLink.textContent.trim();
                        const url = fileLink.getAttribute('href');
                        let surgeUrl = null;
                        const surgeLink = li.querySelector('a:not(.file)');
                        if (surgeLink) {
                            surgeUrl = surgeLink.getAttribute('href');
                        }
                        items.push({ type: 'file', name, url, surgeUrl });
                    }
                }
                items.sort((a, b) => {
                    if (a.type === 'folder' && b.type === 'file') return -1;
                    if (a.type === 'file' && b.type === 'folder') return 1;
                    return a.name.localeCompare(b.name);
                });
                return items;
            }

            function renderSidebar(items, container, path = []) {
                items.forEach(item => {
                    if (item.type !== 'folder') return;

                    const hasChildFolders = item.children.some(c => c.type === 'folder');

                    const row = document.createElement('div');
                    row.className = 'tree-item';
                    row.innerHTML = \`
                        <div class="tree-chevron \${hasChildFolders ? '' : 'hidden'}">\${CHEVRON_SVG}</div>
                        <div class="tree-icon">\${FOLDER_SVG}</div>
                        <div>\${item.name}</div>
                    \`;

                    const childrenContainer = document.createElement('div');
                    childrenContainer.className = 'tree-children';
                    if (hasChildFolders) {
                        renderSidebar(item.children, childrenContainer, [...path, item]);
                    }

                    const inPath = currentPath.some((p, i) => p.name === item.name && i === path.length);
                    if (inPath) item.isOpen = true;

                    if (item.isOpen && hasChildFolders) {
                        row.querySelector('.tree-chevron').classList.add('open');
                        childrenContainer.classList.add('open');
                    }

                    const chevron = row.querySelector('.tree-chevron');
                    if (hasChildFolders && chevron) {
                        chevron.onclick = (e) => {
                            e.stopPropagation();
                            item.isOpen = !item.isOpen;
                            chevron.classList.toggle('open', item.isOpen);
                            childrenContainer.classList.toggle('open', item.isOpen);
                        };
                    }

                    row.onclick = (e) => {
                        e.stopPropagation();
                        const newPath = [...path, item];
                        navigateTo('/' + newPath.map(p => encodeURIComponent(p.name)).join('/'));
                    };

                    const isActive = currentPath.length > 0 && currentPath[currentPath.length - 1].name === item.name && currentPath.length === path.length + 1;
                    if (isActive) {
                        row.classList.add('active');
                    }

                    container.appendChild(row);
                    if (hasChildFolders) {
                        container.appendChild(childrenContainer);
                    }
                });
            }

            function renderGrid(items, isSearchResult = false) {
                const grid = document.getElementById('grid-view');
                grid.innerHTML = '';

                if (items.length === 0) {
                    grid.innerHTML = '<div class="empty">这个目录下什么都没有哦</div>';
                    return;
                }

                items.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'card';

                    if (item.type === 'folder') {
                        card.innerHTML = \`
                            <div class="icon">\${FOLDER_SVG}</div>
                            <div class="name">\${item.name}</div>
                        \`;
                        card.onclick = () => {
                            if(isSearchResult) return;
                            const newPath = [...currentPath, item];
                            navigateTo('/' + newPath.map(p => encodeURIComponent(p.name)).join('/'));
                        };
                    } else {
                        const isImage = /\\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.name);
                        const iconHtml = isImage ? \`<img class="thumbnail" src="\${item.url}" loading="lazy" />\` : FILE_SVG;
                        card.innerHTML = \`
                            <div class="icon">\${iconHtml}</div>
                            <div class="name" title="\${item.name}">\${item.name}</div>
                            <div class="copy-btn" title="复制链接" data-url="\${item.url}">\${COPY_SVG}</div>
                            \${item.surgeUrl ? \`<div class="action-btn" title="一键导入 Surge" data-url="\${item.surgeUrl}"><img src="/static/surge-transparent.png"></div>\` : ''}
                        \`;
                        card.onclick = (e) => {
                            const actionBtn = e.target.closest('.action-btn');
                            const copyBtn = e.target.closest('.copy-btn');
                            if (actionBtn) {
                                e.stopPropagation();
                                window.open(actionBtn.getAttribute('data-url'), '_blank');
                            } else if (copyBtn) {
                                e.stopPropagation();
                                const fullUrl = new URL(item.url, location.origin).href;
                                navigator.clipboard.writeText(fullUrl).then(() => {
                                    copyBtn.innerHTML = CHECK_SVG;
                                    setTimeout(() => {
                                        copyBtn.innerHTML = COPY_SVG;
                                    }, 2000);
                                });
                            } else {
                                window.open(item.url, '_blank');
                            }
                        };
                    }
                    grid.appendChild(card);
                });
            }

            function renderBreadcrumbs() {
                const bc = document.getElementById('breadcrumbs');
                bc.innerHTML = '';

                const home = document.createElement('div');
                home.className = 'crumb';
                home.innerHTML = HOME_SVG + '&nbsp;首页';
                home.onclick = () => {
                    navigateTo('/');
                };
                if (currentPath.length === 0) home.classList.add('active');
                bc.appendChild(home);

                currentPath.forEach((folder, index) => {
                    const sep = document.createElement('span');
                    sep.className = 'sep';
                    sep.innerText = '/';
                    bc.appendChild(sep);

                    const crumb = document.createElement('div');
                    crumb.className = 'crumb';
                    crumb.innerText = folder.name;
                    if (index === currentPath.length - 1) {
                        crumb.classList.add('active');
                    } else {
                        crumb.onclick = () => {
                            const newPath = currentPath.slice(0, index + 1);
                            navigateTo('/' + newPath.map(p => encodeURIComponent(p.name)).join('/'));
                        };
                    }
                    bc.appendChild(crumb);
                });
            }

            function renderApp() {
                renderBreadcrumbs();
                renderGrid(currentFolder);
                const sidebarContainer = document.getElementById('sidebar-tree');
                sidebarContainer.innerHTML = '';
                renderSidebar(treeData, sidebarContainer);
            }

            function resolvePathFromUrl() {
                var p = decodeURIComponent(location.pathname);
                while (p.charAt(0) === '/') p = p.substring(1);
                while (p.charAt(p.length - 1) === '/') p = p.substring(0, p.length - 1);
                const pathStr = p;
                if (!pathStr) {
                    currentPath = [];
                    currentFolder = treeData;
                    return;
                }
                const parts = pathStr.split('/').filter(p => p);
                let current = treeData;
                let pathArr = [];
                for (const part of parts) {
                    const folder = current.find(c => c.name === part && c.type === 'folder');
                    if (folder) {
                        folder.isOpen = true;
                        pathArr.push(folder);
                        current = folder.children;
                    } else {
                        break;
                    }
                }
                currentPath = pathArr;
                currentFolder = current;
            }

            function navigateTo(path) {
                history.pushState(null, '', path);
                const searchInput = document.getElementById('search');
                if (searchInput.value) {
                    searchInput.value = '';
                }
                resolvePathFromUrl();
                renderApp();
            }

            window.addEventListener('popstate', () => {
                const searchInput = document.getElementById('search');
                if (searchInput.value) {
                    searchInput.value = '';
                }
                resolvePathFromUrl();
                renderApp();
            });

            resolvePathFromUrl();
            renderApp();

            function getAllItems(items, path = '') {
                let result = [];
                items.forEach(item => {
                    const fullPath = path ? \`\${path}/\${item.name}\` : item.name;
                    if (item.type === 'folder') {
                        result = result.concat(getAllItems(item.children, fullPath));
                    } else {
                        result.push({ ...item, displayName: fullPath });
                    }
                });
                return result;
            }
            const allItems = getAllItems(treeData);

            document.getElementById('search').addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                if (term === '') {
                    renderApp();
                } else {
                    const matches = allItems.filter(item => item.name.toLowerCase().includes(term) || item.displayName.toLowerCase().includes(term));
                    const bc = document.getElementById('breadcrumbs');
                    bc.innerHTML = \`<div class="crumb active">搜索结果: "\${term}"</div>\`;

                    const searchResults = matches.map(m => ({
                        ...m,
                        name: m.displayName
                    }));
                    renderGrid(searchResults, true);

                    document.querySelectorAll('.tree-item.active').forEach(el => el.classList.remove('active'));
                }
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
    <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
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

    // SPA fallback: _worker.js intercepts 404 and serves index.html with 200
    const workerContent = `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;
    const url = new URL(request.url);
    const ext = url.pathname.split('.').pop();
    const fileExts = ['list','txt','js','json','gif','md','png','jpg','html','mov','mp4','mobileconfig','conf','dconf','mmdb','dat','sgmodule','svg','css','ico','webp'];
    if (fileExts.includes(ext)) return response;
    const indexResponse = await env.ASSETS.fetch(new URL('/', request.url));
    return new Response(indexResponse.body, {
      status: 200,
      headers: indexResponse.headers
    });
  }
};`;
    const workerFilePath = path.join(OUTPUT_DIR, "_worker.js");
    await fs.writeFile(workerFilePath, workerContent, "utf8");
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

    // 将 index.html 复制为 404.html，实现 SPA 路由回退
    // Cloudflare Pages 在路径匹配到真实目录但无 index.html 时会返回 404.html
    const indexHtmlPath = path.join(OUTPUT_DIR, "index.html");
    const notFoundFilePath = path.join(OUTPUT_DIR, "404.html");
    await fs.copyFile(indexHtmlPath, notFoundFilePath);
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
