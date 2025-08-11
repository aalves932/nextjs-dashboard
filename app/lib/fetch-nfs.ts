import { formatCurrency } from './utils';
import { LatestInvoiceRaw } from './definitions';
import postgres from 'postgres';

const sigmaSQL = postgres({
  host: process.env.PG_HOST_LOCAWEB,
  port: Number(process.env.PG_PORT_LOCAWEB),
  user: process.env.PG_USER_LOCAWEB,
  password: process.env.PG_PASSWORD_LOCAWEB?.trim(),
  database: process.env.PG_DBNAME_LOCAWEB,
  ssl: 'require'
});

export async function fetchLatestNFS() {
  try {
    const data = await sigmaSQL`
      SELECT 
        numero,
        data_emissao,
        nome,
        nome_reduzido,
        competencia,
        valor,
        link_nfse
      FROM nfs_view
      WHERE situacao='1'
      ORDER BY numero DESC
      LIMIT 5;
    `;
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch latest NFS.');
  }
}
