import { NextRequest, NextResponse } from 'next/server';
import { codeReferences } from '@/lib/codeReferences';

// Use the shared code references data


export async function GET(request: NextRequest) {
  // Get search parameters from URL
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query')?.toLowerCase() || '';
  const category = searchParams.get('category') || '';
  const authority = searchParams.get('authority') || '';

  // Filter code references based on search parameters
  let results = [...codeReferences];

  // Filter by search query
  if (query) {
    results = results.filter(code =>
      code.title.toLowerCase().includes(query) ||
      code.description.toLowerCase().includes(query)
    );
  }

  // Filter by category
  if (category) {
    results = results.filter(code => code.category === category);
  }

  // Filter by authority
  if (authority) {
    results = results.filter(code => code.authority === authority);
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return filtered results
  return NextResponse.json({
    results,
    count: results.length,
    timestamp: new Date().toISOString()
  });
}
