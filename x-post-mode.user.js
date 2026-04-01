// ==UserScript==
// @name         X (Twitter) - Post Mode
// @namespace    https://x.com/
// @version      1.0.0
// @description  Simplify X UI to a post-only compose view, with a toggle button
// @author       public_ai000ya
// @match        https://x.com/*
// @match        https://twitter.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

;(function () {
  'use strict'

  GM_addStyle(`
    /* ── Toggle button ── */
    #xpm-toggle-btn {
      position: fixed;
      bottom: 24px;
      left: 24px;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      outline: none;
      background: transparent;
      padding: 0;
    }
    #xpm-toggle-btn:hover  { transform: scale(1.1); box-shadow: 0 6px 20px rgba(0,0,0,0.32); }
    #xpm-toggle-btn:active { transform: scale(0.95); }

    /* ── Injected post button on profile pages ── */
    #xpm-post-btn {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483646;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 32px;
      background: #1d9bf0;
      color: #fff;
      border: none;
      border-radius: 9999px;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(29, 155, 240, 0.35);
      transition: background 0.15s ease, transform 0.15s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #xpm-post-btn:hover  { background: #1a8cd8; transform: scale(1.02) translateX(-50%); }
    #xpm-post-btn:active { transform: scale(0.97) translateX(-50%); }

    /* ── Common: elements always hidden in post mode ── */

    /* Left sidebar nav */
    body.xpm-active header[role="banner"] {
      display: none !important;
    }

    /* Right sidebar */
    body.xpm-active [data-testid="sidebarColumn"] {
      display: none !important;
    }

    /* Mobile bottom bar */
    body.xpm-active [data-testid="BottomBar"] {
      display: none !important;
    }

    /* Mobile top nav bar (back button + title row) */
    body.xpm-active [data-testid="TopNavBar"] {
      display: none !important;
    }

    /* Grok drawer */
    body.xpm-active [data-testid="GrokDrawer"] {
      display: none !important;
    }

    /* DM button / drawer (desktop floating button & mobile tab) */
    body.xpm-active [data-testid="AppTabBar_DirectMessage_Link"],
    body.xpm-active [data-testid="DMDrawer"],
    body.xpm-active [data-testid="FloatingActionButton_Tweet"] {
      display: none !important;
    }

    /* Expand main content to fill freed space */
    body.xpm-active main[role="main"] {
      max-width: 600px !important;
      margin: 0 auto !important;
      width: 100% !important;
    }
    body.xpm-active [data-testid="primaryColumn"] {
      max-width: 600px !important;
      width: 100% !important;
      border-left: none !important;
      border-right: none !important;
    }

    /* ── /profile specific ── */

    /* Prevent scrollbar from changing size due to virtualized timeline height updates */
    body.xpm-active.xpm-profile {
      overflow: hidden !important;
    }

    /* Hide sticky column header (username + post count bar at the very top).
       On mobile the same :first-child is the profile content, so limit to desktop widths. */
    @media (min-width: 600px) {
      body.xpm-active.xpm-profile [data-testid="primaryColumn"] > div > div:first-child {
        display: none !important;
      }
    }

    /* Hide the tab navigation bar */
    body.xpm-active.xpm-profile [role="tablist"] {
      display: none !important;
    }

    /* Hide tweet cells in profile timeline */
    body.xpm-active.xpm-profile [data-testid="cellInnerDiv"] {
      display: none !important;
    }

    /* Hide following / followers count links directly */
    body.xpm-active.xpm-profile a[href$="/following"],
    body.xpm-active.xpm-profile a[href$="/followers"],
    body.xpm-active.xpm-profile a[href$="/verified_followers"] {
      display: none !important;
    }
    /* Also hide their row container (both links end with those paths → safe $= match) */
    body.xpm-active.xpm-profile div:has(a[href$="/following"]):has(a[href$="/followers"]) {
      display: none !important;
    }

    /* Hide floating DM button (bottom-right envelope icon)
       Lives in X's React portal (#layers) as the 2nd child.
       Guard with :not(:has([role="dialog"])) so actual modals are never hidden. */
    body.xpm-active #layers > div > div:nth-child(2):not(:has([role="dialog"])):not(:has([role="alertdialog"])) {
      display: none !important;
    }
    body.xpm-active [data-testid="AppTabBar_DirectMessage_Link"],
    body.xpm-active [data-testid="DMDrawer"] {
      display: none !important;
    }

    /* ── /compose/post specific ── */

    /* Hide entire background — compose dialog lives in #layers (outside main),
       so hiding main does not affect the composer itself.
       This also prevents infinite-scroll from looping on hidden cells. */
    body.xpm-active.xpm-compose main[role="main"] {
      display: none !important;
    }

    /* ── /home specific ── */

    /* Hide sticky column header (tabs row above compose) */
    body.xpm-active.xpm-home [data-testid="primaryColumn"] > div > div:first-child {
      display: none !important;
    }

    /* Hide timeline tweet cells, keep compose area */
    body.xpm-active.xpm-home [data-testid="cellInnerDiv"] {
      display: none !important;
    }

    /* Center and frame the compose section */
    body.xpm-active.xpm-home [data-testid="primaryColumn"] > div {
      padding-top: 32px !important;
    }
    body.xpm-active.xpm-home [data-testid="primaryColumn"] > div > div:nth-child(2) {
      border: 1px solid rgba(0, 0, 0, 0.10) !important;
      border-radius: 16px !important;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07) !important;
      overflow: hidden !important;
    }
    html[data-theme="dark"] body.xpm-active.xpm-home [data-testid="primaryColumn"] > div > div:nth-child(2) {
      border-color: rgba(255, 255, 255, 0.10) !important;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.40) !important;
    }
  `)

  const storageKey = 'x_post_mode_active'
  const defaultPostModeActive = true

  const postMode = {
    active: GM_getValue(storageKey, defaultPostModeActive),
    previousActiveState: defaultPostModeActive,
    toggleActive: () => {
      postMode.previousActiveState = postMode.active
      postMode.active = !postMode.active
    },
    isCurrentStateAndPreviousStateSame: () => postMode.active === postMode.previousActiveState,
  }

  function getPageType() {
    const path = location.pathname
    if (path === '/home' || path === '/') {
      return 'home'
    }
    if (path.startsWith('/compose')) {
      return 'compose'
    }

    const reservedPaths = [
      '/explore',
      '/notifications',
      '/messages',
      '/bookmarks',
      '/lists',
      '/settings',
      '/i/',
      '/search',
      '/jobs'
    ]
    if (reservedPaths.some(p => path.startsWith(p))) {
      return 'other'
    }

    // Anything like /{username}[/...] is treated as a profile page
    if (/^\/[A-Za-z0-9_]+/.test(path)) {
      return 'profile'
    }

    return 'other'
  }

  const postModeIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="52" height="52">
      <circle cx="24" cy="24" r="24" fill="#1d9bf0"/>
      <path d="M30 10 L38 18 L18 38 H10 V30 Z" fill="white"/>
      <line x1="27" y1="13" x2="35" y2="21" stroke="#1d9bf0" stroke-width="2"/>
    </svg>
  `

  const originalModeIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="52" height="52">
      <circle cx="24" cy="24" r="24" fill="#536471"/>
      <rect x="12" y="14" width="24" height="4" rx="2" fill="white"/>
      <rect x="12" y="22" width="24" height="4" rx="2" fill="white"/>
      <rect x="12" y="30" width="16" height="4" rx="2" fill="white"/>
    </svg>
  `

  function createToggleButton() {
    const button = document.createElement('button')
    button.id = 'xpm-toggle-btn'
    button.setAttribute('type', 'button')
    button.addEventListener('click', () => {
      postMode.toggleActive()
      GM_setValue(storageKey, postMode.active)
      applyMode()
    })
    return button
  }

  function updateToggleButton() {
    if (postMode.active) {
      toggleButton.innerHTML = postModeIcon
      toggleButton.title = 'Switch to full view (currently: post mode)'
    } else {
      toggleButton.innerHTML = originalModeIcon
      toggleButton.title = 'Switch to post mode (currently: full view)'
    }
  }

  const toggleButton = createToggleButton()

  function createPostButton() {
    const postButton = document.createElement('button')
    postButton.id = 'xpm-post-btn'
    postButton.type = 'button'
    postButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white">
        <path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.013.19-3H12c4.1 0 7.48-2.53 7.94-6.16.096-.752.056-1.555-.188-2.248-.814-2.23-4.056-4.1-9.7-3.604C12.2 6.93 14.3 5 17.1 4.1L23 3z"/>
      </svg>
      Post
    `
    postButton.addEventListener('click', () => {
      // TODOO: Is this falling back really right? Should we use `throw` instead?

      // Try clicking the real (now hidden) compose button first,
      // fall back to navigating to /compose/tweet
      const originalButton = document.querySelector('[data-testid="SideNav_NewTweet_Button"]')
      if (originalButton instanceof HTMLElement) {
        originalButton.click()
      } else {
        location.href = '/compose/tweet'
      }
    })
    return postButton
  }

  /** @type {MutationObserver | null} */
  let profileButtonObserver = null

  /**
   * Watches the DOM and re-injects the profile post button whenever React removes it.
   * Uses MutationObserver instead of setTimeout polling to avoid periodic layout thrashing.
   */
  function startWatchingProfilePostButton() {
    if (profileButtonObserver !== null) {
      profileButtonObserver.disconnect()
      profileButtonObserver = null
    }

    injectProfilePostButton()

    profileButtonObserver = new MutationObserver(() => {
      if (document.getElementById('xpm-post-btn') === null) {
        injectProfilePostButton()
      }
    })
    profileButtonObserver.observe(document.body, { childList: true, subtree: true })
  }

  function stopWatchingProfilePostButton() {
    if (profileButtonObserver !== null) {
      profileButtonObserver.disconnect()
      profileButtonObserver = null
    }
  }

  function injectProfilePostButton() {
    if (document.getElementById('xpm-post-btn') !== null) {
      return
    }
    // Append directly to body (outside React's DOM tree) so React can never remove it.
    // The button uses position:fixed and does not affect document layout or scrollbar.
    document.body.appendChild(createPostButton())
  }

  function removeProfilePostButton() {
    const element = document.getElementById('xpm-post-btn')
    if (element !== null) {
      element.remove()
    }
  }

  function applyPostMode() {
    const pageType = getPageType()
    document.body.classList.add('xpm-active')

    if (pageType === 'home') {
      document.body.classList.add('xpm-home')
      removeProfilePostButton()
    } else if (pageType === 'profile') {
      document.body.classList.add('xpm-profile')
      startWatchingProfilePostButton()
    } else if (pageType === 'compose') {
      document.body.classList.add('xpm-compose')
    } else {
      // On other pages just apply the sidebar-hiding styles
    }
  }

  function applyOriginalMode() {
    document.body.classList.remove('xpm-active')
    stopWatchingProfilePostButton()
    removeProfilePostButton()
  }

  function applyMode() {
    if (postMode.isCurrentStateAndPreviousStateSame()) {
      return
    }

    document.body.classList.remove('xpm-home', 'xpm-profile', 'xpm-compose')
    stopWatchingProfilePostButton()

    if (postMode.active) {
      applyPostMode()
    } else {
      applyOriginalMode()
    }

    updateToggleButton()
  }

  function mount() {
    if (document.body === null) {
      return
    }
    if (document.getElementById('xpm-toggle-btn') === null) {
      document.body.appendChild(toggleButton)
    }
    applyMode()
  }

  mount()
  document.addEventListener('DOMContentLoaded', mount)

  let lastHref = location.href
  new MutationObserver(() => {
    if (location.href === lastHref) {
      return
    }
    lastHref = location.href
    setTimeout(mount, 1000) // Re-mount button and re-apply mode after React updates DOM
  }).observe(document.documentElement, { childList: true, subtree: true })
})()
