// src/lib/withAuth.ts
import { getUserFromRequest, type AuthTokenPayload } from './auth';

type AuthHandler<TContext = unknown> = (
  req: Request,
  context: TContext,
  user: AuthTokenPayload,
) => Response | Promise<Response>;

export function withAdminOrMember<TContext = unknown>(
  handler: AuthHandler<TContext>,
) {
  return async (req: Request, context: TContext): Promise<Response> => {
    // console.log('Request URL:', req.url);
    // console.log('Cookie header:', req.headers.get('cookie'));

    const user = await getUserFromRequest(req);
    // console.log('withAuth', user);

    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    if (user.statusLevel !== 'admin' && user.statusLevel !== 'member') {
      return Response.json(
        {
          success: false,
          message: 'Forbidden',
        },
        { status: 403 },
      );
    }

    return handler(req, context, user);
  };
}

export function withAdmin<TContext = unknown>(handler: AuthHandler<TContext>) {
  return async (req: Request, context: TContext): Promise<Response> => {
    const user = await getUserFromRequest(req);

    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    if (user.statusLevel !== 'admin') {
      return Response.json(
        {
          success: false,
          message: 'Forbidden',
        },
        { status: 403 },
      );
    }

    return handler(req, context, user);
  };
}
