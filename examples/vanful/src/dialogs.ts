// Small, accessible HTML dialogs over the canvas (real inputs: keyboards, autofill, screen readers).

interface AskOpts {
  title: string;
  label: string;
  type: 'email' | 'text';
  submit: string;
  note?: string;
  /** Returns an error message to show, or null when done. */
  onSubmit: (value: string) => Promise<string | null>;
}

export function ask(o: AskOpts): Promise<void> {
  return new Promise((resolve) => {
    const d = document.createElement('dialog');
    d.className = 'vf-dialog';
    d.innerHTML = `
      <form method="dialog">
        <h2></h2>
        <label><span></span><input required autocomplete="${o.type === 'email' ? 'email' : 'off'}" /></label>
        <p class="note"></p>
        <p class="err" role="alert"></p>
        <div class="row"><button type="button" class="ghost" value="cancel">Cancel</button><button type="submit" class="go"></button></div>
      </form>`;
    d.querySelector('h2')!.textContent = o.title;
    d.querySelector('label span')!.textContent = o.label;
    const input = d.querySelector('input')!;
    input.type = o.type;
    d.querySelector('.note')!.textContent = o.note ?? '';
    d.querySelector('.go')!.textContent = o.submit;
    const err = d.querySelector('.err')!;
    const close = () => {
      d.close();
      d.remove();
      resolve();
    };
    // Keys typed in the dialog must not reach the game (Phaser listens on window).
    for (const t of ['keydown', 'keyup', 'keypress']) d.addEventListener(t, (e) => e.stopPropagation());
    d.querySelector('.ghost')!.addEventListener('click', close);
    d.addEventListener('cancel', close);
    d.querySelector('form')!.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      err.textContent = '';
      const msg = await o.onSubmit(input.value);
      if (msg) err.textContent = msg;
      else close();
    });
    document.body.appendChild(d);
    d.showModal();
    input.focus();
  });
}

export interface FeedbackAnswers { door_rule: 'yes' | 'sort_of' | 'no'; fun: number; play_tomorrow: 'yes' | 'maybe' | 'no'; comment: string }

/** The 3-question playtest card. Resolves with the answers, or null if the player closes it. */
export function askFeedback(onSubmit: (a: FeedbackAnswers) => Promise<string | null>): Promise<boolean> {
  return new Promise((resolve) => {
    const d = document.createElement('dialog');
    d.className = 'vf-dialog vf-feedback';
    const radios = (name: string, opts: [string, string][]) =>
      opts.map(([v, l]) => `<label class="pill"><input type="radio" name="${name}" value="${v}" required /> <span>${l}</span></label>`).join('');
    d.innerHTML = `
      <form method="dialog">
        <h2>3 quick questions</h2>
        <fieldset><legend>Did "load the first stop by the door" make sense?</legend>
          <div class="pills">${radios('door_rule', [['yes', 'Yes'], ['sort_of', 'Sort of'], ['no', 'No']])}</div></fieldset>
        <fieldset><legend>How fun was it?</legend>
          <div class="pills">${radios('fun', [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']])}</div></fieldset>
        <fieldset><legend>Would you play tomorrow's Daily Load?</legend>
          <div class="pills">${radios('play_tomorrow', [['yes', 'Yes'], ['maybe', 'Maybe'], ['no', 'No']])}</div></fieldset>
        <label>Anything else? <span class="opt">(optional)</span><textarea name="comment" maxlength="500" rows="3"></textarea></label>
        <p class="note">Anonymous: no name or email. Thank you!</p>
        <p class="err" role="alert"></p>
        <div class="row"><button type="button" class="ghost">Not now</button><button type="submit" class="go">Send</button></div>
      </form>`;
    for (const t of ['keydown', 'keyup', 'keypress']) d.addEventListener(t, (e) => e.stopPropagation());
    const close = (sent: boolean) => {
      d.close();
      d.remove();
      resolve(sent);
    };
    d.querySelector('.ghost')!.addEventListener('click', () => close(false));
    d.addEventListener('cancel', () => close(false));
    const form = d.querySelector('form')!;
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const f = new FormData(form);
      const err = d.querySelector('.err')!;
      err.textContent = '';
      const msg = await onSubmit({
        door_rule: f.get('door_rule') as FeedbackAnswers['door_rule'],
        fun: Number(f.get('fun')),
        play_tomorrow: f.get('play_tomorrow') as FeedbackAnswers['play_tomorrow'],
        comment: String(f.get('comment') ?? '').trim().slice(0, 500),
      });
      if (msg) err.textContent = msg;
      else close(true);
    });
    document.body.appendChild(d);
    d.showModal();
    (d.querySelector('input') as HTMLInputElement).focus();
  });
}
