import { storyblokEditable, renderRichText } from '@storyblok/react/rsc';
import styles from './Article.module.css';

export default function Article({ blok }) {
  const bodyHtml = blok.body ? renderRichText(blok.body) : null;
          console.log('blok.cover_image', blok);


  return (
    <article
      {...storyblokEditable(blok)}
      className={styles.article}
    >
      <div className={styles.inner}>
        {/* Label */}
        <div className={styles.kicker}>Storyblok Demo Article</div>

        {/* Title + subtitle */}
        <header>
          {blok.title && (
            <h1 className={styles.title}>{blok.title}</h1>
          )}
          {blok.subtitle && (
            <p className={styles.subtitle}>{blok.subtitle}</p>
          )}
        </header>



        {/* Cover image */}
        {blok.cover_image?.filename && (
          <div className={styles.coverWrapper}>
            <img
              src={blok.cover_image.filename}
              alt={blok.cover_image.alt || blok.title || ''}
              className={styles.coverImage}
            />
          </div>
        )}

        {/* Body */}
        {bodyHtml && (
          <div
            className={styles.body}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        )}
      </div>
    </article>
  );
}
