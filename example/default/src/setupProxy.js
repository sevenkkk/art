const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function(app) {
  app.use(
    createProxyMiddleware("/api", {
      target: "https://api.vvhan.com/",
      changeOrigin: true
      // pathRewrite: { '^/api': '' }
    }),
    createProxyMiddleware("/app", {
      target: "http://m.tc.com/",
      changeOrigin: true
      // pathRewrite: { '^/api': '' }
    })
  );
};
