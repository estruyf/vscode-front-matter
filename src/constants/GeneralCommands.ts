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
    runCommand: 'runCommand',
    getLocalization: 'getLocalization',
    openOnWebsite: 'openOnWebsite'
  }
};
