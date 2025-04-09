
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`],
      scriptSrc: [`'self'`, `'unsafe-inline'`, `'unsafe-eval'`],
      imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
      connectSrc: [`'self'`, `http://*`, `https://*`],
    },
  },
  crossOriginEmbedderPolicy: false,
};
