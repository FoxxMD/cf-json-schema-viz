import { Hono } from 'hono';
import { cache } from 'hono/cache';

type Bindings = {
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
};

type Model = {
  id: string;
  name: string;
  description: string;
  task: { name: string };
  properties: Array<{ property_id: string; value: string }>;
};

type ModelsResponse = {
  success: boolean;
  result: Model[];
};

type SchemaResponse = {
  success: boolean;
  result: {
    input: object;
    output: object;
  };
};

const app = new Hono<{ Bindings: Bindings }>();

// Cache model list for 1 hour
app.get(
  '/api/models',
  cache({
    cacheName: 'models-cache',
    cacheControl: 'max-age=3600',
  }),
  async (c) => {
    const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = c.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return Response.json({ error: 'Missing API credentials' }, { status: 500 });
    }

    try {
      // Fetch all models (paginated)
      const allModels: Model[] = [];
      let page = 1;
      const perPage = 50;

      while (true) {
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/models/search?per_page=${perPage}&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${apiToken}`,
            },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          return Response.json({ error: `API error: ${error}` }, { status: response.status });
        }

        const data = (await response.json()) as ModelsResponse;
        
        if (!data.success || !data.result) {
          break;
        }

        allModels.push(...data.result);

        if (data.result.length < perPage) {
          break;
        }

        page++;
      }

      // Transform to simpler format grouped by task
      const modelsByTask = allModels.reduce(
        (acc, model) => {
          const task = model.task?.name || 'Other';
          if (!acc[task]) {
            acc[task] = [];
          }
          acc[task].push({
            id: model.name, // e.g., "@cf/meta/llama-4-scout-17b-16e-instruct"
            name: model.name.split('/').pop() || model.name, // Just the model name
            description: model.description,
          });
          return acc;
        },
        {} as Record<string, Array<{ id: string; name: string; description: string }>>
      );

      return Response.json({ models: modelsByTask, total: allModels.length });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }
);

// Get schema for a specific model
app.get('/api/schema/:model{.+}', async (c) => {
  const model = c.req.param('model');
  const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = c.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return Response.json({ error: 'Missing API credentials' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/models/schema?model=${encodeURIComponent(model)}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: `API error: ${error}` }, { status: response.status });
    }

    const data = (await response.json()) as SchemaResponse;
    return Response.json(data.result);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
});

export default app;
