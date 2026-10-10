/**
 * Popup UI Controller
 */

import {
  getSettings,
  saveSettings,
  getTabStats,
  closeDuplicateTabs,
  groupTabsByDomain,
  groupTabsByCategory,
  ungroupAllTabs,
  DEFAULT_SETTINGS
} from '../utils/tabs.js';

let settings = { ...DEFAULT_SETTINGS };
let toastTimer = null;

// DOM Elements
const statTotalTabs = document.getElementById('statTotalTabs');
const statDuplicates = document.getElementById('statDuplicates');
const statGroups = document.getElementById('statGroups');
const statDupContainer = document.getElementById('statDupContainer');

const scopeCurrent = document.getElementById('scopeCurrent');
const scopeAll = document.getElementById('scopeAll');

const btnSmartClean = document.getElementById('btnSmartClean');
const btnCloseDuplicates = document.getElementById('btnCloseDuplicates');
const btnGroupByDomain = document.getElementById('btnGroupByDomain');
const btnGroupByCategory = document.getElementById('btnGroupByCategory');
const btnUngroupAll = document.getElementById('btnUngroupAll');
const btnDupBadge = document.getElementById('btnDupBadge');

const previewSection = document.getElementById('duplicatePreviewSection');
const btnTogglePreview = document.getElementById('btnTogglePreview');
const previewChevron = document.getElementById('previewChevron');
const previewGroupCount = document.getElementById('previewGroupCount');
const previewListContent = document.getElementById('previewListContent');

// Settings Elements
const btnSettingsToggle = document.getElementById('btnSettingsToggle');
const btnCloseSettings = document.getElementById('btnCloseSettings');
const settingsDrawer = document.getElementById('settingsDrawer');
const btnResetSettings = document.getElementById('btnResetSettings');

const setIgnoreHash = document.getElementById('setIgnoreHash');
const setIgnoreTracking = document.getElementById('setIgnoreTracking');
const setIgnoreQuery = document.getElementById('setIgnoreQuery');
const setIgnoreTrailingSlash = document.getElementById('setIgnoreTrailingSlash');
const setKeepStrategy = document.getElementById('setKeepStrategy');
const setExcludePinned = document.getElementById('setExcludePinned');
const setMinTabsPerGroup = document.getElementById('setMinTabsPerGroup');
const setUseMainDomain = document.getElementById('setUseMainDomain');
const setCollapseGroups = document.getElementById('setCollapseGroups');

const toastNotification = document.getElementById('toastNotification');

/**
 * Display toast notification
 */
function showToast(message, duration = 2200) {
  if (toastTimer) clearTimeout(toastTimer);
  toastNotification.textContent = message;
  toastNotification.classList.add('show');
  toastTimer = setTimeout(() => {
    toastNotification.classList.remove('show');
  }, duration);
}

/**
 * Load settings into UI controls
 */
async function initSettingsUI() {
  settings = await getSettings();

  setIgnoreHash.checked = settings.ignoreHash;
  setIgnoreTracking.checked = settings.ignoreTrackingParams;
  setIgnoreQuery.checked = settings.ignoreQuery;
  setIgnoreTrailingSlash.checked = settings.ignoreTrailingSlash;
  setKeepStrategy.value = settings.keepStrategy;
  setExcludePinned.checked = settings.excludePinned;
  setMinTabsPerGroup.value = String(settings.minTabsPerGroup);
  setUseMainDomain.checked = settings.useMainDomain;
  setCollapseGroups.checked = settings.collapseGroups;

  updateScopeButtons();
}

/**
 * Update active state of scope buttons
 */
function updateScopeButtons() {
  if (settings.scope === 'allWindows') {
    scopeCurrent.classList.remove('active');
    scopeAll.classList.add('active');
  } else {
    scopeCurrent.classList.add('active');
    scopeAll.classList.remove('active');
  }
}

/**
 * Save settings from UI controls
 */
async function saveSettingsFromUI() {
  settings.ignoreHash = setIgnoreHash.checked;
  settings.ignoreTrackingParams = setIgnoreTracking.checked;
  settings.ignoreQuery = setIgnoreQuery.checked;
  settings.ignoreTrailingSlash = setIgnoreTrailingSlash.checked;
  settings.keepStrategy = setKeepStrategy.value;
  settings.excludePinned = setExcludePinned.checked;
  settings.minTabsPerGroup = parseInt(setMinTabsPerGroup.value, 10) || 2;
  settings.useMainDomain = setUseMainDomain.checked;
  settings.collapseGroups = setCollapseGroups.checked;

  await saveSettings(settings);
  await refreshDashboard();
}

