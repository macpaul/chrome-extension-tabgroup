/**
 * Tab Management & Operations Utility
 */

import {
  normalizeUrl,
  extractDomain,
  categorizeTab,
  TAB_GROUP_COLORS
} from './url.js';

export const DEFAULT_SETTINGS = {
  scope: 'currentWindow', // 'currentWindow' | 'allWindows'
  ignoreHash: true,
  ignoreQuery: false,
  ignoreTrackingParams: true,
  ignoreTrailingSlash: true,
  keepStrategy: 'earliest', // 'earliest' | 'active' | 'latest'
  excludePinned: true,
  minTabsPerGroup: 2,
  useMainDomain: false,
  collapseGroups: false,
  autoCleanOnNewTab: false
};

/**
 * Load user settings from chrome.storage.sync with fallback to defaults
 */
export async function getSettings() {
  try {
    const data = await chrome.storage.sync.get('settings');
    return { ...DEFAULT_SETTINGS, ...(data?.settings || {}) };
  } catch (err) {
    console.warn('Failed to load settings from sync, using defaults:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save user settings to chrome.storage.sync
 */
export async function saveSettings(newSettings) {
  const current = await getSettings();
  const merged = { ...current, ...newSettings };
  await chrome.storage.sync.set({ settings: merged });
  return merged;
}

/**
 * Query tabs based on scope
 * @param {string} scope - 'currentWindow' or 'allWindows'
 * @returns {Promise<chrome.tabs.Tab[]>}
 */
export async function queryTabsByScope(scope = 'currentWindow') {
  if (scope === 'allWindows') {
    return await chrome.tabs.query({ windowType: 'normal' });
  }
  return await chrome.tabs.query({ currentWindow: true });
}

/**
 * Identify duplicate tabs according to configuration
 * @param {chrome.tabs.Tab[]} tabs
 * @param {Object} settings
 * @returns {{
 *   duplicateGroups: Array<{
 *     normalizedUrl: string,
 *     sampleTitle: string,
 *     favIconUrl: string,
 *     toKeep: chrome.tabs.Tab,
 *     toClose: chrome.tabs.Tab[]
 *   }>,
 *   totalDuplicates: number,
 *   duplicateTabIds: number[]
 * }}
 */
export function findDuplicates(tabs, settings = DEFAULT_SETTINGS) {
  const urlMap = new Map();

  for (const tab of tabs) {
    // Skip empty or newtab placeholders if needed
    if (!tab.url || tab.url === 'about:blank' || tab.url.startsWith('chrome://newtab')) {
      continue;
    }

    const normUrl = normalizeUrl(tab.url, settings);
    if (!normUrl) continue;

    if (!urlMap.has(normUrl)) {
      urlMap.set(normUrl, []);
    }
    urlMap.get(normUrl).push(tab);
  }

  const duplicateGroups = [];
  const duplicateTabIds = [];

  for (const [normUrl, tabList] of urlMap.entries()) {
    if (tabList.length <= 1) continue;

    // Separate pinned vs unpinned tabs
    const pinnedTabs = tabList.filter((t) => t.pinned);
    const unpinnedTabs = tabList.filter((t) => !t.pinned);

    let candidatesToClose = [];
    let keptTab = null;

    if (settings.excludePinned && pinnedTabs.length > 0) {
      // Pinned tabs are protected
      // The kept tab is the first pinned tab (or active pinned tab)
      keptTab = pinnedTabs.find((t) => t.active) || pinnedTabs[0];
      // All unpinned tabs with this URL are candidates to close
      candidatesToClose = [...unpinnedTabs];
      // Other pinned tabs are kept as well
    } else {
      // Pick kept tab based on keepStrategy
      if (settings.keepStrategy === 'active') {
        const activeTab = tabList.find((t) => t.active);
        keptTab = activeTab || tabList[0];
      } else if (settings.keepStrategy === 'latest') {
        keptTab = tabList[tabList.length - 1];
      } else {
        // 'earliest'
        keptTab = tabList[0];
      }

      candidatesToClose = tabList.filter((t) => t.id !== keptTab.id);
      if (settings.excludePinned) {
        candidatesToClose = candidatesToClose.filter((t) => !t.pinned);
      }
    }

    if (candidatesToClose.length > 0) {
      duplicateGroups.push({
        normalizedUrl: normUrl,
        sampleTitle: keptTab.title || tabList[0].title || normUrl,
        favIconUrl: keptTab.favIconUrl || tabList[0].favIconUrl || '',
        toKeep: keptTab,
        toClose: candidatesToClose
      });

      for (const t of candidatesToClose) {
        duplicateTabIds.push(t.id);
      }
    }
  }

  return {
    duplicateGroups,
    totalDuplicates: duplicateTabIds.length,
    duplicateTabIds
  };
}

/**
 * Close duplicate tabs
 * @param {Object} customSettings
 * @returns {Promise<{ closedCount: number, groupsCount: number }>}
 */
export async function closeDuplicateTabs(customSettings = {}) {
  const settings = { ...(await getSettings()), ...customSettings };
  const tabs = await queryTabsByScope(settings.scope);
  const { duplicateTabIds, duplicateGroups } = findDuplicates(tabs, settings);

  if (duplicateTabIds.length > 0) {
    await chrome.tabs.remove(duplicateTabIds);
  }

  return {
    closedCount: duplicateTabIds.length,
    groupsCount: duplicateGroups.length,
    duplicateGroups
  };
}

/**
 * Group tabs by domain within each window
 * Note: Chrome Tab Groups cannot span across windows.
 * Pinned tabs cannot be added to tab groups in Chrome.
 * @param {Object} customSettings
 * @returns {Promise<{ groupsCreated: number, tabsGrouped: number }>}
 */
export async function groupTabsByDomain(customSettings = {}) {
  const settings = { ...(await getSettings()), ...customSettings };
  const tabs = await queryTabsByScope(settings.scope);

  // Partition tabs by windowId
  const windowMap = new Map();
  for (const tab of tabs) {
    // Skip pinned tabs and tabs without ID or URL
    if (tab.pinned || !tab.id || !tab.url) continue;

    if (!windowMap.has(tab.windowId)) {
      windowMap.set(tab.windowId, []);
    }
    windowMap.get(tab.windowId).push(tab);
  }

  let totalGroupsCreated = 0;
  let totalTabsGrouped = 0;
  let colorIdx = 0;

  for (const [, windowTabs] of windowMap.entries()) {
    // Group tabs by domain
    const domainMap = new Map();
    for (const tab of windowTabs) {
      const domain = extractDomain(tab.url, {
        useMainDomain: settings.useMainDomain
      });
      if (!domainMap.has(domain)) {
        domainMap.set(domain, []);
      }
      domainMap.get(domain).push(tab.id);
    }

    // Create tab group for domains meeting minimum tab count
    for (const [domain, tabIds] of domainMap.entries()) {
      if (tabIds.length >= settings.minTabsPerGroup) {
        try {
          const groupId = await chrome.tabs.group({ tabIds });
          const color = TAB_GROUP_COLORS[colorIdx % TAB_GROUP_COLORS.length];
          colorIdx++;

          await chrome.tabGroups.update(groupId, {
            title: domain,
            color,
            collapsed: settings.collapseGroups
          });

          totalGroupsCreated++;
          totalTabsGrouped += tabIds.length;
        } catch (err) {
          console.warn(`Failed to group tabs for domain ${domain}:`, err);
        }
      }
    }
  }

  return {
    groupsCreated: totalGroupsCreated,
    tabsGrouped: totalTabsGrouped
  };
}

/**
 * Group tabs by smart category (Search, Dev, Media, Social, etc.)
 * @param {Object} customSettings
 * @returns {Promise<{ groupsCreated: number, tabsGrouped: number }>}
 */
export async function groupTabsByCategory(customSettings = {}) {
  const settings = { ...(await getSettings()), ...customSettings };
  const tabs = await queryTabsByScope(settings.scope);

  // Partition tabs by windowId
  const windowMap = new Map();
  for (const tab of tabs) {
    if (tab.pinned || !tab.id || !tab.url) continue;

    if (!windowMap.has(tab.windowId)) {
      windowMap.set(tab.windowId, []);
    }
    windowMap.get(tab.windowId).push(tab);
  }

  let totalGroupsCreated = 0;
  let totalTabsGrouped = 0;

  for (const [, windowTabs] of windowMap.entries()) {
    const categoryMap = new Map();

    for (const tab of windowTabs) {
      const cat = categorizeTab(tab.url, tab.title, {
        useMainDomain: settings.useMainDomain
      });

      const key = cat.id;
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          name: cat.name,
          color: cat.color,
          tabIds: []
        });
      }
      categoryMap.get(key).tabIds.push(tab.id);
    }

    for (const [, data] of categoryMap.entries()) {
      if (data.tabIds.length >= settings.minTabsPerGroup) {
        try {
          const groupId = await chrome.tabs.group({ tabIds: data.tabIds });
          await chrome.tabGroups.update(groupId, {
            title: data.name,
            color: data.color,
            collapsed: settings.collapseGroups
          });

          totalGroupsCreated++;
          totalTabsGrouped += data.tabIds.length;
        } catch (err) {
          console.warn(`Failed to group tabs for category ${data.name}:`, err);
        }
      }
    }
  }

  return {
    groupsCreated: totalGroupsCreated,
    tabsGrouped: totalTabsGrouped
  };
}

