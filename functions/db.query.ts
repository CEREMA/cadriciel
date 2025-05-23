// service_table_info_query.ts
// Microservice Deno pour afficher le contenu d'une table via Cadriciel.query

import { cadriciel } from 'cadriciel/core.ts';

interface ReqPayload {
  table: string;
}

console.info('🚀 Server started: listening for query requests');

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: ReqPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { table } = payload;
  if (!table) {
    return new Response(
      JSON.stringify({ error: "Missing 'table' in request payload" }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Construire la requête SQL en échappant le nom de table
    const safeTable = table.replace(/[^a-zA-Z0-9_]/g, '');
    const sql = `SELECT * FROM demosl.${safeTable}`;

    // Execute via cadriciel.query
    const result = await cadriciel.query<any>(sql, []);

    return new Response(JSON.stringify({ rows: result.rows }), {
      headers: {
        'Content-Type': 'application/json',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Failed to execute query:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
