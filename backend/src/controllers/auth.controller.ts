import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getMe,
  loginUser,
  refreshTokens,
  registerUser,
} from '../services/auth.service.js';

const REFRESH_COOKIE = 'zmj_refresh';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  setRefreshCookie(res, result.refreshToken);
  res.status(201).json({ accessToken: result.accessToken, user: result.user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  setRefreshCookie(res, result.refreshToken);
  res.json({ accessToken: result.accessToken, user: result.user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = (req.cookies?.[REFRESH_COOKIE] as string | undefined) ?? req.body?.refreshToken;
  if (!token) {
    throw AppError.unauthorized('Refresh token manquant');
  }
  const result = await refreshTokens(token);
  setRefreshCookie(res, result.refreshToken);
  res.json({ accessToken: result.accessToken, user: result.user });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.json({ ok: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getMe(req.auth!.userId);
  res.json(user);
});