/**
 * Refresh stats and duplicate preview list
 */
async function refreshDashboard() {
  try {
    const stats = await getTabStats(settings);

    statTotalTabs.textContent = stats.totalTabs;
    statDuplicates.textContent = stats.duplicateCount;
    statGroups.textContent = stats.groupCount;

    if (stats.duplicateCount > 0) {
      statDupContainer.classList.add('has-duplicates');
      btnDupBadge.style.display = 'inline-flex';
      btnDupBadge.textContent = String(stats.duplicateCount);
      previewSection.querySelector('.preview-indicator').classList.add('active');
    } else {
      statDupContainer.classList.remove('has-duplicates');
      btnDupBadge.style.display = 'none';
      previewSection.querySelector('.preview-indicator').classList.remove('active');
    }

    renderDuplicatePreview(stats.duplicateGroups);

    // Notify service worker to update browser badge
    chrome.runtime.sendMessage({ type: 'UPDATE_BADGE' }).catch(() => {});
  } catch (err) {
    console.error('Error refreshing dashboard:', err);
  }
}

/**
 * Render duplicate tabs preview list
 */
function renderDuplicatePreview(groups) {
  previewGroupCount.textContent = `(${groups.length} 組)`;

  if (!groups || groups.length === 0) {
    previewListContent.innerHTML = '<div class="preview-empty">目前沒有發現重複分頁 🎉</div>';
    return;
  }

  previewListContent.innerHTML = '';

  for (const group of groups) {
    const itemEl = document.createElement('div');
    itemEl.className = 'dup-group-item';

    const headerEl = document.createElement('div');
    headerEl.className = 'dup-group-header';

    const favIcon = document.createElement('img');
    favIcon.className = 'dup-favicon';
    favIcon.src = group.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23ccc"/></svg>';
    favIcon.onerror = () => {
      favIcon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23ccc"/></svg>';
    };

    const titleEl = document.createElement('span');
    titleEl.className = 'dup-title';
    titleEl.textContent = group.sampleTitle || group.normalizedUrl;

    const quickCloseBtn = document.createElement('button');
    quickCloseBtn.className = 'btn btn-danger btn-sm';
    quickCloseBtn.textContent = '關閉';
    quickCloseBtn.title = '關閉此組的重複分頁';
    quickCloseBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const tabIdsToClose = group.toClose.map((t) => t.id);
      await chrome.tabs.remove(tabIdsToClose);
      showToast(`已關閉 ${tabIdsToClose.length} 個重複分頁`);
      await refreshDashboard();
    });

    headerEl.appendChild(favIcon);
    headerEl.appendChild(titleEl);
    headerEl.appendChild(quickCloseBtn);

    const urlSubEl = document.createElement('div');
    urlSubEl.className = 'dup-url-sub';
    urlSubEl.textContent = group.normalizedUrl;

    const tabsListEl = document.createElement('div');
    tabsListEl.className = 'dup-tabs-list';

    // Kept tab row
    const keptRow = document.createElement('div');
    keptRow.className = 'dup-tab-row';
    keptRow.innerHTML = `
      <span>分頁 #${group.toKeep.index + 1}</span>
      <span class="tab-badge kept">保留</span>
    `;
    tabsListEl.appendChild(keptRow);

    // To close tab rows
    for (const closeTab of group.toClose) {
      const closeRow = document.createElement('div');
      closeRow.className = 'dup-tab-row';
      closeRow.innerHTML = `
        <span>分頁 #${closeTab.index + 1}</span>
        <span class="tab-badge to-close">將關閉</span>
      `;
      tabsListEl.appendChild(closeRow);
    }

    itemEl.appendChild(headerEl);
    itemEl.appendChild(urlSubEl);
    itemEl.appendChild(tabsListEl);

    previewListContent.appendChild(itemEl);
  }
}

// Bind Action Handlers
btnSmartClean.addEventListener('click', async () => {
  btnSmartClean.disabled = true;
  try {
    const dupRes = await closeDuplicateTabs(settings);
    const grpRes = await groupTabsByDomain(settings);

    let message = '';
    if (dupRes.closedCount > 0 && grpRes.groupsCreated > 0) {
      message = `整理完成！關閉 ${dupRes.closedCount} 個重複，建立 ${grpRes.groupsCreated} 個群組`;
    } else if (dupRes.closedCount > 0) {
      message = `已關閉 ${dupRes.closedCount} 個重複分頁`;
    } else if (grpRes.groupsCreated > 0) {
      message = `已建立 ${grpRes.groupsCreated} 個分頁群組 (${grpRes.tabsGrouped} 個分頁)`;
    } else {
      message = '分頁已是最整潔狀態！';
    }

    showToast(message);
    await refreshDashboard();
  } catch (err) {
    console.error('Smart clean error:', err);
    showToast('整理時發生錯誤');
  } finally {
    btnSmartClean.disabled = false;
  }
});

