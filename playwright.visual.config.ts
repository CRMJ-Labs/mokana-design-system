import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir:'./tests/visual',
  testMatch:'**/*.spec.ts',
  fullyParallel:false,
  workers:1,
  retries:0,
  updateSnapshots:'none',
  snapshotPathTemplate:'{testDir}/baselines/{platform}/{projectName}/{arg}{ext}',
  outputDir:'test-results/visual',
  reporter:[['list'],['html',{outputFolder:'verification/visual-report',open:'never'}]],
  expect:{toHaveScreenshot:{animations:'disabled',caret:'hide',threshold:0.2,maxDiffPixels:20}},
  use:{baseURL:'http://127.0.0.1:3050',browserName:'chromium',channel:'msedge',headless:true,deviceScaleFactor:1,locale:'es-CO',timezoneId:'America/Bogota',reducedMotion:'reduce',trace:'retain-on-failure'},
  projects:[
    {name:'desktop-light',use:{viewport:{width:1280,height:900},colorScheme:'light'}},
    {name:'desktop-dark',use:{viewport:{width:1280,height:900},colorScheme:'dark'}},
    {name:'mobile-light',use:{viewport:{width:390,height:844},colorScheme:'light'}},
    {name:'mobile-dark',use:{viewport:{width:390,height:844},colorScheme:'dark'}},
  ],
});
