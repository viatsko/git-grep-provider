# git-grep-provider

Git Grep Provider for Nuclide's Quick Open

It uses `git grep --cached` to make searches inside repository.

![Screenshot](https://github.com/viatsko/git-grep-provider/blob/master/resources/git-grep-provider.gif?raw=true)

In order to use it, you need to have this nuclide package installed:

```sh
apm install nuclide-quick-open
```

If you want to use all the features of nuclide-quick-open as well as git-grep-provider, you need to install watchman:

```sh
brew install watchman
```

After watchman installation, install all the quick-open providers nuclide team released:

```sh
apm install nuclide-fuzzy-filename-provider nuclide-open-filenames-provider nuclide-recent-files-provider
```

This package should work with the new nuclide monolithic package.
