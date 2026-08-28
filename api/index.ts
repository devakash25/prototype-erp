import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/src/app';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};

export default handler;
