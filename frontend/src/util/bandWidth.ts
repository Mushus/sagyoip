export const setBandwidth = (description: RTCSessionDescriptionInit, audioBandwidth = 32, videoBandwidth = 128) => {
  let sdp = description.sdp;
  if (!sdp) return description;

  sdp = sdp.replace(/a=mid:audio\r\n/g, `a=mid:audio\r\nb=AS:${audioBandwidth}\r\n`);
  sdp = sdp.replace(/a=mid:video\r\n/g, `a=mid:video\r\nb=AS:${videoBandwidth}\r\n`);

  description.sdp = sdp;
  return description;
};
