# Playtura  [![GitHub version](https://badge.fury.io/gh/google%2Fmaterial-design-lite.svg)](https://badge.fury.io/gh/google%2Fmaterial-design-lite) [![npm version](https://badge.fury.io/js/material-design-lite.svg)](https://badge.fury.io/js/material-design-lite) [![Dependency Status](https://david-dm.org/google/material-design-lite.svg)](https://david-dm.org/google/material-design-lite)


<p align="center">
    <img src='https://res.cloudinary.com/attearturo/image/upload/v1558480169/Frame_2_bva24l.png' alt="Prodoc"/>
</p>

## What is Playtura?
We’re glad you asked! Playtura is where reading happens. It’s a digital workspace for the management of academic readings
in an effective way — by gamification techniques — so you can get homework done.


## Folder Structure

```
playtura/
  README.md  
  angular.json
  ionic.config.json
  ionic.starter.json
  package.json
  package-lock.json
  tsconfig.json
  tslint.json
  config.xml
  e2e/
  node_modules/
  public/
    index.html
    favicon.ico
    manifest.json
    images/
      icons/
  resources/
  src/
    App.css
    App.js
    App.test.js
    index.css
    index.js
    logo.svg
    registerServiceWorker.js
```

For the project to build, **these files must exist with exact filenames**:

* `public/index.html` is the page template;
* `src/index.js` is the JavaScript entry point.

Then, you will need install the Node modules from npm like this:

### `$ npm intall`

You can delete or rename the other files.

You may create subdirectories inside `src`. For faster rebuilds, only files inside `src` are processed by Webpack.<br>
You need to **put any JS and CSS files inside `src`**, otherwise Webpack won’t see them.

You can, however, create more top-level directories.<br>
They will not be included in the production build so you can use them for things like documentation.

## Available Scripts

In the project directory, you can run:

### `npm start`  o  `ionic serve`

Runs the app in the development mode.<br>
Open [http://localhost:8100](http://localhost:8100) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](#deployment) for more information.


## License

© 2019
Cali, Colombia