/**
 * Ungroup all grouped tabs in target scope
 * @param {string} scope
 * @returns {Promise<{ ungroupedCount: number }>}
 */
export async function ungroupAllTabs(scope = 'currentWindow') {
  const tabs = await queryTabsByScope(scope);
  // Chrome group ID for ungrouped tabs is -1 (or TAB_GROUP_ID_NONE)
  const groupedTabs = tabs.filter(
    (t) => t.groupId !== undefined && t.groupId > 0
  );

  const tabIds = groupedTabs.map((t) => t.id);
  if (tabIds.length > 0) {
    await chrome.tabs.ungroup(tabIds);
  }

  return {
    ungroupedCount: tabIds.length
  };
}

/**
 * Get overall statistics for popup dashboard
 * @param {Object} customSettings
 */
export async function getTabStats(customSettings = {}) {
  const settings = { ...(await getSettings()), ...customSettings };
  const tabs = await queryTabsByScope(settings.scope);

  const { totalDuplicates, duplicateGroups } = findDuplicates(tabs, settings);

  const groupedTabs = tabs.filter(
    (t) => t.groupId !== undefined && t.groupId > 0
  );
  const uniqueGroupIds = new Set(groupedTabs.map((t) => t.groupId));

  const uniqueWindows = new Set(tabs.map((t) => t.windowId));

  return {
    totalTabs: tabs.length,
    duplicateCount: totalDuplicates,
    duplicateGroups,
    groupCount: uniqueGroupIds.size,
    groupedTabsCount: groupedTabs.length,
    windowCount: uniqueWindows.size,
    scope: settings.scope
  };
}
