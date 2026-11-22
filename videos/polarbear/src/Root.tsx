import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './lib/kit';
import {PolarVideo, PolarWide, DURATION} from './PolarBear';
import {ThumbTall, ThumbWide} from './Thumbs';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PolarBear" component={PolarVideo} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="PolarBearWide" component={PolarWide} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="ThumbTall" component={ThumbTall} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbWide" component={ThumbWide} durationInFrames={1} fps={FPS} width={1280} height={720} />
  </>
);
