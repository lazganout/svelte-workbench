<script lang="ts">
  import previews from "virtual:workbench";
  import type { WorkbenchConfig } from "virtual:workbench";
  import { mount, unmount, tick } from "svelte";

  // --- State ---
  let iframeEl: HTMLIFrameElement | undefined = $state();
  let selectedPath = $state("");
  let currentItem: any = $state(null);
  let isLoading = $state(false);

  let mountedInstance: any = null;
  let contentObserver: ResizeObserver | null = null;
  let styleObserver: MutationObserver | null = null;

  const DEFAULT_CONFIG: WorkbenchConfig = { mode: "hug" };

  // --- 1. Grouping Logic ---
  const groups = previews.reduce(
    (acc, item) => {
      const parts = item.path.split("/");
      const previewIndex = parts.indexOf("preview");
      const groupName = previewIndex > -1 ? parts[previewIndex - 1] : "root";
      const fileName = parts[parts.length - 1];

      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push({ ...item, name: fileName });
      return acc;
    },
    {} as Record<string, typeof previews & { name: string }[]>
  );

  // --- 2. HMR Handling ---
  if (import.meta.hot) {
    import.meta.hot.on("vite:afterUpdate", () => {
      if (currentItem) selectPreview(currentItem);
    });
  }

  // --- 3. Selection Logic ---
  async function selectPreview(preview: any) {
    isLoading = true;
    currentItem = preview;
    selectedPath = preview.path;

    // Cleanup
    if (mountedInstance) {
      unmount(mountedInstance);
      mountedInstance = null;
    }
    if (contentObserver) {
      contentObserver.disconnect();
      contentObserver = null;
    }
    if (styleObserver) {
      styleObserver.disconnect();
      styleObserver = null;
    }

    await tick();
    if (!iframeEl) return;

    // A. Load Component
    const module = await preview.component();
    const Component = module.default;
    const config: WorkbenchConfig = module.workbench || DEFAULT_CONFIG;

    // B. Reset Iframe
    const doc = iframeEl.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write("<!DOCTYPE html><html><head></head><body></body></html>");
    doc.close();

    // C. Sync Styles
    syncStyles(doc);

    // D. Base Styles
    const baseStyle = doc.createElement("style");
    baseStyle.textContent = `
			html, body {
				margin: 0 !important;
				padding: 0 !important;
				overflow: hidden !important; 
				background: transparent !important;
				font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
			}
			*, *::before, *::after { box-sizing: border-box; }
			${config.mode === "full" ? "html, body { width: 100%; height: 100%; }" : ""}
		`;
    doc.head.appendChild(baseStyle);

    // E. Wrapper (THE FIX)
    // Logic:
    // - 'hug': Wrapper is inline-block (shrinks to content).
    // - 'full' OR 'fixed': Wrapper is block 100% (fills the iframe/screen).
    const isHug = config.mode === "hug";
    const wrapperDisplay = isHug ? "inline-block" : "block";
    const wrapperWidth = isHug ? "auto" : "100%";
    const wrapperHeight = isHug ? "auto" : "100%";

    const mountTarget = doc.createElement("div");
    mountTarget.style.display = wrapperDisplay;
    mountTarget.style.width = wrapperWidth;
    mountTarget.style.height = wrapperHeight;

    doc.body.appendChild(mountTarget);

    // F. Mount
    try {
      mountedInstance = mount(Component, { target: mountTarget });
    } catch (err) {
      console.error("Failed to mount:", err);
      isLoading = false;
      return;
    }

    // G. Observer
    updateIframeDimensions(config, mountTarget);

    setTimeout(() => {
      isLoading = false;
    }, 50);
  }

  // --- Helpers ---
  function syncStyles(targetDoc: Document) {
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((node) => targetDoc.head.appendChild(node.cloneNode(true)));

    styleObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (
            node instanceof HTMLElement &&
            (node.tagName === "STYLE" ||
              (node.tagName === "LINK" &&
                (node as HTMLLinkElement).rel === "stylesheet"))
          ) {
            targetDoc.head.appendChild(node.cloneNode(true));
          }
        });
      });
    });
    styleObserver.observe(document.head, { childList: true });
  }

  function updateIframeDimensions(
    config: WorkbenchConfig,
    targetElement: HTMLElement
  ) {
    if (!iframeEl) return;
    iframeEl.style.width = "";
    iframeEl.style.height = "";

    if (config.mode === "full") {
      iframeEl.style.width = "100%";
      iframeEl.style.height = "100%";
    } else if (config.mode === "fixed") {
      iframeEl.style.width = config.width || "100%";
      iframeEl.style.height = config.height || "500px";
    } else if (config.mode === "hug") {
      contentObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { inlineSize, blockSize } = entry.borderBoxSize[0];
          if (iframeEl && inlineSize > 0 && blockSize > 0) {
            iframeEl.style.width = `${inlineSize}px`;
            iframeEl.style.height = `${blockSize}px`;
          }
        }
      });
      contentObserver.observe(targetElement);
    }
  }
