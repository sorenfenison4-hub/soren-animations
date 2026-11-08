import React from 'react';
import {Composition} from 'remotion';
import {ElevatorShort, Thumbnail, ThumbnailTall, DURATION, FPS} from './elevator/ElevatorShort';
export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="ElevatorShort" component={ElevatorShort} durationInFrames={Math.round(DURATION * FPS)}
    fps={FPS} width={1080} height={1920} />
  <Composition id="ElevatorShortWide" component={ElevatorShort} durationInFrames={Math.round(DURATION * FPS)}
    fps={FPS} width={1920} height={1080} />
  <Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} />
  <Composition id="ThumbnailTall" component={ThumbnailTall} durationInFrames={1} fps={FPS} width={1080} height={1920} />
  </>
);
