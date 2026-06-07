(function () {
  const DEFAULT_MARKDOWN = '# Mindmap\n\n## Homepage\n- [brick][header] Header\n- [brick][image] Hero\n\n## Contact\n- [brick][form] Contact Form\n';
  const initializedContainers = new WeakSet();
  const BRICK_TYPES = ['image', 'text', 'video', 'form', 'list', 'header', 'footer'];

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

    if (!isError && message && status.textContent === message && status.classList.contains('is-visible') && container.statusTimer) {
      return;
    }

    if (container.statusTimer) {
      window.clearTimeout(container.statusTimer);
      container.statusTimer = 0;
    }

    if (container.statusFadeTimer) {
      window.clearTimeout(container.statusFadeTimer);
      container.statusFadeTimer = 0;
    }

    status.textContent = message || '';
    status.classList.toggle('is-error', Boolean(isError));

    if (!message) {
      status.classList.remove('is-visible');
      return;
    }

    status.classList.add('is-visible');

    if (isError) return;

    container.statusTimer = window.setTimeout(() => {
      status.classList.remove('is-visible');
      container.statusFadeTimer = window.setTimeout(() => {
        if (!status.classList.contains('is-visible')) {
          status.textContent = '';
        }
      }, 220);
    }, 3600);
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

  function getPlanningMode(container) {
    return container.getAttribute('data-planning-mode') === 'mainpage-first' ? 'mainpage-first' : 'structure-first';
  }

  function isBirdseye(container) {
    return container.getAttribute('data-birdseye') === 'true';
  }

  function getLayout(container) {
    return container.getAttribute('data-layout') === 'vertical' ? 'vertical' : 'horizontal';
  }

  function activateMode(container, mode) {
    container.setAttribute('data-mode', mode);
    container.querySelectorAll('.interactive-markdown-mindmap__mode').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-mode') === mode);
    });
  }

  function activatePlanning(container, planningMode) {
    container.setAttribute('data-planning-mode', planningMode);
    container.querySelectorAll('.interactive-markdown-mindmap__planning').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-planning-mode') === planningMode);
    });
  }

  function activateBirdseye(container, enabled) {
    container.setAttribute('data-birdseye', enabled ? 'true' : 'false');
    container.querySelectorAll('.interactive-markdown-mindmap__birdseye').forEach((button) => {
      button.classList.toggle('is-active', enabled);
      button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    });
  }

  function activateLayout(container, layout) {
    const nextLayout = layout === 'vertical' ? 'vertical' : 'horizontal';
    container.setAttribute('data-layout', nextLayout);

    container.querySelectorAll('.interactive-markdown-mindmap__layout').forEach((button) => {
      const buttonLayout = button.getAttribute('data-layout');
      const isToggleOnly = button.classList.contains('interactive-markdown-mindmap__icon-button');

      if (isToggleOnly) {
        button.setAttribute('data-layout', nextLayout === 'vertical' ? 'horizontal' : 'vertical');
        button.classList.toggle('is-active', nextLayout === 'vertical');
      } else {
        button.classList.toggle('is-active', buttonLayout === nextLayout);
      }
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

  function stripMarkdown(value) {
    return value
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`~]/g, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  function normalizeLabel(value) {
    return stripMarkdown(value).replace(/\s+/g, ' ').toLowerCase();
  }

  function parseBrick(content) {
    let working = content.trim();
    let type = '';

    const prefix = working.match(/^\[brick(?::([a-z-]+))?\]\s*/i);
    if (!prefix) return null;

    if (prefix[1]) {
      type = prefix[1].toLowerCase();
    }

    working = working.slice(prefix[0].length).trim();

    const typePrefix = working.match(/^\[([a-z-]+)\]\s*/i);
    if (typePrefix && BRICK_TYPES.includes(typePrefix[1].toLowerCase())) {
      type = typePrefix[1].toLowerCase();
      working = working.slice(typePrefix[0].length).trim();
    }

    const typeSuffix = working.match(/\s+\[([a-z-]+)\]\s*$/i);
    if (typeSuffix && BRICK_TYPES.includes(typeSuffix[1].toLowerCase())) {
      type = typeSuffix[1].toLowerCase();
      working = working.slice(0, typeSuffix.index).trim();
    }

    return {
      name: stripMarkdown(working || 'Content Brick'),
      type: BRICK_TYPES.includes(type) ? type : 'text',
    };
  }

  function parseDirective(line) {
    const match = line.match(/<!--\s*imm:\s*([^>]+)-->/i);
    if (!match) return {};

    return match[1].split(/\s+/).reduce((directives, item) => {
      const parts = item.split('=');
      if (parts.length === 2) {
        directives[parts[0].toLowerCase()] = parts[1].toLowerCase();
      }
      return directives;
    }, {});
  }

  function isDirectiveLine(line) {
    return /<!--\s*imm:\s*([^>]+)-->/i.test(line);
  }

  function getNearestParent(stack, indent) {
    const keys = Object.keys(stack).map(Number).filter((key) => key < indent).sort((a, b) => b - a);
    return keys.length ? stack[keys[0]] : stack[Object.keys(stack).map(Number).sort((a, b) => a - b)[0]];
  }

  function formatBrickLine(indent, brick) {
    return `${' '.repeat(indent)}- ${brick.type.toUpperCase()} - ${brick.name}`;
  }

  function buildBirdseyeMarkdown(cleanLines, bricksByLabel) {
    const output = [];

    cleanLines.forEach((line) => {
      output.push(line);

      const heading = line.match(/^(\s{0,3})(#{1,6})\s+(.+)$/);
      if (heading) {
        const label = stripMarkdown(heading[3]);
        const brickGroup = bricksByLabel.get(normalizeLabel(label));
        const childIndent = heading[2].length * 2;
        const bricks = brickGroup && brickGroup.bricks.length ? brickGroup.bricks : [{ name: 'No bricks yet', type: 'todo' }];

        bricks.forEach((brick) => output.push(formatBrickLine(childIndent, brick)));
        return;
      }

      const list = line.match(/^(\s*)([-*+])\s+(.+)$/);
      if (list) {
        const label = stripMarkdown(list[3]);
        const brickGroup = bricksByLabel.get(normalizeLabel(label));
        const childIndent = list[1].replace(/\t/g, '  ').length + 2;
        const bricks = brickGroup && brickGroup.bricks.length ? brickGroup.bricks : [{ name: 'No bricks yet', type: 'todo' }];

        bricks.forEach((brick) => output.push(formatBrickLine(childIndent, brick)));
      }
    });

    return output.join('\n');
  }

  function parseContentPlan(markdown, container) {
    const lines = (markdown || DEFAULT_MARKDOWN).split(/\n/);
    const stack = {};
    const cleanLines = [];
    const bricksByLabel = new Map();
    let lastContentLabel = '';
    let rootLabel = '';
    let directivePlanning = '';
    let directiveBirdseye = null;

    lines.forEach((line) => {
      const directive = parseDirective(line);
      if (directive.planning) directivePlanning = directive.planning;
      if (directive.birdseye) directiveBirdseye = ['true', '1', 'yes'].includes(directive.birdseye);
      if (isDirectiveLine(line)) return;

      const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+)$/);
      if (heading) {
        const indent = (heading[1].length - 1) * 2;
        const label = stripMarkdown(heading[2]);
        stack[indent] = label;
        lastContentLabel = label;
        Object.keys(stack).map(Number).filter((key) => key > indent).forEach((key) => delete stack[key]);
        if (!rootLabel) rootLabel = label;
        cleanLines.push(line);
        return;
      }

      const list = line.match(/^(\s*)([-*+])\s+(.+)$/);
      if (!list) {
        cleanLines.push(line);
        return;
      }

      const indent = list[1].replace(/\t/g, '  ').length;
      const brick = parseBrick(list[3]);

      if (!brick) {
        const label = stripMarkdown(list[3]);
        stack[indent] = label;
        lastContentLabel = label;
        Object.keys(stack).map(Number).filter((key) => key > indent).forEach((key) => delete stack[key]);
        if (!rootLabel) rootLabel = label;
        cleanLines.push(line);
        return;
      }

      const parentLabel = lastContentLabel || getNearestParent(stack, indent) || rootLabel || 'Mindmap';
      const key = normalizeLabel(parentLabel);
      const existing = bricksByLabel.get(key) || {
        label: parentLabel,
        bricks: [],
      };

      existing.bricks.push(brick);
      bricksByLabel.set(key, existing);
    });

    const planning = ['mainpage-first', 'structure-first'].includes(directivePlanning) ? directivePlanning : getPlanningMode(container);
    const birdseye = directiveBirdseye === null ? isBirdseye(container) : directiveBirdseye;
    const hasBricks = [...bricksByLabel.values()].some((group) => group.bricks.length > 0);
    const cleanMarkdown = cleanLines.join('\n');

    return {
      birdseye,
      birdseyeMarkdown: hasBricks ? buildBirdseyeMarkdown(cleanLines, bricksByLabel) : cleanMarkdown,
      bricksByLabel,
      cleanMarkdown,
      hasBricks,
      planning,
      rootLabel,
    };
  }

  function removeDecorations(svg) {
    svg.querySelectorAll('.interactive-markdown-mindmap__badge, .interactive-markdown-mindmap__prompt').forEach((node) => node.remove());
    svg.querySelectorAll('.interactive-markdown-mindmap__mainpage-node').forEach((node) => {
      node.classList.remove('interactive-markdown-mindmap__mainpage-node');
    });
  }

  function appendDecoration(element, text, className) {
    if (element.namespaceURI === 'http://www.w3.org/2000/svg') {
      const item = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      item.setAttribute('class', className);
      item.setAttribute('dx', '8');
      item.textContent = text;
      element.appendChild(item);
      return;
    }

    const item = document.createElement('span');
    item.className = className;
    item.textContent = text;
    element.appendChild(item);
  }

  function decorateMindmap(container, plan) {
    const svg = container.querySelector('.interactive-markdown-mindmap__svg');
    if (!svg) return;

    removeDecorations(svg);

    const texts = [
      ...svg.querySelectorAll('text'),
      ...svg.querySelectorAll('.markmap-foreign > div > div'),
    ];
    const rootKey = normalizeLabel(plan.rootLabel || '');

    texts.forEach((text, index) => {
      const label = normalizeLabel(text.textContent || '');
      const brickGroup = plan.bricksByLabel.get(label);

      if (brickGroup && brickGroup.bricks.length && !plan.birdseye) {
        appendDecoration(text, `${brickGroup.bricks.length} bricks`, 'interactive-markdown-mindmap__badge');
      }

      if (plan.birdseye && !plan.hasBricks && label) {
        appendDecoration(text, 'No bricks yet', 'interactive-markdown-mindmap__badge');
      }

      if (plan.planning === 'mainpage-first' && (label === rootKey || (!rootKey && index === 0))) {
        const node = text.closest('g');
        if (node) node.classList.add('interactive-markdown-mindmap__mainpage-node');

        appendDecoration(text, brickGroup && brickGroup.bricks.length ? 'mainpage ready' : 'start here', 'interactive-markdown-mindmap__prompt');
      }
    });

    if (plan.planning === 'mainpage-first') {
      const rootBricks = plan.bricksByLabel.get(rootKey);
      setStatus(container, rootBricks && rootBricks.bricks.length
        ? 'Mainpage First: root content bricks are defined. Continue branching when ready.'
        : 'Mainpage First: define content bricks for the root page before branching out.');
    } else {
      setStatus(container, plan.birdseye
        ? (plan.hasBricks
          ? 'Bird\'s Eye View: showing every node with its content-brick list or a No bricks yet placeholder.'
          : 'Bird\'s Eye View: no content bricks were found, so every node is marked No bricks yet.')
        : '');
    }
  }

  function collectNodes(node, nodes) {
    if (!node) return nodes;

    nodes.push(node);
    (node.children || []).forEach((child) => collectNodes(child, nodes));
    return nodes;
  }

  function cacheHorizontalRects(instance) {
    collectNodes(instance.state && instance.state.data, []).forEach((node) => {
      if (!node.state || !node.state.rect) return;

      if (!node.state.horizontalRect) {
        node.state.horizontalRect = {
          x: node.state.rect.x,
          y: node.state.rect.y,
          width: node.state.rect.width,
          height: node.state.rect.height,
        };
      }
    });
  }

  function updateStateBounds(instance) {
    const nodes = collectNodes(instance.state && instance.state.data, [])
      .filter((node) => node.state && node.state.rect);

    if (!nodes.length) return;

    instance.state.rect = {
      x1: Math.min(...nodes.map((node) => node.state.rect.x)),
      y1: Math.min(...nodes.map((node) => node.state.rect.y)),
      x2: Math.max(...nodes.map((node) => node.state.rect.x + node.state.rect.width)),
      y2: Math.max(...nodes.map((node) => node.state.rect.y + node.state.rect.height)),
    };
  }

  function getVisibleChildren(node) {
    if (node.payload && node.payload.fold) return [];

    return node.children || [];
  }

  function collectVisibleNodes(node, depth, nodes) {
    if (!node) return nodes;

    nodes.push({ node, depth });
    getVisibleChildren(node).forEach((child) => collectVisibleNodes(child, depth + 1, nodes));
    return nodes;
  }

  function getVerticalLevelTops(root) {
    const levelHeights = [];

    collectVisibleNodes(root, 0, []).forEach(({ node, depth }) => {
      const rect = node.state && node.state.horizontalRect;
      if (!rect) return;

      levelHeights[depth] = Math.max(levelHeights[depth] || 0, rect.height);
    });

    return levelHeights.reduce((tops, height, index) => {
      if (index === 0) {
        tops[index] = 0;
      } else {
        tops[index] = tops[index - 1] + (levelHeights[index - 1] || 0) + 112;
      }

      return tops;
    }, []);
  }

  function measureVerticalSubtree(node) {
    const rect = node.state.horizontalRect;
    const children = getVisibleChildren(node);
    const childLayouts = children.map((child) => measureVerticalSubtree(child));
    const childGap = 56;
    const childrenWidth = childLayouts.reduce((total, layout) => total + layout.width, 0)
      + Math.max(0, childLayouts.length - 1) * childGap;
    const width = Math.max(rect.width, childrenWidth);

    node.state.verticalLayout = {
      childGap,
      childLayouts,
      width,
    };

    return node.state.verticalLayout;
  }

  function positionVerticalSubtree(node, left, depth, levelTops) {
    const layout = node.state.verticalLayout;
    const rect = node.state.horizontalRect;
    const children = getVisibleChildren(node);
    const childrenWidth = layout.childLayouts.reduce((total, childLayout) => total + childLayout.width, 0)
      + Math.max(0, layout.childLayouts.length - 1) * layout.childGap;

    node.state.rect = {
      x: left + layout.width / 2 - rect.width / 2,
      y: levelTops[depth] || 0,
      width: rect.width,
      height: rect.height,
    };

    let childLeft = left + (layout.width - childrenWidth) / 2;

    children.forEach((child, index) => {
      const childLayout = layout.childLayouts[index];
      positionVerticalSubtree(child, childLeft, depth + 1, levelTops);
      childLeft += childLayout.width + layout.childGap;
    });
  }

  function projectLayoutRects(instance, layout) {
    cacheHorizontalRects(instance);

    const nodes = collectNodes(instance.state && instance.state.data, []);
    nodes.forEach((node) => {
      if (!node.state || !node.state.horizontalRect) return;

      const rect = node.state.horizontalRect;

      node.state.rect = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    });

    if (layout === 'vertical' && instance.state.data && instance.state.data.state) {
      measureVerticalSubtree(instance.state.data);
      positionVerticalSubtree(instance.state.data, 0, 0, getVerticalLevelTops(instance.state.data));
    }

    updateStateBounds(instance);
  }

  function getLinkPath(link, layout) {
    const sourceRect = link.source.state.rect;
    const targetRect = link.target.state.rect;

    if (layout === 'vertical') {
      const sourceX = sourceRect.x + sourceRect.width / 2;
      const sourceY = sourceRect.y + sourceRect.height;
      const targetX = targetRect.x + targetRect.width / 2;
      const targetY = targetRect.y;
      const middleY = (sourceY + targetY) / 2;

      return `M${sourceX},${sourceY}C${sourceX},${middleY} ${targetX},${middleY} ${targetX},${targetY}`;
    }

    const sourceX = sourceRect.x + sourceRect.width;
    const sourceY = sourceRect.y + sourceRect.height;
    const targetX = targetRect.x;
    const targetY = targetRect.y + targetRect.height;
    const middleX = (sourceX + targetX) / 2;

    return `M${sourceX},${sourceY}C${middleX},${sourceY} ${middleX},${targetY} ${targetX},${targetY}`;
  }

  function applyLayout(container) {
    const instance = container.markmapInstance;
    if (!instance || !instance.state || !instance.state.data) return;

    const layout = getLayout(container);
    projectLayoutRects(instance, layout);
    const nodesByPath = new Map();
    const linksByPath = new Map();

    collectVisibleNodes(instance.state.data, 0, []).forEach(({ node }) => {
      if (!node.state || !node.state.path) return;

      nodesByPath.set(node.state.path, node);
      getVisibleChildren(node).forEach((child) => {
        linksByPath.set(child.state.path, { source: node, target: child });
      });
    });

    if (instance.g) {
      if (layout === 'vertical') {
        instance.g.interrupt();
        instance.g.selectAll('*').interrupt();
      }

      instance.g.selectAll('g.markmap-node')
        .filter((node) => layout !== 'vertical' || nodesByPath.has(node.state.path))
        .attr('transform', (node) => `translate(${node.state.rect.x},${node.state.rect.y})`);

      instance.g.selectAll('path.markmap-link')
        .filter((link) => layout !== 'vertical' || linksByPath.has(link.target.state.path))
        .attr('d', (link) => getLinkPath(link, layout));
    }

    container.querySelectorAll('g.markmap-node').forEach((element) => {
      const path = element.getAttribute('data-path');
      if (layout === 'vertical' && path && !nodesByPath.has(path)) {
        element.remove();
        return;
      }

      const node = element.__data__ || nodesByPath.get(path);
      if (!node || !node.state || !node.state.rect) return;

      element.setAttribute('transform', `translate(${node.state.rect.x},${node.state.rect.y})`);
    });

    container.querySelectorAll('path.markmap-link').forEach((element) => {
      const path = element.getAttribute('data-path');
      if (layout === 'vertical' && path && !linksByPath.has(path)) {
        element.remove();
        return;
      }

      const link = element.__data__ || linksByPath.get(path);
      if (!link || !link.source || !link.target) return;

      element.setAttribute('d', getLinkPath(link, layout));
    });
  }

  function finishRenderedLayout(container, plan, shouldFit) {
    const instance = container.markmapInstance;
    if (!instance) return Promise.resolve(null);

    applyLayout(container);
    decorateMindmap(container, plan);

    if (shouldFit !== false) {
      return instance.fit();
    }

    return Promise.resolve(null);
  }

  function scheduleRenderedLayout(container, plan, shouldFit) {
    const instance = container.markmapInstance;
    if (!instance || !plan) return;

    const settleToken = (container.layoutSettleToken || 0) + 1;
    const duration = instance.options && instance.options.duration ? instance.options.duration : 500;
    const settleDelays = getLayout(container) === 'vertical'
      ? [0, 80, 180, 320, duration + 80, duration * 2 + 160, duration * 3 + 240]
      : [0, duration + 80, duration * 2 + 160, duration * 3 + 240];
    container.layoutSettleToken = settleToken;

    settleDelays.forEach((delay, index) => {
      window.setTimeout(() => {
        if (container.layoutSettleToken !== settleToken) return;
        finishRenderedLayout(container, plan, index === settleDelays.length - 1 ? shouldFit : false).catch((error) => {
          setStatus(container, error.message, true);
        });
      }, delay);
    });
  }

  function renderMarkdown(container, markdown, shouldFit) {
    const svg = container.querySelector('.interactive-markdown-mindmap__svg');
    const transformer = getTransformer();
    const plan = parseContentPlan(markdown || DEFAULT_MARKDOWN, container);
    const renderToken = (container.markmapRenderToken || 0) + 1;
    container.markmapRenderToken = renderToken;
    container.currentMindmapPlan = plan;
    activatePlanning(container, plan.planning);
    activateBirdseye(container, plan.birdseye);
    activateLayout(container, getLayout(container));
    const result = transformer.transform(plan.birdseye ? plan.birdseyeMarkdown : plan.cleanMarkdown);
    const options = window.markmap.deriveOptions(result.frontmatter && result.frontmatter.markmap);
    let instance = container.markmapInstance;

    if (!instance) {
      instance = window.markmap.Markmap.create(svg, options);
      container.markmapInstance = instance;
    } else {
      instance.setOptions(options);
    }

    Promise.resolve(instance.setData(result.root)).then(() => {
      if (container.markmapRenderToken !== renderToken) return null;

      scheduleRenderedLayout(container, plan, shouldFit);
      return null;
    }).catch((error) => {
      setStatus(container, error.message, true);
    });
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
    activatePlanning(container, getPlanningMode(container));
    activateBirdseye(container, isBirdseye(container));
    activateLayout(container, getLayout(container));

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

    container.querySelectorAll('.interactive-markdown-mindmap__planning').forEach((button) => {
      button.addEventListener('click', () => {
        activatePlanning(container, button.getAttribute('data-planning-mode') || 'structure-first');
        renderMarkdown(container, textarea ? textarea.value : embeddedMarkdown, true);
      });
    });

    container.querySelectorAll('.interactive-markdown-mindmap__birdseye').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        activateBirdseye(container, !isBirdseye(container));
        if (container.getAttribute('data-mode') === 'sitemap') {
          renderSitemap(container).catch((error) => setStatus(container, error.message, true));
        } else {
          renderMarkdown(container, textarea ? textarea.value : embeddedMarkdown, true);
        }
      });
    });

    container.querySelectorAll('.interactive-markdown-mindmap__layout').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        activateLayout(container, button.getAttribute('data-layout') || 'horizontal');

        if (container.markmapInstance) {
          scheduleRenderedLayout(container, container.currentMindmapPlan, true);
        }
      });
    });

    const svg = container.querySelector('.interactive-markdown-mindmap__svg');
    if (svg) {
      svg.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element) || !target.closest('g.markmap-node circle')) return;
        if (getLayout(container) !== 'vertical') return;

        scheduleRenderedLayout(container, container.currentMindmapPlan, true);
      }, true);
    }

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

      window.elementorFrontend.hooks.addAction('frontend/element_ready/interactive_markdown_mindmap.default', ($scope) => {
        initializeAll($scope && $scope[0] ? $scope[0] : document);
      });

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
