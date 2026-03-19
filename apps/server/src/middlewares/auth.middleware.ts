// import type { RequestHandler } from 'express'
// import type { AuthenticateCallback } from 'passport'
// import ENV, { isDev } from '../config/env.config'
// import {
// 	NotFoundError,
// 	ServerError,
// 	UnAuthenticatedError,
// } from '../error/app.error'
// import { auth } from '../lib/auth.lib'

// const checkAuth: RequestHandler = (req, res, next): RequestHandler =>
// 	auth.authenticate(
// 		'jwt',
// 		{
// 			session: false,
// 		},
// 		((err, user) => {
// 			if (err) {
// 				return next(err)
// 			}
// 			req.user = user || undefined
// 			next()
// 		}) satisfies AuthenticateCallback
// 	)(req, res, next)

// const authRequired: RequestHandler = async (req, _res, next) => {
// 	if (!req.user) {
// 		throw new UnAuthenticatedError('Login to access!')
// 	}

// 	next()
// }

// const isFromAdmin: RequestHandler = async (req, _res, next) => {
// 	if (!req.user) {
// 		throw new ServerError("some event dosn't handled properly! in middleware")
// 	}

// 	if (!isDev) {
// 		if (ENV.ADMIN_URL !== req.headers.origin) {
// 			throw new NotFoundError(`route not found : "${req.url}"!`)
// 		}
// 	}

// 	next()
// }

// // const roleRequired = (roles: RoleSchemaType[]) => {
// //   return (async (req, _res, next) => {
// //     const user = req.user
// //     if (!user) {
// //       throw new ServerError("some event dosn't handled properly!", {
// //         user: 'undefined',
// //       })
// //     }

// //     if (!roles.includes(user.role)) {
// //       throw new ForbidenError("You Don't Sufficient permition")
// //     }
// //     next()
// //   }) satisfies RequestHandler
// // }

// export { checkAuth, authRequired, isFromAdmin }
