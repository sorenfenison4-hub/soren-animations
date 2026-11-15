import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './lib/kit';
import {Template, TemplateWide, DURATION} from './Template';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Template" component={Template} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="TemplateWide" component={TemplateWide} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1920} height={1080} />
  </>
);
