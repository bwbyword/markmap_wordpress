(function () {
  const DEFAULT_MARKDOWN = '# Mindmap\n\n## Start\n- Paste Markdown\n- Upload a `.md` file\n';
  const initializedContainers = new WeakSet();

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setStatus(container, message, isError) {
    const status = container.querySelector('.interactive-markdown-mindmap__status');

    if (!status) return;

    status.textContent = message || '';
    status.classList.toggle('is-error', Boolean(isError));
  }

  function getTransformer() {
    if (!window.markmap || !window.markmap.Transformer || !window.markmap.Markmap) {
      throw new Error('Markmap assets could not be loaded.');
    }

    return new window.markmap.Transformer();
  }

  function getTypes(container) {
    return container.getAttribute('data-types') || 'page,post';
  }

  function activateMode(container, mode) {
    container.setAttribute('data-mode', mode);
    container.querySelectorAll('.interactive-markdown-mindmap__mode').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-mode') === mode);
    });
  }

  function getEmbeddedMarkdown(container) {
    const source = container.querySelector('.interactive-markdown-mindmap__source');

    if (!source) return '';

    try {
      return JSON.parse(source.textContent || '""');
    } catch (error) {
      return source.textContent || '';
    }
  }

  function renderMarkdown(container, markdown, shouldFit) {
    const svg = container.querySelector('.interactive-markdown-mindmap__svg');
    const transformer = getTransformer();
    const result = transformer.transform(markdown || DEFAULT_MARKDOWN);
    const options = window.markmap.deriveOptions(result.frontmatter && result.frontmatter.markmap);
    let instance = container.markmapInstance;

    if (!instance) {
      instance = window.markmap.Markmap.create(svg, options, result.root);
      container.markmapInstance = instance;
    } else {
      instance.setOptions(options);
      instance.setData(result.root);
    }

    if (shouldFit !== false) {
      window.setTimeout(() => instance.fit(), 40);
    }
  }

  function fitWhenReady(container, delay) {
    if (!container.markmapInstance) return;

    window.setTimeout(() => {
      if (container.isConnected && container.offsetParent !== null) {
        container.markmapInstance.fit();
      }
    }, delay);
  }

  async function zoomMindmap(container, scale) {
    if (container.markmapInstance && container.markmapInstance.rescale) {
      await container.markmapInstance.rescale(scale);
    }
  }

  async function renderSitemap(container) {
    setStatus(container, 'Generating sitemap...');
    const url = new URL(window.InteractiveMarkdownMindmap.restUrl);
    url.searchParams.set('types', getTypes(container));

    const response = await fetch(url.toString(), {
      headers: {
        'X-WP-Nonce': window.InteractiveMarkdownMindmap.nonce,
      },
    });

    if (!response.ok) {
      throw new Error('WordPress returned an error while generating the sitemap.');
    }

    const payload = await response.json();
    renderMarkdown(container, payload.markdown, true);
    setStatus(container, '');
  }

  function initialize(container) {
    if (!container || initializedContainers.has(container)) return;

    initializedContainers.add(container);

    const textarea = container.querySelector('textarea');
    const fileInput = container.querySelector('input[type="file"]');
    const configuredMode = container.getAttribute('data-mode') || 'markdown';
    const embeddedMarkdown = getEmbeddedMarkdown(container);

    activateMode(container, configuredMode);

    container.querySelectorAll('.interactive-markdown-mindmap__mode').forEach((button) => {
      button.addEventListener('click', async () => {
        const mode = button.getAttribute('data-mode');
        activateMode(container, mode);

        try {
          if (mode === 'sitemap') {
            await renderSitemap(container);
          } else {
            renderMarkdown(container, textarea ? textarea.value : embeddedMarkdown, true);
            setStatus(container, '');
          }
        } catch (error) {
          setStatus(container, error.message, true);
        }
      });
    });

    if (textarea) {
      textarea.addEventListener('input', () => {
        if (container.getAttribute('data-mode') === 'markdown') {
          renderMarkdown(container, textarea.value, false);
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files && fileInput.files[0];

        if (!file) return;

        try {
          const text = await file.text();
          textarea.value = text;
          activateMode(container, 'markdown');
          renderMarkdown(container, text, true);
          setStatus(container, file.name);
        } catch (error) {
          setStatus(container, 'The selected file could not be read.', true);
        }
      });
    }

    container.querySelectorAll('.interactive-markdown-mindmap__fit').forEach((button) => {
      button.addEventListener('click', () => {
        if (container.markmapInstance) {
          container.markmapInstance.fit();
        }
      });
    });

    container.querySelectorAll('.interactive-markdown-mindmap__zoom-out').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        zoomMindmap(container, 1 / 1.2).catch((error) => {
          setStatus(container, error.message, true);
        });
      });
    });

    container.querySelectorAll('.interactive-markdown-mindmap__zoom-in').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        zoomMindmap(container, 1.2).catch((error) => {
          setStatus(container, error.message, true);
        });
      });
    });

    container.querySelectorAll('.interactive-markdown-mindmap__fullscreen').forEach((button) => {
      button.addEventListener('click', async () => {
        try {
          if (document.fullscreenElement === container) {
            await document.exitFullscreen();
          } else if (container.requestFullscreen) {
            await container.requestFullscreen();
          }

          if (container.markmapInstance) {
            window.setTimeout(() => container.markmapInstance.fit(), 120);
          }
        } catch (error) {
          setStatus(container, 'Fullscreen is not available in this browser.', true);
        }
      });
    });

    try {
      if (configuredMode === 'sitemap') {
        renderSitemap(container).catch((error) => setStatus(container, error.message, true));
      } else {
        renderMarkdown(container, textarea ? textarea.value : embeddedMarkdown, true);
      }

      fitWhenReady(container, 250);
      fitWhenReady(container, 800);
    } catch (error) {
      setStatus(container, error.message, true);
    }
  }

  function initializeAll(root) {
    const scope = root || document;
    const containers = [];

    if (scope.matches && scope.matches('.interactive-markdown-mindmap')) {
      containers.push(scope);
    }

    if (scope.querySelectorAll) {
      containers.push(...scope.querySelectorAll('.interactive-markdown-mindmap'));
    }

    containers.forEach(initialize);
  }

  function observeDynamicShortcodes() {
    let frame = 0;
    const observer = new MutationObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => initializeAll(document));
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function bindElementorEditor() {
    const bind = () => {
      if (!window.elementorFrontend || !window.elementorFrontend.hooks) return;

      window.elementorFrontend.hooks.addAction('frontend/element_ready/shortcode.default', ($scope) => {
        initializeAll($scope && $scope[0] ? $scope[0] : document);
      });

      window.elementorFrontend.hooks.addAction('frontend/element_ready/global', ($scope) => {
        initializeAll($scope && $scope[0] ? $scope[0] : document);
      });
    };

    if (window.elementorFrontend && window.elementorFrontend.hooks) {
      bind();
    } else if (window.jQuery) {
      window.jQuery(window).on('elementor/frontend/init', bind);
    } else {
      window.addEventListener('elementor/frontend/init', bind);
    }
  }

  ready(() => {
    initializeAll(document);
    observeDynamicShortcodes();
    bindElementorEditor();
  });
})();
