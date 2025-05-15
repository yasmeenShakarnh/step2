import React, { useEffect, useRef } from 'react';

const ThreeDScene = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (iframeRef.current) {
        const rect = iframeRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        iframeRef.current.contentWindow.postMessage({
          type: 'mouseMove',
          x,
          y
        }, '*');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-3xl bg-gradient-to-br from-blue-100 via-white to-orange-100 border border-blue-200">
      <iframe
        ref={iframeRef}
        src="https://my.spline.design/genkubgreetingrobot-mMiauwOCizWfYe8LqED7fiD6/"
        className="w-full h-full"
        title="Interactive 3D Learning"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default ThreeDScene;