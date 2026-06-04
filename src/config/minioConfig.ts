import { registerAs } from '@nestjs/config';

export default registerAs('minio', () => ({
  endpoint: process.env.MINIO_ENDPOINT as string,
  port: parseInt(process.env.MINIO_PORT as string, 10),
  accessKey: process.env.MINIO_ACCESS_KEY as string,
  secretKey: process.env.MINIO_SECRET_KEY as string,
  bucket: process.env.MINIO_BUCKET as string,
  useSSL: process.env.MINIO_USE_SSL === 'true',
}));