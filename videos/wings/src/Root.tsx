import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './lib/kit';
import {WingsVideo, WingsWide, DURATION} from './Wings';
import {ThumbTall, ThumbWide} from './Thumbs';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Wings" component={WingsVideo} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="WingsWide" component={WingsWide} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="ThumbTall" component={ThumbTall} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbWide" component={ThumbWide} durationInFrames={1} fps={FPS} width={1280} height={720} />
  </>
);
