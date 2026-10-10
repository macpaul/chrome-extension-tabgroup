/**
 * Background Service Worker
 * Handles shortcut commands and background tab event monitoring
 */

import {
  closeDuplicateTabs,
  groupTabsByDomain,
  getSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  getTabStats
} from '../utils/tabs.js';
import { getMessage } from '../utils/i18n.js';

// Initialize default settings on installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await saveSettings(DEFAULT_SETTINGS);
  }
  await updateBadge();
});

// Update badge when tabs change
async function updateBadge() {
  try {
    const stats = await getTabStats({ scope: 'currentWindow' });
    if (stats.duplicateCount > 0) {
      await chrome.action.setBadgeText({ text: String(stats.duplicateCount) });
      await chrome.action.setBadgeBackgroundColor({ color: '#EF4444' }); // Red badge for duplicates
      await chrome.action.setTitle({
        title: getMessage(
          'badgeDuplicatesTitle',
          [String(stats.duplicateCount)],
          `Found ${stats.duplicateCount} duplicate tabs - click to clean`
        )
      });
    } else {
      await chrome.action.setBadgeText({ text: '' });
      await chrome.action.setTitle({
        title: getMessage('appName', [], 'Tab Purger & Grouper')
      });
    }
  } catch (err) {
    // Ignore errors in background when windows are closed or switching
  }
}

// Listen to tab updates to refresh badge
chrome.tabs.onCreated.addListener(() => updateBadge());
chrome.tabs.onRemoved.addListener(() => updateBadge());
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    updateBadge();
  }
});
chrome.tabs.onActivated.addListener(() => updateBadge());

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const settings = await getSettings();

  if (command === 'clean-duplicates') {
    const res = await closeDuplicateTabs(settings);
    await updateBadge();

    // Show visual feedback on badge
    await chrome.action.setBadgeText({ text: '✓' });
    await chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
    setTimeout(async () => {
      await updateBadge();
    }, 2500);
  } else if (command === 'group-tabs-by-domain') {
    await groupTabsByDomain(settings);
    await updateBadge();

    await chrome.action.setBadgeText({ text: 'GRP' });
    await chrome.action.setBadgeBackgroundColor({ color: '#3B82F6' });
    setTimeout(async () => {
      await updateBadge();
    }, 2500);
  }
});

// Message listener for external or popup requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === 'UPDATE_BADGE') {
      await updateBadge();
      sendResponse({ success: true });
    } else if (message.type === 'GET_STATS') {
      const stats = await getTabStats(message.settings || {});
      sendResponse({ stats });
    } else {
      sendResponse({ unknown: true });
    }
  })();
  return true; // Keep message channel open for async response
});
