(function () {
  const DEFAULT_MARKDOWN = '# Mindmap\n\n## Homepage\n- [brick][header] Header\n- [brick][hero] Hero\n- [brick][features] Services\n\n## Contact\n- [brick][form] Contact Form\n- [brick][footer] Footer\n';
  const initializedContainers = new WeakSet();
  const BRICK_TYPES = [
    'accordion', 'article', 'articles', 'audio', 'blog', 'buttons', 'bullets', 'cards', 'carousel', 'catalog',
    'chart', 'checklist', 'contact', 'cta', 'divider', 'dropdown', 'faq', 'features', 'filter', 'footer',
    'form', 'gallery', 'hamburger', 'header', 'hero', 'image', 'images', 'invoice', 'list', 'loading',
    'map', 'media', 'messengers', 'navigation', 'pagination', 'plans', 'post-thread', 'profile', 'rating',
    'search', 'sidebar', 'sign-in', 'slider', 'social', 'subscribe', 'table', 'tabs', 'team', 'text',
    'timeline', 'toggles', 'upload', 'video',
  ];
  const BRICK_TYPE_ALIASES = {
    button: 'buttons',
    card: 'cards',
    ctaimage: 'cta',
    images: 'image',
    img: 'image',
    navbar: 'navigation',
    nav: 'navigation',
    newsletter: 'subscribe',
    signin: 'sign-in',
    textvideo: 'video',
  };

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setStatus(container, message, isError) {
    const status = container.querySelector('.baiwei-markdown-mindmap__status');

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

  function getBrickStyle(container) {
    return container.getAttribute('data-brick-style') === 'text' ? 'text' : 'wireframe';
  }

  function activateMode(container, mode) {
    container.setAttribute('data-mode', mode);
    container.querySelectorAll('.baiwei-markdown-mindmap__mode').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-mode') === mode);
    });
  }

  function activatePlanning(container, planningMode) {
    container.setAttribute('data-planning-mode', planningMode);
    container.querySelectorAll('.baiwei-markdown-mindmap__planning').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-planning-mode') === planningMode);
    });
  }

  function activateBirdseye(container, enabled) {
    container.setAttribute('data-birdseye', enabled ? 'true' : 'false');
    container.querySelectorAll('.baiwei-markdown-mindmap__birdseye').forEach((button) => {
      button.classList.toggle('is-active', enabled);
      button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    });
  }

  function activateLayout(container, layout) {
    const nextLayout = layout === 'vertical' ? 'vertical' : 'horizontal';
    container.setAttribute('data-layout', nextLayout);

    container.querySelectorAll('.baiwei-markdown-mindmap__layout').forEach((button) => {
      const buttonLayout = button.getAttribute('data-layout');
      const isToggleOnly = button.classList.contains('baiwei-markdown-mindmap__icon-button');

      if (isToggleOnly) {
        button.setAttribute('data-layout', nextLayout === 'vertical' ? 'horizontal' : 'vertical');
        button.classList.toggle('is-active', nextLayout === 'vertical');
      } else {
        button.classList.toggle('is-active', buttonLayout === nextLayout);
      }
    });
  }

  function activateBrickStyle(container, style) {
    const nextStyle = style === 'text' ? 'text' : 'wireframe';
    container.setAttribute('data-brick-style', nextStyle);

    container.querySelectorAll('.baiwei-markdown-mindmap__brick-style').forEach((button) => {
      const buttonStyle = button.getAttribute('data-brick-style');
      const isToggleOnly = button.classList.contains('baiwei-markdown-mindmap__icon-button');

      if (isToggleOnly) {
        button.setAttribute('data-brick-style', nextStyle === 'wireframe' ? 'text' : 'wireframe');
        button.classList.toggle('is-active', nextStyle === 'wireframe');
        button.setAttribute('aria-pressed', nextStyle === 'wireframe' ? 'true' : 'false');
      } else {
        button.classList.toggle('is-active', buttonStyle === nextStyle);
        button.setAttribute('aria-pressed', buttonStyle === nextStyle ? 'true' : 'false');
      }
    });
  }

  function getEmbeddedMarkdown(container) {
    const source = container.querySelector('.baiwei-markdown-mindmap__source');

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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function slugifyBrickType(value) {
    const slug = stripMarkdown(value || '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return BRICK_TYPE_ALIASES[slug] || slug || 'text';
  }

  function inferBrickType(type, name) {
    const explicitType = slugifyBrickType(type);

    if (explicitType && explicitType !== 'text') {
      return explicitType;
    }

    const normalizedName = normalizeLabel(name);
    const tests = [
      ['hero', /\b(hero|banner|masthead)\b/],
      ['header', /\b(header|navigation|nav|menu|top bar)\b/],
      ['footer', /\b(footer)\b/],
      ['form', /\b(form|enquiry|signup|sign up|contact form)\b/],
      ['image', /\b(image|photo|gallery|visual|map)\b/],
      ['video', /\b(video|media|watch)\b/],
      ['list', /\b(list|resources|positions|coverage|addresses|stats)\b/],
      ['team', /\b(team|people|employees|leadership)\b/],
      ['cards', /\b(cards|services|features|products|category)\b/],
      ['faq', /\b(faq|questions)\b/],
      ['timeline', /\b(timeline|history|story)\b/],
      ['cta', /\b(cta|call to action|campaign)\b/],
      ['chart', /\b(chart|data|stats|numbers)\b/],
      ['table', /\b(table|invoice|pricing)\b/],
      ['subscribe', /\b(subscribe|newsletter)\b/],
    ];
    const match = tests.find((item) => item[1].test(normalizedName));

    return match ? match[0] : explicitType;
  }

  function getBrickTypeLabel(type) {
    return slugifyBrickType(type).replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
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

    const typePrefix = working.match(/^\[([a-z0-9-]+)\]\s*/i);
    if (typePrefix) {
      type = typePrefix[1].toLowerCase();
      working = working.slice(typePrefix[0].length).trim();
    }

    const typeSuffix = working.match(/\s+\[([a-z0-9-]+)\]\s*$/i);
    if (typeSuffix) {
      type = typeSuffix[1].toLowerCase();
      working = working.slice(0, typeSuffix.index).trim();
    }

    const name = stripMarkdown(working || 'Content Brick');

    return {
      name,
      type: inferBrickType(type, name),
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
    return `${' '.repeat(indent)}- ${getBrickTypeLabel(brick.type).toUpperCase()} - ${brick.name}`;
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
    svg.querySelectorAll('.baiwei-markdown-mindmap__badge, .baiwei-markdown-mindmap__prompt').forEach((node) => node.remove());
    svg.querySelectorAll('.baiwei-markdown-mindmap__mainpage-node').forEach((node) => {
      node.classList.remove('baiwei-markdown-mindmap__mainpage-node');
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

  function getPlanBrickLabels(plan) {
    const labels = new Set(['TODO']);

    plan.bricksByLabel.forEach((group) => {
      group.bricks.forEach((brick) => labels.add(getBrickTypeLabel(brick.type).toUpperCase()));
    });

    BRICK_TYPES.forEach((type) => labels.add(getBrickTypeLabel(type).toUpperCase()));

    return [...labels].sort((a, b) => b.length - a.length).map(escapeRegExp);
  }

  function parseBrickStackText(text, plan) {
    const labels = getPlanBrickLabels(plan);
    const pattern = new RegExp(`[\\-–—]\\s*(${labels.join('|')})\\s*[\\-–—]\\s*`, 'gi');
    const matches = [...String(text || '').matchAll(pattern)];

    if (!matches.length) return [];

    return matches.map((match, index) => {
      const start = match.index + match[0].length;
      const end = matches[index + 1] ? matches[index + 1].index : String(text || '').length;
      const name = String(text || '').slice(start, end).replace(/\s+/g, ' ').trim();

      return {
        name: name || 'Content Brick',
        type: slugifyBrickType(match[1]),
      };
    });
  }

  function findBrickGroupKey(plan, bricks, usedKeys) {
    let fallbackKey = '';
    let bestScore = 0;
    const parsedNames = bricks.map((brick) => normalizeLabel(brick.name)).filter(Boolean);

    plan.bricksByLabel.forEach((group, key) => {
      if (usedKeys.has(key)) return;

      if (group.bricks.length === bricks.length) {
        const isExactMatch = group.bricks.every((brick, index) => {
          const item = bricks[index];
          return normalizeLabel(brick.name) === normalizeLabel(item.name)
            && slugifyBrickType(brick.type) === slugifyBrickType(item.type);
        });

        if (isExactMatch) {
          fallbackKey = key;
          bestScore = Number.MAX_SAFE_INTEGER;
          return;
        }
      }

      if (bestScore === Number.MAX_SAFE_INTEGER) return;

      const groupNames = group.bricks.map((brick) => normalizeLabel(brick.name)).filter(Boolean);
      const nameMatches = parsedNames.filter((name) => groupNames.includes(name)).length;
      const typeMatches = group.bricks.filter((brick, index) => {
        const item = bricks[index];
        return item && slugifyBrickType(brick.type) === slugifyBrickType(item.type);
      }).length;
      const score = nameMatches * 10 + typeMatches - Math.abs(group.bricks.length - bricks.length);

      if (nameMatches && score > bestScore) {
        fallbackKey = key;
        bestScore = score;
      }
    });

    if (fallbackKey) {
      usedKeys.add(fallbackKey);
    }

    return fallbackKey;
  }

  function getWireframePattern(type) {
    const normalized = slugifyBrickType(type);
    const gallery = '<span></span><span></span><span></span>';
    const textLines = '<i></i><i></i><i></i>';

    if (['image', 'gallery', 'images'].includes(normalized)) return `<b></b><em>${gallery}</em>`;
    if (['hero', 'cta'].includes(normalized)) return '<b></b><i></i><i></i><small></small>';
    if (['header', 'footer', 'navigation'].includes(normalized)) return '<i></i><i></i><i></i><small></small>';
    if (['form', 'sign-in', 'subscribe', 'upload'].includes(normalized)) return '<i></i><i></i><b></b><small></small>';
    if (['video', 'audio', 'media'].includes(normalized)) return '<i></i><b></b><i></i>';
    if (['list', 'bullets', 'checklist', 'faq', 'accordion'].includes(normalized)) return `${textLines}<i></i>`;
    if (['cards', 'features', 'team', 'catalog', 'plans', 'articles'].includes(normalized)) return `<em>${gallery}</em><i></i><i></i>`;
    if (['table', 'invoice'].includes(normalized)) return '<b></b><b></b><b></b><i></i><i></i>';
    if (['map', 'contact'].includes(normalized)) return '<b></b><em><span></span><span></span></em><i></i>';
    if (['slider', 'carousel'].includes(normalized)) return '<b></b><i></i><small></small>';
    if (['chart', 'timeline', 'steps'].includes(normalized)) return '<b></b><i></i><i></i><i></i>';
    if (['divider', 'loading'].includes(normalized)) return '<i></i>';

    return textLines;
  }

  function renderBrickCard(brick, parentKey, index) {
    const type = slugifyBrickType(brick.type);
    const typeLabel = getBrickTypeLabel(type);
    const isReadonly = parentKey.indexOf('__readonly_') === 0;

    return `
      <div class="imm-wireframe-card imm-wireframe-card--${escapeHtml(type)}" draggable="${isReadonly ? 'false' : 'true'}" data-parent-key="${escapeHtml(parentKey)}" data-index="${index}" data-name="${escapeHtml(brick.name)}" data-type="${escapeHtml(type)}">
        <div class="imm-wireframe-card__bar" aria-hidden="true">
          <span></span><span></span><span></span>
          ${isReadonly ? '' : `<button type="button" class="imm-wireframe-card__control imm-wireframe-card__remove" aria-label="Remove ${escapeHtml(brick.name)}">×</button>`}
        </div>
        <div class="imm-wireframe-card__title">
          <strong>${escapeHtml(brick.name)}</strong>
          <small>${escapeHtml(typeLabel)}</small>
        </div>
        <div class="imm-wireframe-card__preview" aria-hidden="true">${getWireframePattern(type)}</div>
        ${isReadonly ? '' : `<div class="imm-wireframe-card__actions">
          <button type="button" class="imm-wireframe-card__control imm-wireframe-card__up" aria-label="Move ${escapeHtml(brick.name)} up">↑</button>
          <button type="button" class="imm-wireframe-card__control imm-wireframe-card__down" aria-label="Move ${escapeHtml(brick.name)} down">↓</button>
        </div>`}
      </div>
    `;
  }

  function renderBrickStacks(container, plan) {
    if (!plan.birdseye) return;
    if (getBrickStyle(container) !== 'wireframe') return;

    const usedKeys = new Set();

    container.querySelectorAll('.markmap-foreign > div > div').forEach((nodeContent, index) => {
      if (nodeContent.querySelector('.imm-brick-stack')) return;

      const bricks = parseBrickStackText(nodeContent.textContent || '', plan);
      if (!bricks.length) return;

      const parentKey = findBrickGroupKey(plan, bricks, usedKeys) || `__readonly_${index}`;

      nodeContent.innerHTML = `
        <div class="imm-brick-stack" data-parent-key="${escapeHtml(parentKey)}">
          ${bricks.map((brick, index) => renderBrickCard(brick, parentKey, index)).join('')}
        </div>
      `;
    });
  }

  function resizeBrickStackNodes(container) {
    let resized = false;

    container.querySelectorAll('.imm-brick-stack').forEach((stack) => {
      const nodeElement = stack.closest('g.markmap-node');
      const foreignObject = stack.closest('foreignObject');
      const node = nodeElement && nodeElement.__data__;

      if (!node || !node.state || !node.state.horizontalRect || !foreignObject) return;

      const paddingX = 18;
      const nextWidth = Math.max(node.state.horizontalRect.width, stack.scrollWidth + paddingX);
      const nextHeight = Math.max(node.state.horizontalRect.height, stack.scrollHeight + 8);

      if (Math.abs(nextWidth - node.state.horizontalRect.width) > 1 || Math.abs(nextHeight - node.state.horizontalRect.height) > 1) {
        node.state.horizontalRect.width = nextWidth;
        node.state.horizontalRect.height = nextHeight;
        node.state.rect.width = nextWidth;
        node.state.rect.height = nextHeight;
        foreignObject.setAttribute('width', String(nextWidth));
        foreignObject.setAttribute('height', String(nextHeight));
        resized = true;
      }
    });

    return resized;
  }

  function syncRenderedGeometry(container) {
    const instance = container.markmapInstance;
    if (!instance || !instance.state || !instance.state.data) return;

    const layout = getLayout(container);

    container.querySelectorAll('g.markmap-node').forEach((element) => {
      const node = element.__data__;
      if (!node || !node.state || !node.state.rect) return;

      element.querySelectorAll('foreignObject').forEach((foreignObject) => {
        const paddingX = instance.options && typeof instance.options.paddingX === 'number' ? instance.options.paddingX : 8;
        foreignObject.setAttribute('width', String(Math.max(0, node.state.rect.width - paddingX * 2)));
        foreignObject.setAttribute('height', String(node.state.rect.height));
      });

      element.querySelectorAll('line').forEach((line) => {
        line.setAttribute('x1', '-1');
        line.setAttribute('x2', String(node.state.rect.width + 2));
        line.setAttribute('y1', String(node.state.rect.height));
        line.setAttribute('y2', String(node.state.rect.height));
      });
    });

    container.querySelectorAll('path.markmap-link').forEach((element) => {
      const link = element.__data__;
      if (!link || !link.source || !link.target || !link.source.state || !link.target.state) return;

      element.setAttribute('d', getLinkPath(link, layout));
    });
  }

  function hasRawBrickStackText(container, plan) {
    if (!plan || !plan.birdseye || getBrickStyle(container) !== 'wireframe') return false;

    return [...container.querySelectorAll('.markmap-foreign > div > div')].some((nodeContent) => (
      !nodeContent.querySelector('.imm-brick-stack')
      && parseBrickStackText(nodeContent.textContent || '', plan).length > 0
    ));
  }

  function decorateMindmap(container, plan) {
    const svg = container.querySelector('.baiwei-markdown-mindmap__svg');
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
        appendDecoration(text, `${brickGroup.bricks.length} bricks`, 'baiwei-markdown-mindmap__badge');
      }

      if (plan.birdseye && !plan.hasBricks && label) {
        appendDecoration(text, 'No bricks yet', 'baiwei-markdown-mindmap__badge');
      }

      if (plan.planning === 'mainpage-first' && (label === rootKey || (!rootKey && index === 0))) {
        const node = text.closest('g');
        if (node) node.classList.add('baiwei-markdown-mindmap__mainpage-node');

        appendDecoration(text, brickGroup && brickGroup.bricks.length ? 'mainpage ready' : 'start here', 'baiwei-markdown-mindmap__prompt');
      }
    });

    renderBrickStacks(container, plan);

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

  function groupChildLayouts(childLayouts, maxRowWidth, childGap) {
    const rows = [];

    childLayouts.forEach((layout, index) => {
      const lastRow = rows[rows.length - 1];
      const nextWidth = lastRow
        ? lastRow.width + childGap + layout.width
        : layout.width;

      if (!lastRow || (lastRow.layouts.length && nextWidth > maxRowWidth)) {
        rows.push({
          height: layout.height,
          indexes: [index],
          layouts: [layout],
          width: layout.width,
        });
        return;
      }

      lastRow.height = Math.max(lastRow.height, layout.height);
      lastRow.indexes.push(index);
      lastRow.layouts.push(layout);
      lastRow.width = nextWidth;
    });

    return rows;
  }

  function measureVerticalSubtree(node, options, depth) {
    const rect = node.state.horizontalRect;
    const children = getVisibleChildren(node);
    const childLayouts = children.map((child) => measureVerticalSubtree(child, options, depth + 1));
    const childGap = depth === 0 ? 72 : 56;
    const levelGap = depth === 0 ? 128 : 112;
    const rowGap = 104;
    const childrenWidth = childLayouts.reduce((total, layout) => total + layout.width, 0)
      + Math.max(0, childLayouts.length - 1) * childGap;
    const shouldWrap = depth === 0 && childLayouts.length > 3 && childrenWidth > options.maxRowWidth;
    const rows = shouldWrap ? groupChildLayouts(childLayouts, options.maxRowWidth, childGap) : [];
    const rowWidth = rows.length ? Math.max(...rows.map((row) => row.width)) : childrenWidth;
    const childrenHeight = rows.length
      ? rows.reduce((total, row) => total + row.height, 0) + Math.max(0, rows.length - 1) * rowGap
      : Math.max(0, ...childLayouts.map((layout) => layout.height));
    const width = Math.max(rect.width, rowWidth);
    const height = rect.height + (children.length ? levelGap + childrenHeight : 0);

    node.state.verticalLayout = {
      childGap,
      childLayouts,
      height,
      levelGap,
      rowGap,
      rows,
      width,
    };

    return node.state.verticalLayout;
  }

  function positionVerticalSubtree(node, left, top) {
    const layout = node.state.verticalLayout;
    const rect = node.state.horizontalRect;
    const children = getVisibleChildren(node);

    node.state.rect = {
      x: left + layout.width / 2 - rect.width / 2,
      y: top,
      width: rect.width,
      height: rect.height,
    };

    if (layout.rows && layout.rows.length) {
      let rowTop = top + rect.height + layout.levelGap;

      layout.rows.forEach((row) => {
        let rowLeft = left + (layout.width - row.width) / 2;

        row.layouts.forEach((childLayout, rowIndex) => {
          positionVerticalSubtree(children[row.indexes[rowIndex]], rowLeft, rowTop);
          rowLeft += childLayout.width + layout.childGap;
        });

        rowTop += row.height + layout.rowGap;
      });

      return;
    }

    const childrenWidth = layout.childLayouts.reduce((total, childLayout) => total + childLayout.width, 0)
      + Math.max(0, layout.childLayouts.length - 1) * layout.childGap;
    let childLeft = left + (layout.width - childrenWidth) / 2;
    const childTop = top + rect.height + layout.levelGap;

    children.forEach((child, index) => {
      const childLayout = layout.childLayouts[index];
      positionVerticalSubtree(child, childLeft, childTop);
      childLeft += childLayout.width + layout.childGap;
    });
  }

  function projectLayoutRects(instance, layout, container) {
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
      const svg = container && container.querySelector('.baiwei-markdown-mindmap__svg');
      const viewportWidth = svg && svg.clientWidth ? svg.clientWidth : 1200;
      const maxRowWidth = Math.max(1800, Math.min(3200, viewportWidth * 1.8));

      measureVerticalSubtree(instance.state.data, { maxRowWidth }, 0);
      positionVerticalSubtree(instance.state.data, 0, 0);
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

  function restoreVerticalSvgVisibility(container) {
    if (getLayout(container) !== 'vertical') return;

    container.querySelectorAll('g.markmap-node').forEach((element) => {
      const node = element.__data__;

      element.querySelectorAll('line').forEach((line) => {
        line.setAttribute('stroke-width', '1.4');
        line.setAttribute('vector-effect', 'non-scaling-stroke');
        line.style.opacity = '1';
        line.style.strokeWidth = '1.4px';
      });

      element.querySelectorAll('circle').forEach((circle) => {
        if (node && (node.children || []).length) {
          circle.setAttribute('r', '5.5');
        }

        circle.setAttribute('stroke-width', '1.6');
        circle.setAttribute('vector-effect', 'non-scaling-stroke');
        circle.style.opacity = '1';
        circle.style.strokeWidth = '1.6px';
      });
    });

    container.querySelectorAll('path.markmap-link').forEach((element) => {
      if (element.style.display === 'none') return;

      element.setAttribute('stroke-width', '1.4');
      element.setAttribute('vector-effect', 'non-scaling-stroke');
      element.style.opacity = '1';
      element.style.strokeWidth = '1.4px';
    });
  }

  function applyLayout(container) {
    const instance = container.markmapInstance;
    if (!instance || !instance.state || !instance.state.data) return;

    const layout = getLayout(container);
    if (layout !== 'vertical') {
      container.querySelectorAll('g.markmap-node, path.markmap-link').forEach((element) => {
        element.style.display = '';
      });
      return;
    }

    projectLayoutRects(instance, layout, container);
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
      instance.g.interrupt();
      instance.g.selectAll('*').interrupt();

      instance.g.selectAll('g.markmap-node')
        .filter((node) => nodesByPath.has(node.state.path))
        .attr('transform', (node) => `translate(${node.state.rect.x},${node.state.rect.y})`);

      instance.g.selectAll('path.markmap-link')
        .filter((link) => linksByPath.has(link.target.state.path))
        .attr('d', (link) => getLinkPath(link, layout));
    }

    container.querySelectorAll('g.markmap-node').forEach((element) => {
      const path = element.getAttribute('data-path');
      if (path && !nodesByPath.has(path)) {
        element.style.display = 'none';
        return;
      }

      const node = element.__data__ || nodesByPath.get(path);
      if (!node || !node.state || !node.state.rect) return;

      element.style.display = '';
      element.style.opacity = '1';
      element.querySelectorAll('foreignObject, text, line, circle').forEach((child) => {
        child.style.opacity = '1';
      });
      element.querySelectorAll('foreignObject').forEach((foreignObject) => {
        const paddingX = instance.options && typeof instance.options.paddingX === 'number' ? instance.options.paddingX : 8;
        foreignObject.setAttribute('width', String(Math.max(0, node.state.rect.width - paddingX * 2)));
        foreignObject.setAttribute('height', String(node.state.rect.height));
      });
      element.querySelectorAll('line').forEach((line) => {
        line.setAttribute('x1', '-1');
        line.setAttribute('x2', String(node.state.rect.width + 2));
        line.setAttribute('y1', String(node.state.rect.height));
        line.setAttribute('y2', String(node.state.rect.height));
      });
      element.querySelectorAll('circle').forEach((circle) => {
        if ((node.children || []).length) {
          circle.setAttribute('r', '5.5');
        }
      });
      element.setAttribute('transform', `translate(${node.state.rect.x},${node.state.rect.y})`);
    });

    container.querySelectorAll('path.markmap-link').forEach((element) => {
      const path = element.getAttribute('data-path');
      if (path && !linksByPath.has(path)) {
        element.style.display = 'none';
        return;
      }

      const link = element.__data__ || linksByPath.get(path);
      if (!link || !link.source || !link.target) return;

      element.style.display = '';
      element.style.opacity = '1';
      element.setAttribute('d', getLinkPath(link, layout));
    });

    restoreVerticalSvgVisibility(container);
  }

  function finishRenderedLayout(container, plan, shouldFit) {
    const instance = container.markmapInstance;
    if (!instance) return Promise.resolve(null);

    applyLayout(container);
    decorateMindmap(container, plan);

    if (resizeBrickStackNodes(container)) {
      applyLayout(container);
    }
    syncRenderedGeometry(container);

    if (shouldFit !== false) {
      return Promise.resolve(instance.fit()).then(() => {
        decorateMindmap(container, plan);
        if (resizeBrickStackNodes(container)) {
          applyLayout(container);
        }
        syncRenderedGeometry(container);
        restoreVerticalSvgVisibility(container);
        return null;
      });
    }

    restoreVerticalSvgVisibility(container);
    return Promise.resolve(null);
  }

  function scheduleRenderedLayout(container, plan, shouldFit) {
    const instance = container.markmapInstance;
    if (!instance || !plan) return;

    const settleToken = (container.layoutSettleToken || 0) + 1;
    const duration = instance.options && instance.options.duration ? instance.options.duration : 500;
    const settleDelays = getLayout(container) === 'vertical'
      ? [0, 80, 180, 320, duration + 80, duration * 2 + 160, duration * 3 + 240, duration * 5 + 400]
      : [duration + 80, duration * 2 + 160, duration * 3 + 240];
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
    const svg = container.querySelector('.baiwei-markdown-mindmap__svg');
    const transformer = getTransformer();
    const plan = parseContentPlan(markdown || DEFAULT_MARKDOWN, container);
    const layout = getLayout(container);
    const brickStyle = getBrickStyle(container);
    const renderToken = (container.markmapRenderToken || 0) + 1;
    container.markmapRenderToken = renderToken;
    container.currentMindmapPlan = plan;
    activatePlanning(container, plan.planning);
    activateBirdseye(container, plan.birdseye);
    activateLayout(container, layout);
    const result = transformer.transform(plan.birdseye ? plan.birdseyeMarkdown : plan.cleanMarkdown);
    const options = window.markmap.deriveOptions(result.frontmatter && result.frontmatter.markmap);
    let instance = container.markmapInstance;

    if (instance && (layout === 'vertical' || container.renderedBrickStyle !== brickStyle)) {
      if (instance.destroy) instance.destroy();
      svg.innerHTML = '';
      container.markmapInstance = null;
      instance = null;
    }

    if (!instance) {
      instance = window.markmap.Markmap.create(svg, options);
      container.markmapInstance = instance;
    } else {
      instance.setOptions(options);
    }

    Promise.resolve(instance.setData(result.root)).then(() => {
      if (container.markmapRenderToken !== renderToken) return null;

      container.renderedBrickStyle = brickStyle;
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

  function getEditableMarkdown(container, textarea, embeddedMarkdown) {
    if (textarea) return textarea.value;

    return getEmbeddedMarkdown(container) || embeddedMarkdown || DEFAULT_MARKDOWN;
  }

  function serializeBrickLine(indent, brick) {
    return `${' '.repeat(indent)}- [brick][${slugifyBrickType(brick.type)}] ${brick.name}`;
  }

  function rewriteMarkdownBrickGroup(markdown, parentKey, nextBricks) {
    const lines = (markdown || DEFAULT_MARKDOWN).split(/\n/);
    const stack = {};
    const output = [];
    let lastContentLabel = '';
    let rootLabel = '';
    let inserted = false;
    let sourceIndent = 0;

    lines.forEach((line) => {
      const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+)$/);
      if (heading) {
        const indent = (heading[1].length - 1) * 2;
        const label = stripMarkdown(heading[2]);
        stack[indent] = label;
        lastContentLabel = label;
        Object.keys(stack).map(Number).filter((key) => key > indent).forEach((key) => delete stack[key]);
        if (!rootLabel) rootLabel = label;
        output.push(line);
        return;
      }

      const list = line.match(/^(\s*)([-*+])\s+(.+)$/);
      if (!list) {
        output.push(line);
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
        output.push(line);
        return;
      }

      const currentParent = lastContentLabel || getNearestParent(stack, indent) || rootLabel || 'Mindmap';

      if (normalizeLabel(currentParent) !== parentKey) {
        output.push(line);
        return;
      }

      sourceIndent = sourceIndent || indent;

      if (!inserted) {
        nextBricks.forEach((item) => output.push(serializeBrickLine(sourceIndent, item)));
        inserted = true;
      }
    });

    return output.join('\n');
  }

  function getStackBricks(stack) {
    return [...stack.querySelectorAll('.imm-wireframe-card')].map((card) => ({
      name: card.getAttribute('data-name') || card.querySelector('strong')?.textContent || 'Content Brick',
      type: card.getAttribute('data-type') || 'text',
    }));
  }

  function updateBrickStackMarkdown(container, textarea, embeddedMarkdown, stack, nextBricks) {
    const parentKey = stack.getAttribute('data-parent-key');
    if (!parentKey) return;

    const nextMarkdown = rewriteMarkdownBrickGroup(getEditableMarkdown(container, textarea, embeddedMarkdown), parentKey, nextBricks);
    const source = container.querySelector('.baiwei-markdown-mindmap__source');

    if (textarea) {
      textarea.value = nextMarkdown;
    }

    if (source) {
      source.textContent = JSON.stringify(nextMarkdown);
    }

    renderMarkdown(container, nextMarkdown, true);
  }

  function moveBrickCard(container, textarea, embeddedMarkdown, card, direction) {
    const stack = card.closest('.imm-brick-stack');
    if (!stack) return;

    const cards = [...stack.querySelectorAll('.imm-wireframe-card')];
    const index = cards.indexOf(card);
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const bricks = getStackBricks(stack);
    const moved = bricks.splice(index, 1)[0];
    bricks.splice(targetIndex, 0, moved);
    updateBrickStackMarkdown(container, textarea, embeddedMarkdown, stack, bricks);
  }

  function removeBrickCard(container, textarea, embeddedMarkdown, card) {
    const stack = card.closest('.imm-brick-stack');
    if (!stack) return;

    const bricks = getStackBricks(stack).filter((_, index) => index !== [...stack.querySelectorAll('.imm-wireframe-card')].indexOf(card));
    updateBrickStackMarkdown(container, textarea, embeddedMarkdown, stack, bricks);
  }

  function reorderDraggedBrick(container, textarea, embeddedMarkdown, draggedCard, targetCard) {
    if (!draggedCard || !targetCard || draggedCard === targetCard) return;

    const sourceStack = draggedCard.closest('.imm-brick-stack');
    const targetStack = targetCard.closest('.imm-brick-stack');

    if (!sourceStack || sourceStack !== targetStack) return;

    const cards = [...sourceStack.querySelectorAll('.imm-wireframe-card')];
    const sourceIndex = cards.indexOf(draggedCard);
    const targetIndex = cards.indexOf(targetCard);
    const bricks = getStackBricks(sourceStack);
    const moved = bricks.splice(sourceIndex, 1)[0];

    bricks.splice(targetIndex, 0, moved);
    updateBrickStackMarkdown(container, textarea, embeddedMarkdown, sourceStack, bricks);
  }

  function bindBrickStackInteractions(container, textarea, embeddedMarkdown) {
    container.addEventListener('pointerdown', (event) => {
      if (event.target instanceof Element && event.target.closest('.imm-wireframe-card')) {
        event.stopPropagation();
      }
    }, true);

    container.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const card = target.closest('.imm-wireframe-card');
      if (!card) return;

      if (target.closest('.imm-wireframe-card__up')) {
        event.preventDefault();
        event.stopPropagation();
        moveBrickCard(container, textarea, embeddedMarkdown, card, -1);
      } else if (target.closest('.imm-wireframe-card__down')) {
        event.preventDefault();
        event.stopPropagation();
        moveBrickCard(container, textarea, embeddedMarkdown, card, 1);
      } else if (target.closest('.imm-wireframe-card__remove')) {
        event.preventDefault();
        event.stopPropagation();
        removeBrickCard(container, textarea, embeddedMarkdown, card);
      }
    });

    container.addEventListener('dragstart', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const card = target.closest('.imm-wireframe-card');
      if (!card) return;

      container.draggedBrickCard = card;
      card.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', card.getAttribute('data-index') || '0');
    });

    container.addEventListener('dragover', (event) => {
      if (!(event.target instanceof Element) || !event.target.closest('.imm-wireframe-card')) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    });

    container.addEventListener('drop', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const targetCard = target.closest('.imm-wireframe-card');
      if (!targetCard) return;

      event.preventDefault();
      reorderDraggedBrick(container, textarea, embeddedMarkdown, container.draggedBrickCard, targetCard);
      container.draggedBrickCard = null;
    });

    container.addEventListener('dragend', () => {
      if (container.draggedBrickCard) {
        container.draggedBrickCard.classList.remove('is-dragging');
      }

      container.draggedBrickCard = null;
    });
  }

  function observeBrickStackRestores(container) {
    const svg = container.querySelector('.baiwei-markdown-mindmap__svg');
    if (!svg || container.brickStackObserver) return;

    container.brickStackObserver = new MutationObserver(() => {
      if (container.brickStackFrame) return;

      container.brickStackFrame = window.requestAnimationFrame(() => {
        container.brickStackFrame = 0;

        if (!hasRawBrickStackText(container, container.currentMindmapPlan)) return;

        finishRenderedLayout(container, container.currentMindmapPlan, false).catch((error) => {
          setStatus(container, error.message, true);
        });
      });
    });

    container.brickStackObserver.observe(svg, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  async function renderSitemap(container) {
    setStatus(container, 'Generating sitemap...');
    const url = new URL(window.BaiweiMarkdownMindmap.restUrl);
    url.searchParams.set('types', getTypes(container));

    const response = await fetch(url.toString(), {
      headers: {
        'X-WP-Nonce': window.BaiweiMarkdownMindmap.nonce,
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
    activateBrickStyle(container, getBrickStyle(container));
    bindBrickStackInteractions(container, textarea, embeddedMarkdown);
    observeBrickStackRestores(container);

    container.querySelectorAll('.baiwei-markdown-mindmap__mode').forEach((button) => {
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

    container.querySelectorAll('.baiwei-markdown-mindmap__planning').forEach((button) => {
      button.addEventListener('click', () => {
        activatePlanning(container, button.getAttribute('data-planning-mode') || 'structure-first');
        renderMarkdown(container, textarea ? textarea.value : embeddedMarkdown, true);
      });
    });

    container.querySelectorAll('.baiwei-markdown-mindmap__birdseye').forEach((button) => {
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

    container.querySelectorAll('.baiwei-markdown-mindmap__layout').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const nextLayout = button.getAttribute('data-layout') || 'horizontal';
        activateLayout(container, nextLayout);

        if (nextLayout === 'horizontal') {
          if (container.getAttribute('data-mode') === 'sitemap') {
            renderSitemap(container).catch((error) => setStatus(container, error.message, true));
          } else {
            renderMarkdown(container, textarea ? textarea.value : embeddedMarkdown, true);
          }
        } else if (container.markmapInstance) {
          scheduleRenderedLayout(container, container.currentMindmapPlan, true);
        }
      });
    });

    container.querySelectorAll('.baiwei-markdown-mindmap__brick-style').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const nextStyle = button.getAttribute('data-brick-style') || 'wireframe';
        activateBrickStyle(container, nextStyle);

        if (container.getAttribute('data-mode') === 'sitemap') {
          renderSitemap(container).catch((error) => setStatus(container, error.message, true));
        } else {
          renderMarkdown(container, textarea ? textarea.value : embeddedMarkdown, true);
        }
      });
    });

    const svg = container.querySelector('.baiwei-markdown-mindmap__svg');
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

    container.querySelectorAll('.baiwei-markdown-mindmap__fit').forEach((button) => {
      button.addEventListener('click', () => {
        if (container.markmapInstance) {
          container.markmapInstance.fit();
        }
      });
    });

    container.querySelectorAll('.baiwei-markdown-mindmap__zoom-out').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        zoomMindmap(container, 1 / 1.2).catch((error) => {
          setStatus(container, error.message, true);
        });
      });
    });

    container.querySelectorAll('.baiwei-markdown-mindmap__zoom-in').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        zoomMindmap(container, 1.2).catch((error) => {
          setStatus(container, error.message, true);
        });
      });
    });

    container.querySelectorAll('.baiwei-markdown-mindmap__fullscreen').forEach((button) => {
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

    if (scope.matches && scope.matches('.baiwei-markdown-mindmap')) {
      containers.push(scope);
    }

    if (scope.querySelectorAll) {
      containers.push(...scope.querySelectorAll('.baiwei-markdown-mindmap'));
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

      window.elementorFrontend.hooks.addAction('frontend/element_ready/baiwei_markdown_mindmap.default', ($scope) => {
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
