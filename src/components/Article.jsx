import { storyblokEditable } from '@storyblok/react/rsc';

export default function Article({ blok }) {
  return (
    <article {...storyblokEditable(blok)}>
      {blok.title && <h1>{blok.title}</h1>}
      {blok.subtitle && <p>{blok.subtitle}</p>}

      {blok.cover_image?.filename && (
        <img
          src={blok.cover_image.filename}
          alt={blok.cover_image.alt || blok.title || ''}
        />
      )}

      {blok.body && (
        <div>
          <pre>{JSON.stringify(blok.body, null, 2)}</pre>
        </div>
      )}
    </article>
  );
}
