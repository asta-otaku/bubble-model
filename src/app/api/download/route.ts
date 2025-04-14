import { NextRequest, NextResponse } from 'next/server';
import { lookup as mimeLookup } from 'mime-types';

export async function GET(req: NextRequest) {
  // Get the URL and filename from query parameters
  const searchParams = req.nextUrl.searchParams;
  const fileUrl = searchParams.get('url');
  const fileName = searchParams.get('filename');
  
  if (!fileUrl) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }
  
  try {
    // Fetch the file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch file');
    }
    
    // Get the file content
    const fileArrayBuffer = await response.arrayBuffer();
    
    // Use mime-types to determine content type based on filename
    // Default to application/octet-stream if can't determine or is null
    const contentType = mimeLookup(fileName || '') || 'application/octet-stream';
    
    // Create a new response with the file content and proper headers
    return new Response(fileArrayBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${fileName || 'download'}"`,
        'Content-Type': contentType,
        'Content-Length': fileArrayBuffer.byteLength.toString()
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}