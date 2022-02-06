import https = require('https');

const enableHttps = true;
const ssloptions = {};
const httpsPort = 443;

export const serve = (app: any) => {
  if (enableHttps) {
    https
      .createServer(ssloptions, app)
      .listen(httpsPort, () =>
        console.warn('[INFO] Server running on port 443')
      );
  } else {
    console.warn('[WARNING] HTTPS disabled');
  }
};
