const className = "hide-sidebar";
// Don't hide the sidebar immediately on blur if the user goes away and comes
// back quickly.
const hideDelayMs = 1000 * 60 * 15;
let delayTimeout;
let windowFocused;
let showEmptySections = false;

function show(shouldShow) {
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
  show(document.documentElement.classList.contains(className));
}

function toggleShowEmptySections() {
  showEmptySections = !showEmptySections;
  updateEmptySectionDisplay();
}

function favicon() {
  return document.querySelector('link[rel*="icon"]');
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

function isFavicon(node) {
  return node.tagName === "LINK" && node.getAttribute("rel").includes("icon");
}

function isChannelSidebarSection(element) {
  return element.id.startsWith("sectionHeading-");
}

window.addEventListener("visibilitychange", hideAfterDelayIfStillVisible);
window.addEventListener("blur", () => {
  windowFocused = false;
  hideAfterDelayIfStillVisible();
});
window.addEventListener("focus", () => (windowFocused = true));

function observe(getObserved, callback) {
  if (!getObserved()) {
    setTimeout(() => observe(getObserved, callback), 1000);
    return;
  }
  const observer = new MutationObserver(callback);
  observer.observe(getObserved().parentNode, {
    childList: true,
    subtree: true,
  });
}

function containsSelector(element, selector) {
  return !!element.querySelector(selector);
}

function hasPlusButton(section) {
  return containsSelector(section, ".p-channel_sidebar__section_heading_plus");
}

function labelElement(section) {
  return section.querySelector(
    ".p-channel_sidebar__section_heading_label_overflow"
  );
}

function hasSectionName(section, name) {
  const sectionLabel = labelElement(section);
  return sectionLabel && sectionLabel.textContent === name;
}

function updateEmptySectionDisplay() {
  const sidebarItems = channelSidebarList().children;
  for (let i = 0; i < sidebarItems.length; i++) {
    const item = sidebarItems[i];
    if (!isChannelSidebarSection(item)) {
      continue;
    }
    // The next sibling after a section with no unreads is area metadata, and
    // the one after that is either a channel or a section. If it's a section
    // then this section is empty.
    let shouldHide;
    if (showEmptySections || hasPlusButton(item)) {
      shouldHide = false;
    } else if (hasSectionName(item, "Hidden")) {
      shouldHide = true;
    } else {
      shouldHide =
        i >= sidebarItems.length - 2 ||
        isChannelSidebarSection(sidebarItems[i + 2]);
    }
    const sectionLabel = labelElement(item);
    if (sectionLabel) {
      sectionLabel.style.visibility = shouldHide ? "hidden" : "";
    }
  }
}

function observeChanngelSidebarListChanges() {
  observe(channelSidebarList, (mutations) => updateEmptySectionDisplay());
  updateEmptySectionDisplay();
}

function observeFaviconChanges() {
  observe(favicon, (mutations) => {
    if (mutations.some((x) => [...x.removedNodes].some((y) => isFavicon(y)))) {
      debadgeFavicon();
    }
  });
  debadgeFavicon();
}

function createButton(text, callback) {
  let button = document.createElement("button");
  button.classList.add("hide-sidebar-toggle-button");
  button.textContent = text;
  button.addEventListener("click", callback);
  return button;
}

window.addEventListener("load", () => {
  observeFaviconChanges();
  observeChanngelSidebarListChanges();

  document
    .querySelector(".p-top_nav__sidebar")
    .before(
      createButton("Toggle sidebar", toggleSidebar),
      createButton("Toggle show empty sections", toggleShowEmptySections)
    );
});
