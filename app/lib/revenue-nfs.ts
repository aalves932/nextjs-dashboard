import postgres from 'postgres';

const sigmaSQL = postgres({
  host: process.env.PG_HOST_LOCAWEB,
  port: Number(process.env.PG_PORT_LOCAWEB),
  user: process.env.PG_USER_LOCAWEB,
  password: process.env.PG_PASSWORD_LOCAWEB?.trim(),
  database: process.env.PG_DBNAME_LOCAWEB,
  ssl: 'require'
});

export type RevenueByYear = {
  ano: number;
  faturamento: number;
};

export async function fetchRevenueByYear() {
  try {
    const data = await sigmaSQL<RevenueByYear[]>`
      SELECT EXTRACT(YEAR FROM data_emissao) AS ano, SUM(valor) AS faturamento
      FROM nfs_view
      WHERE situacao = '1'
      GROUP BY ano
      ORDER BY ano DESC;
    `;
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue by year.');
  }
}
