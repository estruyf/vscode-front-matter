import { Event } from 'vscode';

export type GitAPIState = 'uninitialized' | 'initialized';

export interface GitRepository {
  state: GitRepositoryState;
  rootUri: {
    fsPath: string;
    path: string;
  };
  repository: {
    getBranches: () => Promise<GitBranch[]>;
  };
}

export interface GitRepositoryState {
  HEAD: GitBranch;
  onDidChange: Event<void>;
}

export interface GitBranch {
  type: number;
  name: string;
  upstream: Upstream;
  commit: string;
  ahead: number;
  behind: number;
}

export interface Upstream {
  name: string;
  remote: string;
  commit: string;
}
