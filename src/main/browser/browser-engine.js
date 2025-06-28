import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

export class BrowserEngine extends EventEmitter {
  constructor() {
    super();
    this.browser = null;
    this.tabs = new Map();
    this.activeTabId = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false,
      devtools: false,
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    console.log('Browser Engine initialized');
  }

  async createTab(url = 'about:blank') {
    const page = await this.browser.newPage();
    const tabId = uuidv4();
    
    this.tabs.set(tabId, {
      id: tabId,
      page,
      url: 'about:blank',
      title: 'New Tab',
      loading: false
    });

    // Set up page event listeners
    page.on('load', () => {
      this.updateTabInfo(tabId);
      this.emit('tab:loaded', { tabId });
    });

    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        this.updateTabInfo(tabId);
        this.emit('tab:navigated', { tabId, url: frame.url() });
      }
    });

    if (url !== 'about:blank') {
      await this.navigate(url, tabId);
    }

    this.activeTabId = tabId;
    this.emit('tab:created', { tabId });

    return tabId;
  }

  async navigate(url, tabId = null) {
    const currentTabId = tabId || this.activeTabId;
    
    if (!currentTabId) {
      const newTabId = await this.createTab();
      return await this.navigate(url, newTabId);
    }

    const tab = this.tabs.get(currentTabId);
    if (!tab) {
      throw new Error(`Tab ${currentTabId} not found`);
    }

    try {
      tab.loading = true;
      this.emit('tab:loading', { tabId: currentTabId, url });

      await tab.page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      await this.updateTabInfo(currentTabId);
      
      return {
        tabId: currentTabId,
        url: tab.url,
        title: tab.title,
        success: true
      };
    } catch (error) {
      tab.loading = false;
      throw new Error(`Navigation failed: ${error.message}`);
    }
  }

  async updateTabInfo(tabId) {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    try {
      tab.url = tab.page.url();
      tab.title = await tab.page.title();
      tab.loading = false;
      
      this.emit('tab:updated', {
        tabId,
        url: tab.url,
        title: tab.title
      });
    } catch (error) {
      console.error('Failed to update tab info:', error);
    }
  }

  async getContent(tabId = null) {
    const currentTabId = tabId || this.activeTabId;
    const tab = this.tabs.get(currentTabId);
    
    if (!tab) {
      throw new Error(`Tab ${currentTabId} not found`);
    }

    try {
      const content = await tab.page.content();
      const textContent = await tab.page.evaluate(() => document.body.innerText);
      
      return {
        tabId: currentTabId,
        url: tab.url,
        title: tab.title,
        html: content,
        text: textContent,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to get content: ${error.message}`);
    }
  }

  async executeScript(script, tabId = null) {
    const currentTabId = tabId || this.activeTabId;
    const tab = this.tabs.get(currentTabId);
    
    if (!tab) {
      throw new Error(`Tab ${currentTabId} not found`);
    }

    try {
      const result = await tab.page.evaluate(script);
      return {
        tabId: currentTabId,
        result,
        success: true
      };
    } catch (error) {
      throw new Error(`Script execution failed: ${error.message}`);
    }
  }

  async screenshot(tabId = null, options = {}) {
    const currentTabId = tabId || this.activeTabId;
    const tab = this.tabs.get(currentTabId);
    
    if (!tab) {
      throw new Error(`Tab ${currentTabId} not found`);
    }

    try {
      const screenshot = await tab.page.screenshot({
        fullPage: true,
        type: 'png',
        ...options
      });
      
      return {
        tabId: currentTabId,
        screenshot: screenshot.toString('base64'),
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Screenshot failed: ${error.message}`);
    }
  }

  async closeTab(tabId) {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      throw new Error(`Tab ${tabId} not found`);
    }

    await tab.page.close();
    this.tabs.delete(tabId);

    if (this.activeTabId === tabId) {
      // Set active tab to another tab or null
      const remainingTabs = Array.from(this.tabs.keys());
      this.activeTabId = remainingTabs.length > 0 ? remainingTabs[0] : null;
    }

    this.emit('tab:closed', { tabId });
    
    return { success: true };
  }

  async listTabs() {
    return Array.from(this.tabs.values()).map(tab => ({
      id: tab.id,
      url: tab.url,
      title: tab.title,
      loading: tab.loading,
      active: tab.id === this.activeTabId
    }));
  }

  async setActiveTab(tabId) {
    if (!this.tabs.has(tabId)) {
      throw new Error(`Tab ${tabId} not found`);
    }

    this.activeTabId = tabId;
    this.emit('tab:activated', { tabId });
    
    return { success: true };
  }

  async searchInPage(query, tabId = null) {
    const currentTabId = tabId || this.activeTabId;
    const tab = this.tabs.get(currentTabId);
    
    if (!tab) {
      throw new Error(`Tab ${currentTabId} not found`);
    }

    try {
      const results = await tab.page.evaluate((searchQuery) => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        const matches = [];
        let node;

        while (node = walker.nextNode()) {
          const text = node.textContent;
          if (text.toLowerCase().includes(searchQuery.toLowerCase())) {
            matches.push({
              text: text.trim(),
              element: node.parentElement.tagName,
              context: text.substring(
                Math.max(0, text.toLowerCase().indexOf(searchQuery.toLowerCase()) - 50),
                text.toLowerCase().indexOf(searchQuery.toLowerCase()) + searchQuery.length + 50
              )
            });
          }
        }

        return matches;
      }, query);

      return {
        tabId: currentTabId,
        query,
        results,
        count: results.length
      };
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  async shutdown() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}