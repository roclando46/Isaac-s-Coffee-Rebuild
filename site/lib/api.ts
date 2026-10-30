import { NextResponse } from "next/server";

type Handler = (req: Request) => Promise<Response>;

/** Wraps an API route so an unexpected failure returns a clear JSON message instead of an HTML error page. */
export const withErrors = (handler: Handler, message = "Something went wrong on our side. Try again in a few minutes, or call the café.") =>
  async (req: Request) => {
    try {
      return await handler(req);
    } catch (e) {
      console.error(`${req.method} ${new URL(req.url).pathname} failed`, e);
      return NextResponse.json({ ok: false, error: message, message }, { status: 500 });
    }
  };
