const ts = new Date();
const tsIST = new Date(ts.getTime() + 5.5 * 60 * 60 * 1000);
export async function GET() {
  return Response.json({
    message: 'Pong',
    status: 'success',
    ts, tsIST
  });
}