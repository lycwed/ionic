import { readTask, writeTask } from '@stencil/core';

const TRANSITION = 'all 0.2s ease-in-out';

export const setToolbarBorderColor = (toolbar: any, color: string) => {
  if (!toolbar) { return; }

  toolbar.el.style.setProperty('--border-color', color);
};

export const createHeaderIndex = (headerEl: any): any | undefined => {
  if (!headerEl) { return; }

  const toolbars = headerEl.querySelectorAll('ion-toolbar');

  return {
    el: headerEl,
    toolbars: Array.from(toolbars).map((toolbar: any) => {
      const ionTitleEl = toolbar.querySelector('ion-title');
      return {
        el: toolbar,
        ionTitleEl,
        innerTitleEl: (ionTitleEl) ? ionTitleEl.shadowRoot!.querySelector('.toolbar-title') : null,
        ionButtonsEl: Array.from(toolbar.querySelectorAll('ion-buttons'))
      };
    })
  };
};

const clampValue = (value: number, max: number, min: number): number => {
  if (value > max) {
    return max;
  } else if (value < min) {
    return min;
  }

  return value;
};

export const handleContentScroll = (scrollEl: any, mainHeaderIndex: any, scrollHeaderIndex: any, remainingHeight = 0) => {
  readTask(() => {
    const scrollTop = scrollEl.scrollTop;

    const lastMainToolbar = mainHeaderIndex.toolbars[mainHeaderIndex.toolbars.length - 1];
    const scale = clampValue(1 + (-scrollTop / 500), 1.1, 1);

    const borderOpacity = clampValue((scrollTop - remainingHeight) / lastMainToolbar.el.clientHeight, 1, 0);
    const maxOpacity = 0.2;
    const scaledOpacity = borderOpacity * maxOpacity;

    writeTask(() => {
      scaleLargeTitles(scrollHeaderIndex.toolbars, scale);
      setToolbarBorderColor(lastMainToolbar, `rgba(0, 0, 0, ${scaledOpacity})`);
    });
  });
};

/**
 * If toolbars are intersecting, hide the scrollable toolbar content
 * and show the primary toolbar content. If the toolbars are not intersecting,
 * hide the primary toolbar content and show the scrollable toolbar content
 */
export const handleToolbarIntersection = (ev: any, mainHeaderIndex: any, scrollHeaderIndex: any) => {
  writeTask(() => {
    const mainHeaderToolbars = mainHeaderIndex.toolbars;
    const lastMainHeaderToolbar = mainHeaderToolbars[mainHeaderToolbars.length - 1];

    if (ev[0].isIntersecting) {
      makeHeaderInactive(mainHeaderIndex, true);
      makeHeaderActive(scrollHeaderIndex, false);
      setToolbarBorderColor(lastMainHeaderToolbar, 'rgba(0, 0, 0, 0)');
    } else {
      makeHeaderActive(mainHeaderIndex, true);
      makeHeaderInactive(scrollHeaderIndex, true);
      setToolbarBorderColor(lastMainHeaderToolbar, 'rgba(0, 0, 0, 0.2)');
    }
  });
};

export const makeHeaderInactive = (headerIndex: any, transition = false) => {
  headerIndex.el.classList.add('no-translucent');

  if (headerIndex.toolbars.length === 0) {
    return;
  }

  const ionTitleEl = headerIndex.toolbars[0].ionTitleEl;
  if (!ionTitleEl) { return; }

  setElOpacity(ionTitleEl, 0, transition);
  hideCollapsableButtons(headerIndex.toolbars[0].ionButtonsEl, transition);
};

export const makeHeaderActive = (headerIndex: any, transition = false) => {
  if (headerIndex.toolbars.length === 0) {
    return;
  }

  const ionTitleEl = headerIndex.toolbars[0].ionTitleEl;
  if (!ionTitleEl) { return; }

  setElOpacity(ionTitleEl, 1, transition);
  showCollapsableButtons(headerIndex.toolbars[0].ionButtonsEl, transition);

  headerIndex.el.classList.remove('no-translucent');
};

export const setElOpacity = (el: HTMLElement, opacity = 1, transition = false) => {
  el.style.transition = (transition) ? TRANSITION : '';
  el.style.opacity = `${opacity}`;
};

export const hideCollapsableButtons = (buttons: any[] = [], transition = false) => {
  buttons.forEach((button: any) => {
    if (!button.collapse) { return; }

    setElOpacity(button, 0, transition);
  });
};

const showCollapsableButtons = (buttons: any[] = [], transition = false) => {
  buttons.forEach((button: any) => {
    if (!button.collapse) { return; }

    setElOpacity(button, 1, transition);
  });
};

export const scaleLargeTitles = (toolbars: any[] = [], scale = 1, transition = false) => {
  toolbars.forEach(toolbar => {

    const ionTitle = toolbar.ionTitleEl;
    if (!ionTitle || ionTitle.size !== 'large') { return; }

    const titleDiv = toolbar.innerTitleEl;
    if (titleDiv === null) { return; }

    titleDiv.style.transformOrigin = 'left center';
    titleDiv.style.transition = (transition) ? TRANSITION : '';
    titleDiv.style.transform = `scale3d(${scale}, ${scale}, 1)`;
  });
};