// Label bundles that server components pass to client islands. Importing the
// messages file inside a client component would ship every string on the site
// (the bundler can't tree-shake it), so islands receive only what they show.
import { common, present, projectPage, rooms, site } from "@/messages/mn";

export const sliderLabels = {
  before: projectPage.before,
  after: projectPage.after,
  compare: projectPage.compareLabel,
};

export const galleryLabels = {
  gallery: projectPage.gallery,
  openPhoto: projectPage.openPhoto,
  prev: projectPage.prev,
  next: projectPage.next,
  close: common.close,
};

export const shareLabels = { share: projectPage.share, copied: projectPage.copied };

export const presenterLabels = { ...present, siteName: site.name, rooms };
