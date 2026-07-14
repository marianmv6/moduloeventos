import React, { useEffect, useState } from 'react';
import { LevelTooltip } from '../../risk-rules/components/shared/LevelTooltip';
import streamingPreview from '../../../assets/streaming-preview.png';
import type {
  TratativaStreamingCamera,
  TratativaStreamingData,
} from '../types/tratativaOcorrencia.types';

const STREAM_DURATION_MS = 60_000;
const STREAM_LOADING_MS = 2_000;

type StreamPhase = 'idle' | 'loading' | 'streaming' | 'paused';

function IconCameraDevice() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden>
      <path
        d="M2 3.5C2 2.67157 2.67157 2 3.5 2H13.5C14.3284 2 15 2.67157 15 3.5V5.2L18.2 3.4C19.0457 2.9125 20.1 3.52077 20.1 4.5V11.5C20.1 12.4792 19.0457 13.0875 18.2 12.6L15 10.8V12.5C15 13.3284 14.3284 14 13.5 14H3.5C2.67157 14 2 13.3284 2 12.5V3.5Z"
        stroke="#169EFF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2.25" stroke="#169EFF" strokeWidth="1.5" />
    </svg>
  );
}

function IconPlayStream() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path
        d="M14 10.5L34 22L14 33.5V10.5Z"
        stroke="#169EFF"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconNoVideo() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M8 14C8 12.3431 9.34315 11 11 11H25C26.6569 11 28 12.3431 28 14V18.5L33.5 15.3C35.1569 14.3431 37.5 15.5208 37.5 17.5V30.5C37.5 32.4792 35.1569 33.6569 33.5 32.7L28 29.5V34C28 35.6569 26.6569 37 25 37H11C9.34315 37 8 35.6569 8 34V14Z"
        stroke="#C5CDD6"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 38L38 10" stroke="#C5CDD6" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function StreamingSpinner() {
  return <span className="tratativa-streaming-tile__spinner" aria-hidden />;
}

function StreamingCameraTile({ camera }: { camera: TratativaStreamingCamera }) {
  const [phase, setPhase] = useState<StreamPhase>('idle');
  const [hadStream, setHadStream] = useState(false);
  const isOnline = camera.status === 'online';

  useEffect(() => {
    if (phase !== 'loading') return undefined;
    const timer = window.setTimeout(() => setPhase('streaming'), STREAM_LOADING_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'streaming') return undefined;
    setHadStream(true);
    const timer = window.setTimeout(() => setPhase('paused'), STREAM_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const showOverlay = isOnline && (phase === 'idle' || phase === 'paused');
  const showPreview = hadStream && (phase === 'paused' || phase === 'loading');
  const overlayLabel =
    phase === 'paused' ? 'Continuar assistindo' : 'Acompanhar em tempo real';

  const handleStartStream = () => {
    if (!isOnline || phase === 'loading' || phase === 'streaming') return;
    setPhase('loading');
  };

  return (
    <div
      className={`tratativa-streaming-tile tratativa-streaming-tile--${camera.size}${
        phase === 'streaming' ? ' tratativa-streaming-tile--live' : ''
      }${phase === 'idle' ? ' tratativa-streaming-tile--idle' : ''}`}
      aria-label={camera.label}
    >
      {isOnline && <span className="tratativa-streaming-tile__label">{camera.label}</span>}

      {!isOnline && (
        <div className="tratativa-streaming-tile__unavailable">
          <IconNoVideo />
          <span>Não há vídeo disponível.</span>
        </div>
      )}

      {isOnline && showPreview && (
        <div
          className="tratativa-streaming-tile__preview"
          style={{ backgroundImage: `url(${streamingPreview})` }}
          aria-hidden
        />
      )}

      {isOnline && phase === 'loading' && (
        <div
          className={`tratativa-streaming-tile__loading${
            showPreview ? ' tratativa-streaming-tile__loading--with-preview' : ''
          }`}
        >
          <StreamingSpinner />
        </div>
      )}

      {isOnline && phase === 'streaming' && (
        <div className="tratativa-streaming-tile__feed tratativa-streaming-tile__feed--live" aria-hidden />
      )}

      {showOverlay && (
        <button
          type="button"
          className={`tratativa-streaming-tile__overlay${
            phase === 'idle'
              ? ' tratativa-streaming-tile__overlay--idle'
              : ' tratativa-streaming-tile__overlay--paused'
          }`}
          onClick={handleStartStream}
        >
          <IconPlayStream />
          <span>{overlayLabel}</span>
        </button>
      )}
    </div>
  );
}

interface TratativaStreamingPanelProps {
  data: TratativaStreamingData;
}

export const TratativaStreamingPanel: React.FC<TratativaStreamingPanelProps> = ({ data }) => {
  const isDeviceOnline = data.isDeviceOnline;

  return (
    <div className="tratativa-streaming">
      <header className="tratativa-streaming__header">
        <div className="tratativa-streaming__device">
          <IconCameraDevice />
          <span className="tratativa-streaming__device-name">{data.deviceName}</span>
          <LevelTooltip
            text={isDeviceOnline ? 'Online' : 'Dispositivo offline'}
            topLayer
            nowrap
            className="tratativa-streaming__status-tooltip"
            style={{ display: 'inline-flex', flexShrink: 0 }}
          >
            <span
              className={`tratativa-streaming__status-dot${
                isDeviceOnline ? ' tratativa-streaming__status-dot--online' : ''
              }`}
              aria-label={isDeviceOnline ? 'Online' : 'Dispositivo offline'}
            />
          </LevelTooltip>
        </div>
      </header>

      <div className="tratativa-streaming__monitor" role="group" aria-label="Câmeras em tempo real">
        <div className="tratativa-streaming__row tratativa-streaming__row--primary">
          {data.cameras
            .filter((camera) => camera.size === 'large')
            .map((camera) => (
              <StreamingCameraTile key={camera.id} camera={camera} />
            ))}
        </div>
        <div className="tratativa-streaming__row tratativa-streaming__row--secondary">
          {data.cameras
            .filter((camera) => camera.size === 'small')
            .map((camera) => (
              <StreamingCameraTile key={camera.id} camera={camera} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default TratativaStreamingPanel;
