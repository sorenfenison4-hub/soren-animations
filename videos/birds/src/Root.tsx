import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './lib/kit';
import {Template, TemplateWide, DURATION as TD} from './Template';
import {Birds, BirdsWide, DURATION} from './Birds';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Birds" component={Birds} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="BirdsWide" component={BirdsWide} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="Template" component={Template} durationInFrames={Math.round(TD * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="TemplateWide" component={TemplateWide} durationInFrames={Math.round(TD * FPS)} fps={FPS} width={1920} height={1080} />
  </>
);
