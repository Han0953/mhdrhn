import {handleAzura} from '@/lib/azura/server';
export const runtime='nodejs';
export const maxDuration=30;
export const dynamic='force-dynamic';
export async function POST(request:Request){return handleAzura(request);}
