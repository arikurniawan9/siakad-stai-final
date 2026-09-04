import pg, { QueryResultRow } from 'pg';
import { ENV } from '../config/env.js';
import { logger } from '../config/logger.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client pool', err);
});

export const db = {
  /**
   * Eksekusi single query
   */
  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
    const start = Date.now();
    try {
      const res = await pool.query<T>(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed DB Query', { text, duration, rows: res.rowCount });
      return res;
    } catch (err) {
      logger.error('Database Query Failed', err, { text, params });
      throw err;
    }
  },

  /**
   * Eksekusi transaksi dengan rollback otomatis jika terjadi error
   */
  async transaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Database Transaction Rolled Back', err);
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Healthcheck database
   */
  async checkHealth(): Promise<{ isHealthy: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      await pool.query('SELECT 1');
      return { isHealthy: true, latencyMs: Date.now() - start };
    } catch (err) {
      return { 
        isHealthy: false, 
        latencyMs: Date.now() - start, 
        error: err instanceof Error ? err.message : String(err) 
      };
    }
  }
};
