import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './lib/kit';
import {CatVideo, CatWide, CatFx, DURATION} from './CatLand';
import {ThumbTall, ThumbWide} from './Thumbs';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Cat" component={CatVideo} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="CatWide" component={CatWide} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="CatFx" component={CatFx} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbTall" component={ThumbTall} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbWide" component={ThumbWide} durationInFrames={1} fps={FPS} width={1280} height={720} />
  </>
);
