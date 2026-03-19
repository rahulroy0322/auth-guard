// import type { RequestHandler } from 'express';
// import { nanoid } from 'nanoid';
// import type { ContextType } from '../@types/context';
// import logger from '../logger/pino';

// const requestInfoMiddleware: RequestHandler = (req, res, next) => {
//   const start = Date.now();

//   req.context = {
//     reqId: nanoid(8),
//     method: req.method.toUpperCase() as ContextType['method'],
//     url: req.url,
//     headers: req.headers,
//     // TODO!
//     ua: req.get('User-Agent') || 'Unknown User Agent',
//     host: req.host,
//     remoteAddress: req.ip || 'Unknown Ip',
//     start,
//     end: start,
//     duration: 0,
//     traces: [
//       {
//         type: 'cache',
//         msg: '',
//       },
//     ],
//   };

//   res.once('finish', () => {
//     const now = Date.now();
//     req.context.end = now;
//     req.context.duration = now - start;

//     logger.info(req.context, `request complated!`);
//   });

//   next();
// };

// export { requestInfoMiddleware };
