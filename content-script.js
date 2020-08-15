const className = "hide-sidebar";

function show(shouldShow) {
  const classList = document.documentElement.classList;
  if (shouldShow) {
    classList.remove(className);
  } else {
    classList.add(className);
  }
}

function toggle() {
  show(document.documentElement.classList.contains(className));
}

function favicon() {
  return document.querySelector('link[rel*="icon"]');
}

function debadgeFavicon() {
  favicon().href =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABNVBMVEVKFEz///9NGE+EX4VLFU3w7PD9/f1SH1Tb0Nv59/n18/W4orhZKFt2TnhwRXF2TXdpPGqghKFMFk7FtMZTIFVhMmNxR3PHt8hfL2F6U3xpPWt/WYD+/v5nOWhWI1edgJ7z8POBW4LIuMhySHS6pruHZIl/WoGJZopuQ3CObI/Vydba0NtsQW7ArcHw6/DEs8VYJlqojqnx7fH8/PyfgqDGtcbg1+Du6e7e1N5kN2Z8VX2fg6BbKlxOGVBxRnJ4T3ljNWV6UnuDXoSLaIyih6NMF07az9qWd5f8+/zUx9Ts5+zj2+Pv6u/t5+13Tni1n7WYeZlTH1XYzdn49vjLu8uIZYm5pLpmOGipkKqMaY2UdJXr5euZe5prP2xsQG2JZovTxtSnjahOGlDSxdOQcJKHY4hXJVnkajHYAAABJUlEQVR4Xr3PNXbFMBCF4Tvmx8wYZmZmZmaG/S8hHke2UuikfF9xp9DfCC3V4YQzUeB01umDStYkogKS5EpCIUGukLHOZwMKRYsLrYv3EyqTljqQcm26DmWQXen2HNsIgrNEUf7PJGGm1w/yJlkLEBwK9PvBgLtWTgRhGQxD53OHCT5rIpiSwRCe+QyCt1kXQbQQIk9oZBQYGz9sAETV6RgChuaBpGlpSHPzlcoilpZLqwDikXZPZtOG0CCXvrXt7g7iu+TbM0Sw7wUx3gNESCqL4IiDfA9vGCck1USQIqLztAjKF+S7hO/qOmVDBLi57fRE7jX8FQRqMugienj8P3A9QeGLg+bveYFCjYNXxPiUoPJWJTOOd4foQ4OSHeUH47uO1voBEO4eo1Zt+vMAAAAASUVORK5CYII=";
}

function isFavicon(node) {
  return node.tagName === "LINK" && node.getAttribute("rel").includes("icon");
}

window.addEventListener("visibilitychange", () => show(false));
window.addEventListener("blur", () => show(false));

window.addEventListener("load", () => {
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((x) => [...x.removedNodes].some((y) => isFavicon(y)))) {
      debadgeFavicon();
    }
  });
  observer.observe(favicon().parentNode, { childList: true });
  debadgeFavicon();

  let toggleButton = document.createElement("button");
  toggleButton.classList.add("hide-sidebar-toggle-button");
  toggleButton.textContent = "Toggle sidebar";
  toggleButton.addEventListener("click", toggle);
  document.querySelector(".p-top_nav__sidebar").before(toggleButton);
});
