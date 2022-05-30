# Contributing to Front Matter

First of all, it is amazing you want to contribute to Front Matter 💚.

There are various ways in how you can contribute to the project, it can be as simple from opening a bug report to implementing fixes or features.

## How you can help us

- Testing out the extension and providing feedback
- Reporting issues and bugs
- Suggesting new features
- Fixing an issue
- Updating documentation
- UI improvements
- Tutorials
- etc.

Eager to start contributing? Great 🤩, you can contribute to the following projects:

- [Extension](https://github.com/estruyf/vscode-front-matter)
- [Documentation](https://github.com/FrontMatter/web-documentation-nextjs)
- [Sample Projects](https://github.com/FrontMatter/project-samples)

## How to get started

- Start by forking this project;
- Clone your fork to your local machine;
- Run `npm i`;
- Open the project in VS Code;
- To start developing, run `npm run dev:ext` and press `f5` to start the debugging session.

### Tips

- Ensure that the main branch on your fork is in sync with the original **vscode-front-matter** repository

```bash
# assuming you are in the folder of your locally cloned fork....
git checkout main

# assuming you have a remote named `upstream` pointing to the official **vscode-front-matter** repo
git fetch upstream

# update your local main to be a mirror of what's in the main repo
git pull --rebase upstream main
```

- Create a feature branch in your fork. In case you get stuck, or have issues with merging your PR, this will allow you to have a clean main branch that you can use for contributing other changes.

```bash
git checkout -b issue/<id>
```

## Pull request

Once you are done with implementing the fix or feature. Please create a PR to our `dev` branch.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