btnCloseDuplicates.addEventListener('click', async () => {
  btnCloseDuplicates.disabled = true;
  try {
    const res = await closeDuplicateTabs(settings);
    if (res.closedCount > 0) {
      showToast(`已成功關閉 ${res.closedCount} 個重複分頁！`);
    } else {
      showToast('沒有發現重複分頁');
    }
    await refreshDashboard();
  } catch (err) {
    console.error('Close duplicates error:', err);
    showToast('關閉重複分頁失敗');
  } finally {
    btnCloseDuplicates.disabled = false;
  }
});

btnGroupByDomain.addEventListener('click', async () => {
  btnGroupByDomain.disabled = true;
  try {
    const res = await groupTabsByDomain(settings);
    if (res.groupsCreated > 0) {
      showToast(`已建立 ${res.groupsCreated} 個群組 (${res.tabsGrouped} 個分頁)`);
    } else {
      showToast('未達分組門檻 (至少需 2 個同網域分頁)');
    }
    await refreshDashboard();
  } catch (err) {
    console.error('Group by domain error:', err);
    showToast('網域分組失敗');
  } finally {
    btnGroupByDomain.disabled = false;
  }
});

btnGroupByCategory.addEventListener('click', async () => {
  btnGroupByCategory.disabled = true;
  try {
    const res = await groupTabsByCategory(settings);
    if (res.groupsCreated > 0) {
      showToast(`已依類型建立 ${res.groupsCreated} 個群組 (${res.tabsGrouped} 個分頁)`);
    } else {
      showToast('未達分組門檻或未匹配特定類型');
    }
    await refreshDashboard();
  } catch (err) {
    console.error('Group by category error:', err);
    showToast('智慧分組失敗');
  } finally {
    btnGroupByCategory.disabled = false;
  }
});

btnUngroupAll.addEventListener('click', async () => {
  btnUngroupAll.disabled = true;
  try {
    const res = await ungroupAllTabs(settings.scope);
    if (res.ungroupedCount > 0) {
      showToast(`已解散所有分頁群組 (${res.ungroupedCount} 個分頁)`);
    } else {
      showToast('目前沒有任何分組分頁');
    }
    await refreshDashboard();
  } catch (err) {
    console.error('Ungroup error:', err);
    showToast('解散分組失敗');
  } finally {
    btnUngroupAll.disabled = false;
  }
});

// Scope Switcher
scopeCurrent.addEventListener('click', async () => {
  settings.scope = 'currentWindow';
  updateScopeButtons();
  await saveSettings(settings);
  await refreshDashboard();
});

scopeAll.addEventListener('click', async () => {
  settings.scope = 'allWindows';
  updateScopeButtons();
  await saveSettings(settings);
  await refreshDashboard();
});

// Preview accordion toggle
btnTogglePreview.addEventListener('click', () => {
  previewSection.classList.toggle('expanded');
});

// Settings Drawer Toggle
btnSettingsToggle.addEventListener('click', () => {
  settingsDrawer.classList.add('open');
});

btnCloseSettings.addEventListener('click', () => {
  settingsDrawer.classList.remove('open');
});

btnResetSettings.addEventListener('click', async () => {
  settings = { ...DEFAULT_SETTINGS, scope: settings.scope };
  await saveSettings(settings);
  await initSettingsUI();
  await refreshDashboard();
  showToast('設定已恢復為預設值');
});

// Auto-save setting changes on input
const settingInputs = [
  setIgnoreHash,
  setIgnoreTracking,
  setIgnoreQuery,
  setIgnoreTrailingSlash,
  setKeepStrategy,
  setExcludePinned,
  setMinTabsPerGroup,
  setUseMainDomain,
  setCollapseGroups
];

settingInputs.forEach((input) => {
  input.addEventListener('change', saveSettingsFromUI);
});

// Initialize on popup load
document.addEventListener('DOMContentLoaded', async () => {
  await initSettingsUI();
  await refreshDashboard();
});
