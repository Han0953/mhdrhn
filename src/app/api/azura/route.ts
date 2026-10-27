import {handleAzura} from '@/lib/azura/server';
export const runtime='nodejs';
// Body (5s), Firestore admission (6s), provider (25s), release (6s), plus overhead.
export const maxDuration=50;
export const dynamic='force-dynamic';
export async function POST(request:Request){return handleAzura(request);}
