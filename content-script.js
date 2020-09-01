const className = "hide-sidebar";
const hideSidebarButtonNameClassName = "hide-sidebar-item";
const alwaysBlurClassName = "always-blur";
// Don't hide the sidebar immediately on blur if the user goes away and comes
// back quickly.
const hideDelayMs = 1000 * 60 * 15;
let delayTimeout;
let windowFocused;
let channelSidebarMutationObserver;

const toggleButton = document.createElement("button");
toggleButton.classList.add("hide-sidebar-toggle-button");
toggleButton.addEventListener("click", toggleSidebar);

let isFocusMode = true;

function show(shouldShow) {
  isFocusMode = !shouldShow;

  toggleButton.textContent = shouldShow ? "Let me focus" : "Distract me";
  const classList = document.documentElement.classList;
  if (shouldShow) {
    classList.remove(className);
  } else {
    classList.add(className);
  }
}
show(false);

function hideAfterDelayIfStillVisible() {
  if (delayTimeout) {
    clearTimeout(delayTimeout);
  }
  delayTimeout = setTimeout(() => {
    if (!windowFocused || document.visibilityState !== "visible") {
      show(false);
    }
  }, hideDelayMs);
}

function toggleSidebar() {
  const shouldShow = document.documentElement.classList.contains(className);
  show(shouldShow);
}

function channelSidebarList() {
  return document.querySelector(
    ".p-channel_sidebar__list .c-virtual_list__scroll_container"
  );
}

function debadgeFavicon() {
  favicon().href =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABNVBMVEVKFEz///9NGE+EX4VLFU3w7PD9/f1SH1Tb0Nv59/n18/W4orhZKFt2TnhwRXF2TXdpPGqghKFMFk7FtMZTIFVhMmNxR3PHt8hfL2F6U3xpPWt/WYD+/v5nOWhWI1edgJ7z8POBW4LIuMhySHS6pruHZIl/WoGJZopuQ3CObI/Vydba0NtsQW7ArcHw6/DEs8VYJlqojqnx7fH8/PyfgqDGtcbg1+Du6e7e1N5kN2Z8VX2fg6BbKlxOGVBxRnJ4T3ljNWV6UnuDXoSLaIyih6NMF07az9qWd5f8+/zUx9Ts5+zj2+Pv6u/t5+13Tni1n7WYeZlTH1XYzdn49vjLu8uIZYm5pLpmOGipkKqMaY2UdJXr5euZe5prP2xsQG2JZovTxtSnjahOGlDSxdOQcJKHY4hXJVnkajHYAAABJUlEQVR4Xr3PNXbFMBCF4Tvmx8wYZmZmZmaG/S8hHke2UuikfF9xp9DfCC3V4YQzUeB01umDStYkogKS5EpCIUGukLHOZwMKRYsLrYv3EyqTljqQcm26DmWQXen2HNsIgrNEUf7PJGGm1w/yJlkLEBwK9PvBgLtWTgRhGQxD53OHCT5rIpiSwRCe+QyCt1kXQbQQIk9oZBQYGz9sAETV6RgChuaBpGlpSHPzlcoilpZLqwDikXZPZtOG0CCXvrXt7g7iu+TbM0Sw7wUx3gNESCqL4IiDfA9vGCck1USQIqLztAjKF+S7hO/qOmVDBLi57fRE7jX8FQRqMugienj8P3A9QeGLg+bveYFCjYNXxPiUoPJWJTOOd4foQ4OSHeUH47uO1voBEO4eo1Zt+vMAAAAASUVORK5CYII=";
}

function isChannelSidebarSection(element) {
  return element.getAttribute("aria-level") === "1";
}

function channelName(section) {
  return section.querySelector(".p-channel_sidebar__name");
}

window.addEventListener("visibilitychange", hideAfterDelayIfStillVisible);
window.addEventListener("blur", () => {
  windowFocused = false;
  hideAfterDelayIfStillVisible();
});
window.addEventListener("focus", () => (windowFocused = true));

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function observe(getObserved, callback, opt_onInit) {
  while (!getObserved()) {
    await timeout(1000);
  }
  const observer = new MutationObserver(callback);
  observeParent(observer, getObserved());
  if (opt_onInit) {
    opt_onInit();
  }
  return observer;
}

function observeParent(observer, item) {
  observer.observe(item.parentNode, {
    childList: true,
    subtree: true,
    attributes: true,
  });
}

function containsSelector(element, selector) {
  return !!element.querySelector(selector);
}

function labelElement(section) {
  return section.querySelector(
    ".p-channel_sidebar__section_heading_label_overflow"
  );
}

function isRead(item) {
  return (
    !item.querySelector(".p-channel_sidebar__link--unread") &&
    !item.querySelector(".p-channel_sidebar__channel--unread") &&
    !item.querySelector(".p-channel_sidebar__section_heading--unreads")
  );
}

function hasSectionName(section, name) {
  const sectionLabel = labelElement(section);
  return sectionLabel && sectionLabel.textContent === name;
}

