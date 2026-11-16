import { describe, expect, it } from 'vitest';
import { CREATOR, cleanRef, outsideLinksAllowed, detectChannel, emailAllowed, PUBLIC_URL, shareUrl } from './channel';

describe('channel', () => {
  it('detects portals from the page or the parent frame', () => {
    expect(detectChannel('html-classic.itch.zone')).toBe('itch');
    expect(detectChannel('games.crazygames.com')).toBe('crazygames');
    expect(detectChannel('abc.poki-gdn.com')).toBe('poki');
    expect(detectChannel('cdn.example.net', ['www.crazygames.com'])).toBe('crazygames');
    expect(detectChannel('vanful.vercel.app')).toBe('web');
    expect(detectChannel('localhost')).toBe('dev');
    expect(detectChannel('someone-else.com')).toBe('other');
    expect(detectChannel('notitch.zone.evil.com')).toBe('other');
  });
  it('a portal build wins over the host', () => {
    expect(detectChannel('cdn.example.net', [], 'crazygames')).toBe('crazygames');
  });
  it('keeps only short, plain ref tags', () => {
    expect(cleanRef('?ref=HN')).toBe('hn');
    expect(cleanRef('?ref=r-webgames')).toBe('r-webgames');
    expect(cleanRef('?ref=me@mail.com')).toBeUndefined();
    expect(cleanRef('?ref=' + 'x'.repeat(30))).toBeUndefined();
    expect(cleanRef('')).toBeUndefined();
  });
  it('never shares an iframe address; no outside links or email on CrazyGames/Poki', () => {
    expect(shareUrl('itch', 'https://html-classic.itch.zone/html/1/index.html')).toBe(PUBLIC_URL);
    expect(shareUrl('web', 'https://vanful.vercel.app/')).toBe('https://vanful.vercel.app/');
    expect(shareUrl('crazygames', 'x')).toBe('');
    expect(emailAllowed('crazygames')).toBe(false);
    expect(emailAllowed('poki')).toBe(false);
    expect(emailAllowed('itch')).toBe(true);
  });
  it('links the creator only where outside links are allowed', () => {
    expect(CREATOR.url).toBe('https://cowfounder.com');
    expect(outsideLinksAllowed('web')).toBe(true);
    expect(outsideLinksAllowed('itch')).toBe(true);
    expect(outsideLinksAllowed('crazygames')).toBe(false);
    expect(outsideLinksAllowed('poki')).toBe(false);
  });
});
