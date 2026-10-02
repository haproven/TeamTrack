(() => {
    "use strict";

    const CONFIG = {
        jsonPath: "/assets/json/page-sidebar.json",
        navSelector: "#page-laptop-sidebar",
        cacheKey: "page_sidebar_cache_v2",
        cacheTime: 5 * 60 * 1000
    };

    const nav = document.querySelector(CONFIG.navSelector);
    if (!nav) return;

    function normalizePath(path) {
        if (!path) return "/";
        let cleanPath = path.split("?")[0].split("#")[0];
        cleanPath = cleanPath.replace(/\/+/g, "/");

        if (cleanPath.length > 1) {
            cleanPath = cleanPath.replace(/\/+$/, "");
        }

        return cleanPath || "/";
    }

    function getCurrentPath() {
        return normalizePath(window.location.pathname);
    }

    // Default links + current page links
    function getPageNavigation(data) {
        const currentPath = getCurrentPath();
        const pages = data.pages || {};

        const matchedKey = Object.keys(pages).find(
            path => normalizePath(path) === currentPath
        );

        const defaultNavigation =
            data.default && Array.isArray(data.default.navigation)
                ? data.default.navigation
                : [];

        const pageNavigation =
            matchedKey && Array.isArray(pages[matchedKey].navigation)
                ? pages[matchedKey].navigation
                : [];

        return [...defaultNavigation, ...pageNavigation];
    }

    function createIcon(className) {
        const icon = document.createElement("i");

        if (className) {
            icon.className = className;
            icon.setAttribute("aria-hidden", "true");
        }

        return icon;
    }

    function isCurrentLink(href) {
        if (!href || href === "#") return false;

        try {
            const target = new URL(href, window.location.href);
            const current = new URL(window.location.href);

            if (normalizePath(target.pathname) !== normalizePath(current.pathname)) {
                return false;
            }

            if (target.hash) {
                return target.hash === current.hash;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    function createLink(item) {
        const link = document.createElement("a");
        link.href = item.href || "#";

        if (item.icon) {
            link.appendChild(createIcon(item.icon));
        }

        const title = document.createElement("span");
        title.textContent = item.title || "Untitled";
        link.appendChild(title);

        if (item.disabled === true) {
            link.removeAttribute("href");
            link.setAttribute("aria-disabled", "true");
            link.classList.add("page-link-disabled");
        }

        if (item.disabled !== true && isCurrentLink(item.href)) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }

        return link;
    }

    function createNavigationItem(item) {
        const li = document.createElement("li");
        li.className = "page-nav-item";

        const children = Array.isArray(item.children)
            ? item.children
            : [];

        if (children.length) {
            li.classList.add("page-has-submenu");

            const parentLink = createLink(item);
            li.appendChild(parentLink);

            const submenu = document.createElement("ul");
            submenu.className = "page-submenu";

            let childIsActive = false;

            children.forEach(child => {
                const childItem = createNavigationItem(child);

                if (childItem.classList.contains("page-item-active")) {
                    childIsActive = true;
                }

                submenu.appendChild(childItem);
            });

            if (childIsActive || parentLink.classList.contains("active")) {
                li.classList.add("page-item-active");
            }

            li.appendChild(submenu);
        } else {
            const link = createLink(item);
            li.appendChild(link);

            if (link.classList.contains("active")) {
                li.classList.add("page-item-active");
            }
        }

        return li;
    }

    function renderNavigation(items) {
        const fragment = document.createDocumentFragment();

        if (!items.length) {
            showError("No navigation configured for this page.");
            return;
        }

        items.forEach(item => {
            fragment.appendChild(createNavigationItem(item));
        });

        nav.replaceChildren(fragment);
    }

    function showLoading() {
        const li = document.createElement("li");
        li.className = "page-sidebar-loading";
        li.appendChild(createIcon("fas fa-spinner fa-spin"));

        const text = document.createElement("span");
        text.textContent = " Loading...";
        li.appendChild(text);

        nav.replaceChildren(li);
    }

    function showError(message) {
        const li = document.createElement("li");
        li.className = "page-sidebar-error";
        li.textContent = message || "Navigation could not be loaded.";
        nav.replaceChildren(li);
    }

    function readCache() {
        try {
            const cached = JSON.parse(
                localStorage.getItem(CONFIG.cacheKey)
            );

            if (
                cached &&
                cached.data &&
                typeof cached.timestamp === "number"
            ) {
                return cached;
            }
        } catch (error) {
            console.warn("Sidebar cache error:", error);
        }

        return null;
    }

    function saveCache(data) {
        try {
            localStorage.setItem(
                CONFIG.cacheKey,
                JSON.stringify({
                    data,
                    timestamp: Date.now()
                })
            );
        } catch (error) {
            console.warn("Sidebar cache could not be saved:", error);
        }
    }

    async function loadNavigation() {
        const cached = readCache();

        if (cached) {
            renderNavigation(getPageNavigation(cached.data));
        } else {
            showLoading();
        }

        if (
            cached &&
            Date.now() - cached.timestamp < CONFIG.cacheTime
        ) {
            return;
        }

        try {
            const response = await fetch(CONFIG.jsonPath, {
                cache: "no-cache"
            });

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            const data = await response.json();

            if (!data || typeof data !== "object") {
                throw new Error("Invalid sidebar JSON format");
            }

            renderNavigation(getPageNavigation(data));
            saveCache(data);

        } catch (error) {
            console.error("Sidebar loading error:", error);

            if (!cached) {
                showError();
            }
        }
    }

    loadNavigation();
})();