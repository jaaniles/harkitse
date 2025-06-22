# HARKITSE. 
Browse with Intention.

Firefox extension. Get prompted before navigating to a specified domain.

## Description

Users can specify domains they want to visit with more intention. Every the user visits a specified website they will be prompted and asked if they really want to visit that site.

## Developer Guide

Firefox extensions are actually very easy to make! They are mostly built with a `manifest.json` and then probably a background script. In this project that one is located in `src/background/index.ts`

The rest is just conditional typescript scripting and html pages.

### Local Development

> Fork and clone the repository.

> Install dependencies `npm install`

> You are now ready to make your changes.

For an easy development flow, make your changes to code and then build with
> `npm run build`

A distribution version will be built into `/dist`

Then open Firefox and navigate to `about:debugging#/runtime/this-firefox`

-> Load temporary Add-on...

-> Select `dist/manifest.json`

You now have the extension temporarily loaded and ready to be tested with your local changes.

### Tooling & Standards

> Formatting & Linting automatically on file save (and when building) with Biome.

> Commits: prefer conventional small commits with clear commit messages

> Naming: semantic, even enthusiastically semantic namings are preferred

### Contributing

I'm very open-minded about feature requests, issues or maybe you want to contribute with a PR of your own. The repository is your banquet!
