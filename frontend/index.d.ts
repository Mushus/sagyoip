interface MediaDevices {
  getDisplayMedia(constraints?: MediaStreamConstraints | undefined): Promise<MediaStream>;
}
