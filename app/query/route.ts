import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const sigmaSQL = postgres({
  host: process.env.PG_HOST_LOCAWEB,
  port: Number(process.env.PG_PORT_LOCAWEB),
  user: process.env.PG_USER_LOCAWEB,
  password: process.env.PG_PASSWORD_LOCAWEB?.trim(),
  database: process.env.PG_DBNAME_LOCAWEB,
  ssl: 'require' 
});

async function getSigmaDataStats() {
  // Teste: Listar todas as invoices com dados do cliente
  const data = await sigmaSQL`
        SELECT 
              COUNT(*) as total_invoices,
              SUM(valor) as total_amount,
              AVG(valor) as average_amount,
              COUNT(CASE WHEN situacao = '1' THEN 1 END) as ativo,
              COUNT(CASE WHEN situacao = '2' THEN 1 END) as cancelado
        FROM public.nfs;
    `;
  return data[0];
}


async function listInvoices() {
	// Teste: Listar todas as invoices com dados do cliente
	const data = await sql`
    SELECT 
      invoices.id,
      invoices.amount,
      invoices.status,
      invoices.date,
      customers.name,
      customers.email
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    ORDER BY invoices.date DESC
    LIMIT 10;
  `;

	return data;
}

async function getInvoiceStats() {
	const data = await sql`
    SELECT 
      COUNT(*) as total_invoices,
      SUM(amount) as total_amount,
      AVG(amount) as average_amount,
      COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
    FROM invoices;
  `;

	return data[0];
}

async function getTopCustomers() {
	const data = await sql`
    SELECT 
      customers.name,
      customers.email,
      COUNT(invoices.id) as invoice_count,
      SUM(invoices.amount) as total_spent
    FROM customers
    LEFT JOIN invoices ON customers.id = invoices.customer_id
    GROUP BY customers.id, customers.name, customers.email
    ORDER BY total_spent DESC
    LIMIT 5;
  `;

	return data;
}

export async function GET(request: Request) {
  // return Response.json({
  //   message:
  //     'Uncomment this file and remove this line. You can delete this file when you are finished.',
  // });
  
  try {
    const { searchParams } = new URL(request.url);
    const queryType = searchParams.get('type') || 'invoices';
    
    let result;
    
    switch (queryType) {
      case 'invoices':
        result = await listInvoices();
        break;
      case 'stats':
        result = await getInvoiceStats();
        break;
      case 'customers':
        result = await getTopCustomers();
        break;
      case 'sigma-stats':
        result = await getSigmaDataStats();
        break;
      default:
        return Response.json({ error: 'Invalid query type. Use: invoices, stats, or customers' }, { status: 400 });
    }
    
    return Response.json({ 
      queryType, 
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}