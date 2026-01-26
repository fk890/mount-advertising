import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, isSupabaseConfigured } from '@/shop-utils/supabase/admin';
import { jwtVerify } from 'jose';

export const runtime = 'nodejs';

interface UploadedFile {
  name: string;
  type: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('admin-token')?.value;
  if (!token) return false;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    await jwtVerify(token, secret);
    return true;
  } catch (error) {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 500 }
      );
    }

    // Check if request is multipart/form-data
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content type must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Parse the form data
    const formData = await req.formData();
    
    // Collect all uploaded files
    const imageUrls: string[] = [];
    const uploadErrors: string[] = [];

    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';
    
    let fileFound = false;
    let validFileFound = false;
    // Process each file in the form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        fileFound = true;
        const file = value as UploadedFile;
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          console.error(`Invalid file type: ${file.type}`);
          continue; // Skip invalid file types, don't return immediately
        }
        validFileFound = true;
        // Generate a unique filename
        const safeName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
        const filePath = `products/${uuidv4()}_${safeName}`;

        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          uploadErrors.push(uploadError.message);
          continue;
        }

        const { data: publicData } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (!publicData?.publicUrl) {
          uploadErrors.push('Failed to generate public URL for uploaded image.');
          continue;
        }

        imageUrls.push(publicData.publicUrl);
      }
    }
    if (!fileFound) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }
    if (!validFileFound) {
      return NextResponse.json(
        { error: 'No valid image files uploaded. Supported types: jpeg, png, gif, webp.' },
        { status: 400 }
      );
    }
    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'Failed to upload images', details: uploadErrors },
        { status: 500 }
      );
    }

    // Return the URLs of the uploaded files
    return NextResponse.json({
      success: true,
      urls: imageUrls,
      warnings: uploadErrors.length ? uploadErrors : undefined,
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading files' },
      { status: 500 }
    );
  }
}
