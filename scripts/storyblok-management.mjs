import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env' });

// Resolve CWD safely in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const SPACE_ID = process.env.STORYBLOK_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN;

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  throw new Error(
    'Missing STORYBLOK_SPACE_ID or STORYBLOK_MANAGEMENT_TOKEN in .env'
  );
}

const BASE_URL = 'https://mapi.storyblok.com/v1';

async function sbRequest(pathname, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE_URL}${pathname}`, {
    method,
    headers: {
      Authorization: MANAGEMENT_TOKEN, // Personal Access Token
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON, ignore
  }

  if (!res.ok) {
    console.error('Storyblok MAPI error:', res.status, data || '');
    throw new Error(`Request failed with status ${res.status}`);
  }

  return data;
}

async function createArticleStory() {
  console.log('Creating API demo story...');

  const suffix = Date.now().toString(36); // Slug-safe unique suffix to avoid collisions

  const slug = `my-first-api-article-${suffix}`;
  console.log('Using slug:', slug);

  const payload = {
    publish: 1,
    story: {
      name: `My First API Article ${suffix}`,
      slug,
      is_startpage: false,
      content: {
        component: 'article',
        title: `My First API Article ${suffix}`,
        subtitle: 'Created with the Storyblok Management API',
        body: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'This story was created programmatically using the Management API.',
                },
              ],
            },
          ],
        },
      },
    },
  };

  const res = await sbRequest(`/spaces/${SPACE_ID}/stories`, {
    method: 'POST',
    body: payload,
  });

  console.log('Story created:', res.story?.full_slug);
  return res.story;
}

async function uploadAsset() {
  const filename = 'tech2b_logo_storyblok.png';
  const filePath = path.join(ROOT_DIR, 'assets', filename);

  console.log(`Requesting signed upload data for ${filename}...`);

  const signed = await sbRequest(`/spaces/${SPACE_ID}/assets`, {
    method: 'POST',
    body: {
      filename,
    },
  });

  if (!signed.post_url || !signed.fields) {
    console.error('Signed response object:', signed);
    throw new Error('Signed response missing post_url or fields');
  }

  // Read file into memory
  const fileBuffer = await fs.readFile(filePath);

  // Use web-standard FormData & Blob from Node 24 (global)
  const form = new FormData();

  // Add all returned fields
  for (const [key, value] of Object.entries(signed.fields)) {
    form.append(key, value);
  }

  const blob = new Blob([fileBuffer]);
  form.append('file', blob, filename);

  console.log('Uploading file to S3...');

  const uploadRes = await fetch(signed.post_url, {
    method: 'POST',
    body: form,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => '');
    console.error('S3 upload failed:', uploadRes.status, text);
    throw new Error('S3 upload failed');
  }

  console.log('S3 upload successful. Asset should now appear in Storyblok Assets.');

  return signed;
}

async function main() {
  await createArticleStory();
  await uploadAsset();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
