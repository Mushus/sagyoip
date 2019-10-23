interface MediaDevices {
  getDisplayMedia(constraints?: MediaStreamConstraints | undefined): Promise<MediaStream>;
}

declare module 'random-id' {
  export default function(len?: number, pattern?: string): string;
}
