import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => {
    document.body.innerHTML = `<pre style="color:red;background:#fff;padding:20px;font-size:14px;white-space:pre-wrap">${err?.message || err}\n\n${err?.stack || ''}</pre>`;
    console.error(err);
  });
