import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './lib/kit';
import {GillsVideo, DURATION} from './Gills';
import {ThumbTall, ThumbWide} from './Thumbs';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Gills" component={GillsVideo} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbTall" component={ThumbTall} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbWide" component={ThumbWide} durationInFrames={1} fps={FPS} width={1280} height={720} />
  </>
);
