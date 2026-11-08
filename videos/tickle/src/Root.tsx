import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './lib/kit';
import {Template, TemplateWide, DURATION as TD} from './Template';
import {Tickle, TickleWide, DURATION} from './Tickle';
import {ThumbTall, ThumbWide} from './Thumbs';
import {Banner, BannerPlain} from './Banner';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Tickle" component={Tickle} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="TickleWide" component={TickleWide} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="Template" component={Template} durationInFrames={Math.round(TD * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="TemplateWide" component={TemplateWide} durationInFrames={Math.round(TD * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="ThumbTall" component={ThumbTall} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbWide" component={ThumbWide} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="Banner" component={Banner} durationInFrames={1} fps={FPS} width={2560} height={1440} />
    <Composition id="BannerPlain" component={BannerPlain} durationInFrames={1} fps={FPS} width={2560} height={1440} />
  </>
);
