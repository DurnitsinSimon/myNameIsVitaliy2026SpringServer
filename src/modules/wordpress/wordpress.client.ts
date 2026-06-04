import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface WpPostPayload {
  title: string;
  content: string;
  status: 'publish' | 'draft';
  excerpt?: string;
  slug?: string;
}

@Injectable()
export class WordpressClient {
  private readonly logger = new Logger(WordpressClient.name);
  private http: AxiosInstance;

  constructor(private config: ConfigService) {
    this.http = axios.create({
      baseURL: `${this.config.getOrThrow<string>('wordpress.url')}/wp-json/wp/v2`,
      headers: {
        Authorization: this.config.getOrThrow<string>('wordpress.authHeader'),
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async checkConnection() {
    const { data } = await this.http.get('/users/me');
    return { connected: true, user: data.name };
  }

  async createPost(payload: WpPostPayload) {
    const { data } = await this.http.post('/posts', payload);
    return data;
  }

  async updatePost(wpPostId: number, payload: Partial<WpPostPayload>) {
    const { data } = await this.http.post(`/posts/${wpPostId}`, payload);
    return data;
  }

  async deletePost(wpPostId: number) {
    const { data } = await this.http.delete(`/posts/${wpPostId}`);
    return data;
  }
}