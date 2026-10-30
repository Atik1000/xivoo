import Image, { type ImageProps } from 'next/image';

/**
 * next/image that transparently handles admin-uploaded images stored as
 * data: URLs (served unoptimized — the optimizer only accepts http sources).
 */
export default function PImg(props: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : '';
  return <Image {...props} unoptimized={props.unoptimized || src.startsWith('data:')} />;
}
