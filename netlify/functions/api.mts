import serverless from 'serverless-http';
import { createApp } from '../../server/app.js';
import { withDatabase } from '../../db/index.js';

interface ApiResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

export default async (request: Request) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/\.netlify\/functions\/api/, '/api');
  if (path === '/api/health') {
    return Response.json({ status: 'ok', app: 'SETU', time: new Date().toISOString() });
  }
  try {
    const handler = serverless(createApp());
    const result = await withDatabase(async () => {
      const response = await handler({
        httpMethod: request.method,
        path,
        headers: Object.fromEntries(request.headers),
        multiValueQueryStringParameters: Object.fromEntries(
          [...new Set(url.searchParams.keys())].map(key => [key, url.searchParams.getAll(key)])
        ),
        body: ['GET', 'HEAD'].includes(request.method) ? null : await request.text(),
        isBase64Encoded: false,
        requestContext: { identity: { sourceIp: '127.0.0.1' } },
      }, {}) as ApiResponse;
      if (response.statusCode >= 500) throw new Error('API request failed');
      return response;
    });
    return new Response(result.isBase64Encoded ? Buffer.from(result.body, 'base64') : result.body, {
      status: result.statusCode,
      headers: { ...result.headers, 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json({ error: 'The service is temporarily unavailable. Please try again.' }, { status: 503 });
  }
};

