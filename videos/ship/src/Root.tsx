import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './lib/kit';
import {Template, TemplateWide, DURATION as TD} from './Template';
import {Ship, ShipWide, DURATION} from './Ship';
import {ThumbTall, ThumbWide} from './Thumbs';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ship" component={Ship} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="ShipWide" component={ShipWide} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="ThumbTall" component={ThumbTall} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbWide" component={ThumbWide} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="Template" component={Template} durationInFrames={Math.round(TD * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="TemplateWide" component={TemplateWide} durationInFrames={Math.round(TD * FPS)} fps={FPS} width={1920} height={1080} />
  </>
);
