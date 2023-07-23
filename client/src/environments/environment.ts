export const environment = {
  production: false,
  clientId: 'marep_dev',
  orionUrl: 'https://orion-recette.cerema.fr/auth/realms/CeremaApps',
  redirectUri: 'http://localhost:4200/login',
  allowedUrls: ["http://localhost:8080/api/"," http://localhost:8080/db/"],
  serverDbUrl: 'http://localhost:8080/db',
  serverApiUrl: 'http://localhost:8080/api',
  deconnexionUri: 'http://localhost:4200/deconnexion',
};