</script>

<div class="SvelteWorkbench">
  <!-- Sidebar -->
  <div class="Sidebar">
    <div class="sidebar-content">
      {#each Object.entries(groups) as [groupName, items]}
        <div class="group-section">
          <h3 class="group-title">{groupName}</h3>
          <div class="group-items">
            {#each items as item}
              <button
                class:active={selectedPath === item.path}
                onclick={() => selectPreview(item)}
              >
                {item.name}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Workbench Area -->
  <div class="Workbench">
    {#if selectedPath}
      <iframe
        bind:this={iframeEl}
        title="renderer"
        src="about:blank"
        class:loading={isLoading}
      ></iframe>
    {:else}
      <div class="empty-state">
        <p>Select a component to preview</p>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif;
  }

  .SvelteWorkbench {
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-template-columns: 280px 1fr;
    grid-template-areas: "Sidebar Workbench";
    background: #1e1e1e;
    color: #ccc;
  }

  /* Sidebar */
  .Sidebar {
    grid-area: Sidebar;
    background: #252526;
    border-right: 1px solid #1a1a1a;
    overflow-y: auto;
  }
  .sidebar-content {
    padding: 10px 0;
  }
  .group-section {
    margin-bottom: 8px;
  }
  .group-title {
    margin: 0;
    padding: 8px 16px;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: bold;
    color: #6f7bb4;
    letter-spacing: 0.05em;
  }
  button {
    display: block;
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    color: #bbbbbb;
    padding: 6px 16px 6px 24px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.1s;
  }
  button:hover {
    background-color: #2a2d2e;
    color: #fff;
  }
  button.active {
    background-color: #37373d;
    color: #ffffff;
    border-left: 2px solid #007fd4;
    padding-left: 22px;
  }

  /* Workbench */
  .Workbench {
    grid-area: Workbench;
    background-color: #1e1e1e;
    display: grid;
    place-items: center;
    overflow: auto;
    padding: 60px;

    /* Background Pattern */
    background-image: radial-gradient(#3a3a3a 1px, transparent 1px);
    background-size: 20px 20px;
  }

  iframe {
    display: block;
    border: none;
    border-radius: 0;

    /* --- The New Flashy Blue Outline --- */
    outline: 2px solid #007fd4; /* VS Code Blue */
    outline-offset: 10px;

    /* Blue glow + depth shadow */
    box-shadow:
      0 0 15px rgba(0, 127, 212, 0.4),
      /* Outer glow */ 0 10px 40px rgba(0, 0, 0, 0.8); /* Drop shadow */

    /* Checkerboard Pattern */
    background-color: #fff;
    background-image: linear-gradient(45deg, #eee 25%, transparent 25%),
      linear-gradient(-45deg, #eee 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #eee 75%),
      linear-gradient(-45deg, transparent 75%, #eee 75%);
    background-size: 20px 20px;
    background-position:
      0 0,
      0 10px,
      10px -10px,
      -10px 0px;

    transition:
      width 0.2s cubic-bezier(0.2, 0, 0, 1),
      height 0.2s cubic-bezier(0.2, 0, 0, 1),
      opacity 0.2s ease-in-out;

    opacity: 1;
  }

  iframe.loading {
    opacity: 0;
  }

  .empty-state {
    color: #555;
    font-style: italic;
  }
</style>
