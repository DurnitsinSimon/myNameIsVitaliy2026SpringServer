import { registerAs } from '@nestjs/config';

export default registerAs('wordpress', () => {
  const user = process.env.WORDPRESS_USER as string;
  const password = process.env.WORDPRESS_APP_PASSWORD as string;
  const auth = Buffer.from(`${user}:${password}`).toString('base64');

  return {
    url: process.env.WORDPRESS_URL as string,
    user,
    password,
    authHeader: `Basic ${auth}`,
  };
});