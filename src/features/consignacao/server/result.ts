export type ActionResult<T> = { ok: true; value: T } | { ok: false; message: string; code: string };
