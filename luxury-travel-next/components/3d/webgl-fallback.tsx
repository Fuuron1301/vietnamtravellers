import Image from 'next/image';

export function WebGLFallback({ image, imagePosition = '50% 50%', title }: { image: string; imagePosition?: string; title: string }) {
  return <Image src={image} alt={title} fill priority sizes="100vw" className="object-cover opacity-70" style={{ objectPosition: imagePosition }} />;
}
