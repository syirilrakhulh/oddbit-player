/* eslint-disable @eslint-react/web-api/no-leaked-event-listener */
import { cx } from 'class-variance-authority';
import { useCallback, useEffect, useRef, useState } from 'react';
import Watermark from '~/assets/images/watermark.svg?react';
import ErrorState from './error-state';
import LoadingState from './loading-state';
import PlayerControl from './player-control';

interface VideoPlayerProps {
  videoId: string;
  autoPlay?: boolean;
}

export type VideoState = 'loading' | 'ready' | 'playing' | 'paused' | 'error';

const VideoPlayer = ({ videoId, autoPlay = false }: VideoPlayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const seekBarRef = useRef<HTMLInputElement>(null);
  const [videoState, setVideoState] = useState<VideoState>('loading');
  const [isMuted, setIsMuted] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(autoPlay ? 0 : 1);
  const [errorMessage, setErrorMessage] = useState('');
  const [forceShowPlayerControl, setForceShowPlayerControl] = useState(false);
  const [isMobile, setIsMobile] = useState(!window.matchMedia('(min-width: 640px)').matches);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (videoState === 'playing') {
      videoRef.current.pause();
    } else if (videoState === 'paused' || videoState === 'ready') {
      videoRef.current.play().catch((err) => {
        console.error('Play failed:', err);
        setVideoState('error');
        setErrorMessage('Failed to play video');
      });
    }
  }, [videoState]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;

    const newMuteState = !isMuted;
    videoRef.current.muted = newMuteState;
    setIsMuted(newMuteState);

    if (newMuteState) {
      setVolume(0);
    } else {
      setVolume(1);
      videoRef.current.volume = 1;
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;

    videoRef.current.volume = newVolume;
    videoRef.current.muted = newVolume === 0;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleSeek = useCallback((newTime: number) => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const retryOnError = useCallback(() => {
    if (!videoRef.current) return;

    setVideoState('loading');
    setErrorMessage('');

    /** Try to reload the video */
    videoRef.current.load();
  }, []);

  useEffect(() => {
    if (!videoId) return;

    const initWebGL = () => {
      if (!canvasRef.current || !videoRef.current) return;

      const gl = canvasRef.current.getContext('webgl2');

      if (!gl) {
        setVideoState('error');
        setErrorMessage('WebGL not supported in your browser');
        return;
      }

      const vertexShaderSource = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        void main() {
          gl_Position = vec4(a_position, 0, 1);
          v_texCoord = a_texCoord;
        }
      `;

      const fragmentShaderSource = `
        precision mediump float;
        uniform sampler2D u_image;
        varying vec2 v_texCoord;
        void main() {
          gl_FragColor = texture2D(u_image, v_texCoord);
        }
      `;

      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

      if (!vertexShader || !fragmentShader) {
        setVideoState('error');
        setErrorMessage('Failed to create shaders');
        return;
      }

      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.shaderSource(fragmentShader, fragmentShaderSource);

      gl.compileShader(vertexShader);
      gl.compileShader(fragmentShader);

      const program = gl.createProgram();

      if (!program) {
        setVideoState('error');
        setErrorMessage('Failed to create shader program');
        return;
      }

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);

      const positionBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]), gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, 'a_position');

      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      const texCoordBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0]), gl.STATIC_DRAW);

      const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

      const texture = gl.createTexture();

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      const updateCanvasSize = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const videoWidth = videoRef.current.videoWidth || 1280;
        const videoHeight = videoRef.current.videoHeight || 720;

        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        gl.viewport(0, 0, videoWidth, videoHeight);
      };

      const render = () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
          return;
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoRef.current);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(render);
      };

      const handlePlay = () => {
        render();
      };

      const handleLoadedMetadata = () => {
        updateCanvasSize();
      };

      videoRef.current.addEventListener('play', handlePlay);
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('play', handlePlay);
          videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      };
    };

    const fetchVideo = () => {
      if (!videoRef.current) return;

      videoRef.current.src = `http://localhost:3000/api/video/${videoId}`;
      videoRef.current.load();
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;

      videoRef.current.oncanplay = () => {
        setVideoState('ready');
        if (autoPlay) {
          videoRef.current
            ?.play()
            .then(() => setVideoState('playing'))
            .catch(() => setVideoState('paused'));
        } else {
          setVideoState('paused');
        }
      };

      videoRef.current.onerror = () => {
        setVideoState('error');
        setErrorMessage('Failed to load video');
      };
    };

    const cleanup = initWebGL();
    fetchVideo();

    return cleanup;
  }, [videoId, autoPlay, isMuted, volume]);

  useEffect(() => {
    if (forceShowPlayerControl) {
      /** Auto hide player control after 3 seconds */
      const timer = setTimeout(() => {
        setForceShowPlayerControl(false);
        clearTimeout(timer);
      }, 3000);
    }
  }, [forceShowPlayerControl]);

  useEffect(() => {
    if (!window) return;

    const media = window.matchMedia('(min-width: 640px)');

    /** Media query change handler */
    const onChangeMedia = () => {
      setIsMobile(!media.matches);
    };

    /** Listen to media query change */
    media.addEventListener('change', onChangeMedia);

    return () => {
      /** Remove media query change listener */
      media.removeEventListener('change', onChangeMedia);
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    /** Update current time and seek bar value */
    const onTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      if (seekBarRef.current) {
        seekBarRef.current.value = videoElement.currentTime.toString();
      }
    };

    /** Update duration */
    const onDurationChange = () => {
      setDuration(videoElement.duration);
    };

    /** Set video state */
    const onPlay = () => setVideoState('playing');
    const onPause = () => setVideoState('paused');
    const onEnded = () => setVideoState('paused');
    const onError = () => {
      setVideoState('error');
      setErrorMessage('An error occurred while playing the video');
    };

    /** Add video event listeners */
    videoElement.addEventListener('timeupdate', onTimeUpdate);
    videoElement.addEventListener('durationchange', onDurationChange);
    videoElement.addEventListener('play', onPlay);
    videoElement.addEventListener('pause', onPause);
    videoElement.addEventListener('ended', onEnded);
    videoElement.addEventListener('error', onError);

    return () => {
      /** Remove video event listeners */
      videoElement.removeEventListener('timeupdate', onTimeUpdate);
      videoElement.removeEventListener('durationchange', onDurationChange);
      videoElement.removeEventListener('play', onPlay);
      videoElement.removeEventListener('pause', onPause);
      videoElement.removeEventListener('ended', onEnded);
      videoElement.removeEventListener('error', onError);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /** Set isFullscreen state when fullscreen change */
    const onFullscreenChange = () => {
      const isInFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isInFullscreen);

      if (canvasRef.current && videoRef.current) {
        const videoWidth = videoRef.current.videoWidth || 1280;
        const videoHeight = videoRef.current.videoHeight || 720;

        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const gl = canvasRef.current.getContext('webgl2');
        if (gl) {
          gl.viewport(0, 0, videoWidth, videoHeight);
        }
      }
    };

    /** Listen to fullscreen change */
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      /** Remove fullscreen change listener */
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={isMobile ? () => setForceShowPlayerControl(true) : undefined}
      className={`group relative overflow-hidden rounded-lg bg-black ${isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video w-full'}`}
    >
      {/* Hidden video element for video stream */}
      <video ref={videoRef} className="oddbit-player hidden" playsInline crossOrigin="anonymous" />

      {/* Canvas for WebGL rendering */}
      <canvas ref={canvasRef} className="m-auto h-full w-fit" />

      {/* Video id watermark */}
      <div className="pointer-events-none absolute top-4 left-4 z-1 rounded border border-white/50 bg-white/25 px-1 py-0.5 text-xs text-white">
        {videoId}
      </div>

      {/* Watermark */}
      <Watermark
        className={cx(
          'pointer-events-none absolute top-4 right-4 z-1 h-4 w-auto text-white opacity-0 duration-300 group-hover:opacity-100',
          forceShowPlayerControl ? 'opacity-100' : '',
          ['error', 'loading'].includes(videoState) && !isFullscreen ? 'hidden' : 'visible',
        )}
      />

      {/* Loading state */}
      {videoState === 'loading' && (
        <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
          <LoadingState title="Loading video..." className="text-white" />
        </div>
      )}

      {/* Error state */}
      {videoState === 'error' && (
        <div className="bg-opacity-70 absolute inset-0 flex items-center justify-center bg-black">
          <ErrorState className="text-white" title="Video Error" message={errorMessage} onClickAction={retryOnError} />
        </div>
      )}

      {/* Video controls */}
      <PlayerControl
        ref={seekBarRef}
        videoState={videoState}
        forceShowPlayerControl={forceShowPlayerControl}
        handleSeek={handleSeek}
        togglePlay={togglePlay}
        toggleMute={toggleMute}
        isMuted={isMuted}
        volume={volume}
        handleVolumeChange={handleVolumeChange}
        currentTime={currentTime}
        duration={duration}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />
    </div>
  );
};

export default VideoPlayer;
