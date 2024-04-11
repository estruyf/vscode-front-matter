export const GeneralCommands = {
  toWebview: {
    setMode: 'setMode',
    git: {
      syncingStart: 'gitSyncingStart',
      syncingEnd: 'gitSyncingEnd',
      branchName: 'gitBranchName'
    },
    setLocalization: 'setLocalization'
  },
  toVSCode: {
    openLink: 'openLink',
    git: {
      isRepo: 'gitIsRepo',
      sync: 'gitSync',
      fetch: 'getFetch',
      getBranch: 'getBranch',
      selectBranch: 'gitSelectBranch'
    },
    secrets: {
      get: 'getSecret',
      set: 'setSecret'
    },
    content: {
      locales: 'getContentLocales'
    },
    logging: {
      info: 'logInfo',
      warn: 'logWarn',
      error: 'logError'
    },
    runCommand: 'runCommand',
    getLocalization: 'getLocalization',
    openOnWebsite: 'openOnWebsite'
  }
};
