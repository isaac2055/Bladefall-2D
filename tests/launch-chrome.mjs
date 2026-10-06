import puppeteer from 'puppeteer';

// Without this, macOS Chrome copies its 1.4 GB bundle to the temp folder per launch and a killed run never deletes it.
const NO_CODE_SIGN_CLONE = '--disable-features=MacAppCodeSignClone';

export function launchChrome(options = {}) {
  return puppeteer.launch({ ...options, args: [...(options.args ?? []), NO_CODE_SIGN_CLONE] });
}
