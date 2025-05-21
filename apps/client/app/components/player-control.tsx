import { cx } from 'class-variance-authority';
import { type CSSProperties, useCallback, useMemo } from 'react';
import ExitFullscreenIcon from '~/assets/icons/exit-fullscreen.svg?react';
import FullscreenIcon from '~/assets/icons/fullscreen.svg?react';
import MuteIcon from '~/assets/icons/mute.svg?react';
import PauseIcon from '~/assets/icons/pause.svg?react';
import PlayIcon from '~/assets/icons/play.svg?react';
import UnmuteIcon from '~/assets/icons/unmute.svg?react';
import Button from './button';
import Slider from './slider';
import type { VideoState } from './video-player';

interface PlayerControlProps {
  ref?: React.RefObject<HTMLInputElement | null>;
  videoState: VideoState;
  forceShowPlayerControl: boolean;
  handleSeek: (value: number) => void;
  togglePlay: () => void;
  toggleMute: () => void;
  isMuted: boolean;
  volume: number;
  handleVolumeChange: (value: number) => void;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const PlayerControl = ({
  ref,
  videoState,
  forceShowPlayerControl,
  handleSeek,
  togglePlay,
  toggleMute,
  isMuted,
  volume,
  handleVolumeChange,
  currentTime,
  duration,
  isFullscreen,
  toggleFullscreen,
}: PlayerControlProps) => {
  const playerControlStyles = useMemo<CSSProperties>(
    () => ({
      opacity: forceShowPlayerControl ? 1 : 0,
      pointerEvents: forceShowPlayerControl ? 'auto' : 'none',
      visibility: ['error', 'loading'].includes(videoState) && !isFullscreen ? 'hidden' : 'visible',
    }),
    [forceShowPlayerControl, videoState, isFullscreen],
  );

  const formatTime = useCallback((timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const remainingSeconds = timeInSeconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = Math.floor(remainingSeconds % 60);

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  }, []);

  return (
    <div
      style={playerControlStyles}
      className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 group-hover:!pointer-events-auto group-hover:!opacity-100"
    >
      {/* Seek bar */}
      <div className="mb-2 flex items-center">
        <Slider ref={ref} min={0} max={duration || 0} value={currentTime} onChange={handleSeek} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Play/Pause button */}
          <Button
            onClick={togglePlay}
            className="text-white"
            variant="icon-only"
            aria-label={videoState === 'playing' ? 'Pause' : 'Play'}
          >
            {videoState === 'playing' ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
          </Button>

          {/* Volume control */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleMute}
              className="text-white"
              variant="icon-only"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <UnmuteIcon className="h-6 w-6" /> : <MuteIcon className="h-6 w-6" />}
            </Button>
            <Slider
              className={cx('hidden !w-20 xl:block', isFullscreen ? 'sm:block' : '')}
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>

          {/* Time display */}
          <div className="text-sm text-white">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Fullscreen button */}
        <Button
          onClick={toggleFullscreen}
          className="text-white"
          variant="icon-only"
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <ExitFullscreenIcon className="h-6 w-6" /> : <FullscreenIcon className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  );
};

export default PlayerControl;
