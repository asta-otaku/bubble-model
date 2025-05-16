import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import { OwnerProfile as Owner } from '@/utils/BubbleSpecialInterfaces';

interface FileInfo {
  url: string;
  name: string;
}

interface DownloadZipRequest {
  files: FileInfo[];
}

// Constants
const FILE_DOWNLOAD_TIMEOUT = 10000; // 10 seconds per file
const MAX_CONCURRENT_DOWNLOADS = 2;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch with retries
async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FILE_DOWNLOAD_TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('API route started at:', new Date().toISOString());
  
  try {
    const body = await req.json();
    console.log('Received request body:', JSON.stringify(body, null, 2));
    console.log('Number of files to process:', body.files.length);

    // Validate files array
    if (!body.files || !Array.isArray(body.files) || body.files.length === 0) {
      console.error('Invalid files array:', body.files);
      return NextResponse.json({ 
        error: 'Invalid request: files array is required and must not be empty',
        details: { files: body.files }
      }, { status: 400 });
    }

    // Validate each file in the array
    const invalidFiles = body.files.filter((file: FileInfo) => !file.url || !file.name);
    if (invalidFiles.length > 0) {
      console.error('Invalid files found:', invalidFiles);
      return NextResponse.json({ 
        error: 'Invalid request: all files must have url and name',
        details: { invalidFiles }
      }, { status: 400 });
    }

    // Create a new archive with no compression
    const archive = archiver('zip', {
      zlib: { level: 0 } // no compression
    });

    // Create a transform stream to handle the archive
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Write chunks to the stream as they come in
    archive.on('data', async (chunk) => {
      await writer.write(chunk);
    });

    archive.on('end', async () => {
      await writer.close();
      const endTime = Date.now();
      console.log('Archive completed. Total time:', (endTime - startTime) / 1000, 'seconds');
    });

    // Process files in parallel with a concurrency limit
    const processFiles = async (files: FileInfo[]) => {
      const results = await Promise.allSettled(
        files.map(async (file: FileInfo) => {
          try {
            console.log(`Downloading file: ${file.name}`);
            const response = await fetchWithRetry(file.url, {});
            const buffer = await response.arrayBuffer();
            archive.append(Buffer.from(buffer), { name: file.name });
            console.log(`Successfully downloaded: ${file.name}`);
            return { success: true, file: file.name };
          } catch (error: any) {
            console.error(`Error processing file ${file.name}:`, error);
            archive.append(
              Buffer.from(`Failed to download: ${file.name}\nError: ${error?.message || 'Unknown error'}`),
              { name: `error_${file.name}.txt` }
            );
            return { success: false, file: file.name, error: error.message };
          }
        })
      );
      return results;
    };

    // Process all files
    await processFiles(body.files);

    // Finalize the archive
    await archive.finalize();

    // Return a streaming response
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="typo-special-files-${new Date().toISOString().split('T')[0]}.zip"`,
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    const endTime = Date.now();
    console.error('Error creating zip:', error);
    console.error('Total execution time:', (endTime - startTime) / 1000, 'seconds');
    return NextResponse.json({ 
      error: 'Failed to create zip file',
      details: error instanceof Error ? error.message : 'Unknown error',
      executionTime: (endTime - startTime) / 1000
    }, { status: 500 });
  }
} 