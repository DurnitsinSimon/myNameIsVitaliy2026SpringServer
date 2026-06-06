/// <reference types="multer" />
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService implements OnModuleInit {
  private client: Client;
  private bucket: string;
  private endpoint: string;
  private port: number;
  private useSSL: boolean;

  constructor(private config: ConfigService) {
    this.endpoint = this.config.getOrThrow<string>('minio.endpoint');
    this.port = this.config.getOrThrow<number>('minio.port');
    this.useSSL = this.config.getOrThrow<boolean>('minio.useSSL');
    this.bucket = this.config.getOrThrow<string>('minio.bucket');

    this.client = new Client({
      endPoint: this.endpoint,
      port: this.port,
      useSSL: this.useSSL,
      accessKey: this.config.getOrThrow<string>('minio.accessKey'),
      secretKey: this.config.getOrThrow<string>('minio.secretKey'),
    });
  }

  async onModuleInit() {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ filename: string; url: string }> {
    const ext = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;

    await this.client.putObject(
      this.bucket,
      filename,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    const protocol = this.useSSL ? 'https' : 'http';
    const url = `${protocol}://${this.endpoint}:${this.port}/${this.bucket}/${filename}`;

    return { filename, url };
  }

  async deleteFile(url: string): Promise<void> {
    const filename = url.split('/').pop();
    if (filename) {
      await this.client.removeObject(this.bucket, filename);
    }
  }

  async downloadFile(url: string): Promise<Buffer> {
    const filename = url.split('/').pop();
    if (!filename) {
      throw new Error('Некорректный URL файла');
    }

    const stream = await this.client.getObject(this.bucket, filename);
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}