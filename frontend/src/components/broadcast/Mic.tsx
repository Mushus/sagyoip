import React, { useRef, useEffect } from 'react';

interface Props {
  src: MediaStream | null;
}

const Mic = ({ src }: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    audioRef.current && (audioRef.current.srcObject = src);
  }, [src, audioRef.current]);

  return <audio autoPlay ref={audioRef} />;
};

export default Mic;
