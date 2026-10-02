
(() => {
    "use strict";

    /* =========================================
       TEAMTRACK DYNAMIC SIDEBAR
       Fast Cache + Fresh JSON + Auto Update
    ========================================= */

    const CONFIG = {
        jsonPath: "/assets/json/page-sidebar.json",
        navSelector: "#page-laptop-sidebar",
        cacheKey: "page_sidebar_cache_v3",
        fetchTimeout: 10000
    };

    const nav = document.querySelector(CONFIG.navSelector);
    if (!nav) return;

    let isLoading = false;
    let lastRenderedData = "";

    /* =========================================
       PATH HELPERS
    ========================================= */

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

    /* =========================================
       GET DEFAULT + CURRENT PAGE NAVIGATION
    ========================================= */

    function getPageNavigation(data) {
        const currentPath = getCurrentPath();
        const pages = data.pages || {};

        const matchedKey = Object.keys(pages).find(
            path => normalizePath(path) === currentPath
        );

        const defaultNavigation =
            Array.isArray(data.default?.navigation)
                ? data.default.navigation
                : [];

        const pageNavigation =
            matchedKey &&
            Array.isArray(pages[matchedKey]?.navigation)
                ? pages[matchedKey].navigation
                : [];

        return [...defaultNavigation, ...pageNavigation];
    }

    /* =========================================
       ICON
    ========================================= */

    function createIcon(className) {
        const icon = document.createElement("i");

        if (className) {
            icon.className = className;
            icon.setAttribute("aria-hidden", "true");
        }

        return icon;
    }

    /* =========================================
       ACTIVE LINK CHECK
    ========================================= */

    function isCurrentLink(href) {
        if (!href || href === "#") return false;

        try {
            const target = new URL(href, window.location.href);
            const current = new URL(window.location.href);

            if (
                normalizePath(target.pathname) !==
                normalizePath(current.pathname)
            ) {
                return false;
            }

            if (target.hash) {
                return target.hash === current.hash;
            }

            return !current.hash;
        } catch (error) {
            return false;
        }
    }

    /* =========================================
       CREATE LINK
    ========================================= */

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

    /* =========================================
       CREATE NAVIGATION ITEM
    ========================================= */

    function createNavigationItem(item) {
        const li = document.createElement("li");
        li.className = "page-nav-item";

        const children = Array.isArray(item.children)
            ? item.children
            : [];

        if (children.length > 0) {
            li.classList.add("page-has-submenu");

            const parentLink = createLink(item);
            li.appendChild(parentLink);

            const submenu = document.createElement("ul");
            submenu.className = "page-submenu";

            let childIsActive = false;

            children.forEach(child => {
                const childItem = createNavigationItem(child);

                if (
                    childItem.classList.contains("page-item-active")
                ) {
                    childIsActive = true;
                }

                submenu.appendChild(childItem);
            });

            if (
                childIsActive ||
                parentLink.classList.contains("active")
            ) {
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

    /* =========================================
       RENDER NAVIGATION
    ========================================= */

    function renderNavigation(items, force = false) {
        if (!Array.isArray(items) || items.length === 0) {
            showError("No navigation configured for this page.");
            return;
        }

        const dataKey = JSON.stringify(items);

        // Avoid unnecessary DOM replacement.
        if (!force && dataKey === lastRenderedData) {
            return;
        }

        const fragment = document.createDocumentFragment();

        items.forEach(item => {
            if (item && typeof item === "object") {
                fragment.appendChild(createNavigationItem(item));
            }
        });

        nav.replaceChildren(fragment);
        lastRenderedData = dataKey;
    }

    /* =========================================
       LOADING STATE
    ========================================= */

    function showLoading() {
        const li = document.createElement("li");
        li.className = "page-sidebar-loading";

        li.appendChild(createIcon("fas fa-spinner fa-spin"));

        const text = document.createElement("span");
        text.textContent = " Loading...";
        li.appendChild(text);

        nav.replaceChildren(li);
    }

    /* =========================================
       ERROR STATE
    ========================================= */

    function showError(message) {
        const li = document.createElement("li");
        li.className = "page-sidebar-error";
        li.textContent = message || "Navigation could not be loaded.";

        nav.replaceChildren(li);
    }

    /* =========================================
       CACHE
    ========================================= */

    function readCache() {
        try {
            const raw = localStorage.getItem(CONFIG.cacheKey);
            if (!raw) return null;

            const cached = JSON.parse(raw);

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
                    data: data,
                    timestamp: Date.now()
                })
            );
        } catch (error) {
            console.warn("Sidebar cache could not be saved:", error);
        }
    }

    /* =========================================
       FETCH LATEST JSON
    ========================================= */

    async function fetchSidebarJSON() {
        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            CONFIG.fetchTimeout
        );

        try {
            const separator = CONFIG.jsonPath.includes("?")
                ? "&"
                : "?";

            const response = await fetch(
                CONFIG.jsonPath + separator + "_=" + Date.now(),
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        "Accept": "application/json"
                    },
                    signal: controller.signal
                }
            );

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            const data = await response.json();

            if (
                !data ||
                typeof data !== "object" ||
                Array.isArray(data) ||
                !data.pages ||
                typeof data.pages !== "object"
            ) {
                throw new Error("Invalid sidebar JSON format");
            }

            return data;
        } finally {
            clearTimeout(timeout);
        }
    }

    /* =========================================
       LOAD NAVIGATION
    ========================================= */

    async function loadNavigation() {
        if (isLoading) return;
        isLoading = true;

        const cached = readCache();

        // Render cache immediately for faster first display.
        if (cached?.data) {
            renderNavigation(
                getPageNavigation(cached.data),
                true
            );
        } else {
            showLoading();
        }

        try {
            const data = await fetchSidebarJSON();
            const freshNavigation = getPageNavigation(data);

            // Save fresh JSON to cache.
            saveCache(data);

            // Render only if navigation has changed.
            renderNavigation(freshNavigation);
        } catch (error) {
            console.error("Sidebar loading error:", error);

            // Preserve cached links when network request fails.
            if (!cached?.data) {
                showError(
                    error.name === "AbortError"
                        ? "Navigation request timed out."
                        : "Navigation could not be loaded."
                );
            }
        } finally {
            isLoading = false;
        }
    }

    /* =========================================
       UPDATE ACTIVE LINK ON HASH CHANGE
    ========================================= */

    window.addEventListener("hashchange", () => {
        const cached = readCache();

        if (cached?.data) {
            renderNavigation(
                getPageNavigation(cached.data),
                true
            );
        }
    });

    /* =========================================
       INITIAL LOAD
    ========================================= */

    loadNavigation();

})();