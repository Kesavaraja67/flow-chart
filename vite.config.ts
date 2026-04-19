import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { getAutomations } from './src/api/automations';
import { simulateWorkflow } from './src/api/simulate';
import type { WorkflowEdge, WorkflowNode } from './src/types/workflow';

export default defineConfig({
  plugins: [
    react(),
    (() => {
      const apiPlugin: PluginOption = {
        name: 'flowcraft-dev-mock-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = req.url ?? '';
            const method = (req.method ?? 'GET').toUpperCase();

            if (url.startsWith('/api/automations') && method === 'GET') {
              try {
                const data = await getAutomations();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return;
              } catch {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Failed to load automations' }));
                return;
              }
            }

            if (url.startsWith('/api/simulate') && method === 'POST') {
              const chunks: Buffer[] = [];
              req.on('data', d => chunks.push(d as Buffer));
              req.on('end', async () => {
                try {
                  const raw = Buffer.concat(chunks).toString('utf8');
                  const parsed = JSON.parse(raw) as { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
                  const nodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
                  const edges = Array.isArray(parsed.edges) ? parsed.edges : [];
                  const result = await simulateWorkflow(nodes, edges);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(result));
                } catch {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Invalid payload' }));
                }
              });
              return;
            }

            next();
          });
        },
      };

      return apiPlugin;
    })(),
  ],
});
