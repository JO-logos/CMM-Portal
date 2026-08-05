(function () {
  "use strict";

  function initializeMobileNavigation() {
    const sidebar = document.querySelector("[data-cmm-sidebar]");
    const menuButton = document.querySelector("[data-cmm-menu-button]");
    const closeButton = document.querySelector("[data-cmm-nav-close]");
    const backdrop = document.querySelector("[data-cmm-nav-dismiss]");
    const pageContent = document.querySelector("[data-cmm-page-content]");
    const desktopQuery = window.matchMedia("(min-width: 64rem)");

    if (!sidebar || !menuButton || !closeButton || !backdrop) return;

    function closeMenu(restoreFocus) {
      sidebar.classList.remove("cmm-sidebar--open");
      document.body.classList.remove("cmm-nav-open");
      menuButton.setAttribute("aria-expanded", "false");
      backdrop.hidden = true;
      if (pageContent) pageContent.inert = false;

      if (desktopQuery.matches) {
        sidebar.hidden = false;
        sidebar.inert = false;
        sidebar.removeAttribute("aria-hidden");
      } else {
        sidebar.hidden = true;
        sidebar.inert = true;
        sidebar.setAttribute("aria-hidden", "true");
      }

      if (restoreFocus) menuButton.focus();
    }

    function openMenu() {
      sidebar.hidden = false;
      sidebar.inert = false;
      sidebar.removeAttribute("aria-hidden");
      sidebar.classList.add("cmm-sidebar--open");
      document.body.classList.add("cmm-nav-open");
      menuButton.setAttribute("aria-expanded", "true");
      backdrop.hidden = false;
      if (pageContent) pageContent.inert = true;
      closeButton.focus();
    }

    menuButton.addEventListener("click", openMenu);
    closeButton.addEventListener("click", () => closeMenu(true));
    backdrop.addEventListener("click", () => closeMenu(true));
    sidebar.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu(false)));

    sidebar.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab" || desktopQuery.matches) return;
      const focusable = Array.from(sidebar.querySelectorAll("a[href], button:not([disabled])"));
      const first = focusable[0];
      const last = focusable.at(-1);

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    desktopQuery.addEventListener("change", () => closeMenu(false));
    closeMenu(false);
  }

  function initializeProfileMenu() {
    const button = document.querySelector("[data-cmm-profile-button]");
    const menu = document.querySelector("[data-cmm-profile-menu]");
    if (!button || !menu) return;

    function closeProfileMenu() {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
    }

    button.addEventListener("click", () => {
      const willOpen = menu.hidden;
      menu.hidden = !willOpen;
      button.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) menu.querySelector("a")?.focus();
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".cmm-profile-menu")) closeProfileMenu();
    });

    menu.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeProfileMenu();
        button.focus();
      }
    });
  }

  function initializeFooterDropdowns() {
    const dropdowns = Array.from(document.querySelectorAll(".cmm-footer-dropdown"));
    if (!dropdowns.length) return;

    function closeDropdowns(except) {
      dropdowns.forEach((dropdown) => {
        if (dropdown !== except) dropdown.open = false;
      });
    }

    document.addEventListener("toggle", (event) => {
      const openedDropdown = event.target.closest?.(".cmm-footer-dropdown");
      if (openedDropdown?.open) closeDropdowns(openedDropdown);
    }, true);

    document.addEventListener("click", (event) => {
      if (!event.target.closest?.(".cmm-footer-dropdown")) closeDropdowns();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeDropdowns();
    });
  }

  function initializeDisclosureControls() {
    const controls = document.querySelectorAll("[data-cmm-disclosure-target]");

    controls.forEach((control) => {
      const targetId = control.dataset.cmmDisclosureTarget;
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;

      function synchronizeDisclosure() {
        const isExpanded = control.checked;
        target.hidden = !isExpanded;
        control.setAttribute("aria-expanded", String(isExpanded));
        target.querySelectorAll("input, select, textarea, button").forEach((field) => {
          field.disabled = !isExpanded;
        });
      }

      control.addEventListener("change", synchronizeDisclosure);
      synchronizeDisclosure();
    });
  }

  function initializeInterface() {
    initializeMobileNavigation();
    initializeProfileMenu();
    initializeFooterDropdowns();
    initializeDisclosureControls();
  }

  document.addEventListener("DOMContentLoaded", initializeInterface);
})();