function setVisibility(element, shouldShow) {
  if (isFocusMode) {
    element.classList.remove(alwaysBlurClassName);
  } else {
    element.classList.add(alwaysBlurClassName);
  }

  if (shouldShow) {
    element.classList.remove(hideSidebarButtonNameClassName);
  } else {
    element.classList.add(hideSidebarButtonNameClassName);
  }
}

function updateEmptySectionDisplay() {
  // Disconnect since this functin will modify the subtree when changing visibility.
  channelSidebarMutationObserver.disconnect();
  const sidebarItems = channelSidebarList().children;
  for (let item of sidebarItems) {
    item.classList.add(hideSidebarButtonNameClassName);
    let shouldHide = hasSectionName(item, "Hidden") || isRead(item);
    if (shouldHide) {
      item.classList.add(alwaysBlurClassName);
    } else {
      item.classList.remove(alwaysBlurClassName);
    }
  }
  // Reconnect to observe future changes.
  observeParent(channelSidebarMutationObserver, channelSidebarList());
}

async function observeChannelSidebarListChanges() {
  channelSidebarMutationObserver = await observe(
    channelSidebarList,
    (mutations) => {
      updateEmptySectionDisplay();
    }
  );
  updateEmptySectionDisplay();
}

function favicon() {
  return document.querySelector('link[rel*="icon"]');
}

function isFavicon(node) {
  return node.tagName === "LINK" && node.getAttribute("rel").includes("icon");
}

async function observeFaviconChanges() {
  await observe(favicon, (mutations) => {
    if (mutations.some((x) => [...x.removedNodes].some((y) => isFavicon(y)))) {
      debadgeFavicon();
    }
  });
  debadgeFavicon();
}

let savedViewHeaderTitle;
let threadsViewObserver;

function getThreadsView() {
  return document.querySelector("#threads_view");
}

function getViewHeaderTitle() {
  return document.querySelector(".p-ia__view_header");
}

const hideThisAndFollowingClassName = "hide-thread-item";
function showSidebarItem(item, shouldShow) {
  if (shouldShow) {
    item.classList.remove(hideThisAndFollowingClassName);
  } else {
    item.classList.add(hideThisAndFollowingClassName);
  }
}

function updateThreadsViewItemDisplay() {
  const threads = getThreadsView().querySelectorAll(
    ".c-virtual_list__scroll_container > .c-virtual_list__item"
  );
  let mostRecentRoot;
  let lastRootWithNewItems;
  let isHiding = false;
  for (let thread of threads) {
    if (isHiding) {
      showSidebarItem(thread, false);
      continue;
    }

    showSidebarItem(thread, true);

    if (thread.id.startsWith("threads_view_root-")) {
      mostRecentRoot = thread;
      continue;
    }

    if (thread.id.startsWith("threads_view_footer-")) {
      if (lastRootWithNewItems !== mostRecentRoot) {
        isHiding = true;
        showSidebarItem(mostRecentRoot, false);
        const previous = mostRecentRoot.previousSibling;
        // If the mostRecentRoot is the first one in this heading, hide the
        // heading as well. Null check becuase virtualization can cause the
        // first root to not have a previous sibling.
        if (previous && previous.id.startsWith("threads_view_heading-")) {
          showSidebarItem(previous, false);
        }
      }
      mostRecentRoot = null;
      continue;
    }

    if (mostRecentRoot && thread.id.startsWith("threads_view_divider-")) {
      lastRootWithNewItems = mostRecentRoot;
    }
  }

  if (!lastRootWithNewItems) {
    threads.forEach((x) => showSidebarItem(x, false));
  }
}

let threadsViewChangeDebounceId;
function handleThreadsViewChanges() {
  if (threadsViewChangeDebounceId) {
    clearTimeout(threadsViewChangeDebounceId);
  }
  threadsViewChangeDebounceId = setTimeout(updateThreadsViewItemDisplay, 100);
}

async function handleNewViewHeaderTitle(title) {
  savedViewHeaderTitle = title;

  if (title === "Threads") {
    threadsViewObserver = new MutationObserver(handleThreadsViewChanges);
    threadsViewObserver.observe(getThreadsView(), {
      childList: true,
      subtree: true,
    });
    handleThreadsViewChanges();
  } else if (threadsViewObserver) {
    threadsViewObserver.disconnect();
    threadsViewObserver = null;
  }
}

async function observeViewHeaderTitleChanges() {
  await observe(getViewHeaderTitle, () => {
    const newTitle = getViewHeaderTitle().textContent;
    if (newTitle !== savedViewHeaderTitle) {
      handleNewViewHeaderTitle(newTitle);
    }
  });
  handleNewViewHeaderTitle(getViewHeaderTitle().textContent);
}

function getTopNavSidebar() {
  return document.querySelector(".p-top_nav__sidebar");
}

window.addEventListener("load", async () => {
  observeFaviconChanges();
  observeChannelSidebarListChanges();
  observeViewHeaderTitleChanges();
  while (!getTopNavSidebar()) {
    await timeout(1000);
  }
  getTopNavSidebar().before(toggleButton);
});
