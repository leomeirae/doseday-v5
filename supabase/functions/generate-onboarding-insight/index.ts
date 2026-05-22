import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { handleRequest } from './handler.ts'

Deno.serve((req) => handleRequest(req))
