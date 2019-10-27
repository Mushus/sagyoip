interface MediaTrackConstraints {
  frameRate?: number;
  width?: number;
  height?: number;
}

interface MediaDevices {
  getDisplayMedia(constraints?: MediaStreamConstraints | undefined): Promise<MediaStream>;
}

declare module 'random-id' {
  export default function(len?: number, pattern?: string): string;
}
