import { useRef, useState, type FormEvent } from 'react';
import { usePlaying } from '../../hooks/usePlaying';
import { Check, Copy, Send } from 'lucide-react';
import { content } from '../../content/portfolio';
import { isFilled } from '../../content/placeholder';
import { usableUrl } from '../../lib/content';
import { SOCIALS } from '../../lib/socials';
import { useAppStore } from '../../store/useAppStore';
import { gsap, SplitText, useGSAP } from '../../lib/gsap';
import { sfx } from '../../audio/synth';
import { SectionHeader } from '../ui/SectionHeader';
import { Placeholder } from '../ui/Placeholder';
import { Panel } from '../ui/Panel';
import { MagneticButton } from '../ui/MagneticButton';
import { SocialIcon } from '../ui/Icons';

type Field = 'name' | 'email' | 'message';
type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY?.trim();
const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID?.trim();

function validate(field: Field, v: string): string | null {
  const s = v.trim();
  if (field === 'name') return s.length < 2 ? 'NOM TROP COURT (2 CARACTÈRES MIN.)' : null;
  if (field === 'email') return !EMAIL_RE.test(s) ? 'EMAIL INVALIDE' : null;
  return s.length < 10 ? 'MESSAGE TROP COURT (10 CARACTÈRES MIN.)' : null;
}

/** Envoie le message : Web3Forms, sinon Formspree, sinon ouvre le client mail (mailto:). */
async function send(data: Record<Field, string>): Promise<'sent' | 'mailto'> {
  const subject = `[Portfolio] Nouveau message de ${data.name}`;
  if (WEB3FORMS_KEY) {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject, from_name: data.name, ...data }),
    });
    const json = (await res.json().catch(() => ({}))) as { success?: boolean };
    if (!res.ok || json.success === false) throw new Error('web3forms');
    return 'sent';
  }
  if (FORMSPREE_ID) {
    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...data, _subject: subject }),
    });
    if (!res.ok) throw new Error('formspree');
    return 'sent';
  }
  if (isFilled(content.contact.email)) {
    const body = `${data.message}\n\n— ${data.name} (${data.email})`;
    window.location.href = `mailto:${content.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return 'mailto';
  }
  throw new Error('no-channel');
}

/** 07 — JOIN MY PARTY : formulaire style terminal, copie d'email, réseaux. */
export function Contact() {
  const playing = usePlaying();
  const { contact } = content;
  const root = useRef<HTMLElement>(null);
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', message: '' });
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    name: false,
    email: false,
    message: false,
  });
  const [status, setStatus] = useState<Status>('idle');
  const [sysMsg, setSysMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);
  const unlock = useAppStore((s) => s.unlock);
  const pushToast = useAppStore((s) => s.pushToast);
  const email = isFilled(contact.email) ? contact.email : null;
  const socials = contact.socials
    .map((s) => ({ ...s, href: usableUrl(s.url) }))
    .filter((s) => s.href || import.meta.env.DEV);

  useGSAP(
    () => {
      if (!playing) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const title = root.current?.querySelector<HTMLElement>('#contact-title');
        if (title) {
          SplitText.create(title, {
            type: 'chars',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.chars, {
                opacity: 0,
                scale: 2,
                yPercent: -30,
                duration: 0.9,
                ease: 'expo.out',
                stagger: { each: 0.035, from: 'random' },
                scrollTrigger: { trigger: title, start: 'top 85%' },
              }),
          });
        }
        gsap.from('[data-anim="contact-col"]', {
          y: 50,
          opacity: 0,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.15,
          scrollTrigger: { trigger: '[data-anim="contact-col"]', start: 'top 85%' },
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [playing] },
  );

  const errors: Record<Field, string | null> = {
    name: validate('name', values.name),
    email: validate('email', values.email),
    message: validate('message', values.message),
  };
  const valid = !errors.name && !errors.email && !errors.message;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const honeypot = (e.currentTarget.elements.namedItem('botcheck') as HTMLInputElement | null)
      ?.checked;
    setTouched({ name: true, email: true, message: true });
    if (!valid) {
      sfx.error();
      setSysMsg('[ERROR] TRANSMISSION REFUSÉE — CORRIGE LES CHAMPS EN ROUGE');
      return;
    }
    if (honeypot) return;
    setStatus('sending');
    setSysMsg('> CHIFFREMENT DU PAQUET… UPLINK EN COURS');
    sfx.transmit();
    const bar = progressRef.current;
    const anim = bar
      ? gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 0.85, duration: 1.4, ease: 'power2.out' })
      : null;
    try {
      const [result] = await Promise.all([send(values), new Promise((r) => setTimeout(r, 1200))]);
      anim?.kill();
      if (bar) gsap.to(bar, { scaleX: 1, duration: 0.3, ease: 'power3.out' });
      setStatus('sent');
      setSysMsg(
        result === 'sent'
          ? 'TRANSMISSION SENT ✔ — RÉPONSE SOUS PEU'
          : '> CLIENT MAIL OUVERT ✔ — IL NE RESTE QU’À ENVOYER',
      );
      sfx.achievement();
      if (result === 'sent') setValues({ name: '', email: '', message: '' });
      setTouched({ name: false, email: false, message: false });
    } catch {
      anim?.kill();
      setStatus('error');
      sfx.error();
      setSysMsg(
        email
          ? `[ERROR] ÉCHEC DE TRANSMISSION — ÉCRIS-MOI DIRECTEMENT : ${email}`
          : '[ERROR] AUCUN CANAL CONFIGURÉ (voir README : formulaire de contact)',
      );
    }
  };

  const copyEmail = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    unlock('networker');
    pushToast({ kind: 'system', title: 'EMAIL COPIÉ ✔', subtitle: email });
    window.setTimeout(() => setCopied(false), 2200);
  };

  const fieldRow = (field: Field, label: string, multiline = false) => {
    const err = touched[field] ? errors[field] : null;
    const ok = touched[field] && !errors[field];
    const common = {
      id: `f-${field}`,
      name: field,
      value: values[field],
      onChange: (e: { target: { value: string } }) =>
        setValues((v) => ({ ...v, [field]: e.target.value })),
      onBlur: () => setTouched((t) => ({ ...t, [field]: values[field].length > 0 || t[field] })),
      'aria-invalid': !!err,
      'aria-describedby': `f-${field}-msg`,
      className: 'tfield__input',
      'data-cursor': 'TYPE',
      required: true,
    };
    return (
      <div className={`tfield ${err ? 'is-error' : ''} ${ok ? 'is-ok' : ''}`}>
        <label htmlFor={`f-${field}`} className="tfield__label">
          &gt; {label}
          <span className="caret" aria-hidden="true" />
        </label>
        {multiline ? (
          <textarea rows={5} {...common} />
        ) : (
          <input
            type={field === 'email' ? 'email' : 'text'}
            autoComplete={field === 'email' ? 'email' : 'name'}
            {...common}
          />
        )}
        <p id={`f-${field}-msg`} className="tfield__msg" aria-live="polite">
          {err ? `[ERROR] ${err}` : ok ? '[OK]' : ' '}
        </p>
      </div>
    );
  };

  return (
    <section ref={root} id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="section-inner">
        <SectionHeader id="contact" align="center" />
        <div className="text-center -mt-6 mb-12 max-w-2xl mx-auto">
          <Placeholder
            value={contact.subtitle}
            as="p"
            className="prose-neon text-lg mx-auto"
            field="contact.subtitle"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <Panel className="lg:col-span-7" innerClassName="p-5 sm:p-8" data-anim="contact-col">
            <form onSubmit={onSubmit} noValidate aria-describedby="form-sys">
              <p className="micro mb-6">
                <span className="micro-accent">//</span> OPEN_CHANNEL · ENCRYPTION AES-256 (pour le
                style)
              </p>
              {fieldRow('name', 'NOM_')}
              {fieldRow('email', 'EMAIL_')}
              {fieldRow('message', 'MESSAGE_', true)}
              <label className="sr-only">
                Ne pas cocher (anti-spam)
                <input type="checkbox" name="botcheck" tabIndex={-1} />
              </label>

              <div className="flex flex-wrap items-center gap-4 mt-2">
                <MagneticButton type="submit" disabled={status === 'sending'} cursor="SEND">
                  <Send size={16} aria-hidden="true" />{' '}
                  {status === 'sending' ? 'Transmission…' : 'Send transmission'}
                </MagneticButton>
                <span className="send-progress" aria-hidden="true">
                  <span ref={progressRef} className="send-progress__bar" />
                </span>
              </div>
              <p
                id="form-sys"
                className={`form-sys form-sys--${status}`}
                role="status"
                aria-live="polite"
              >
                {sysMsg || ' '}
              </p>
            </form>
          </Panel>

          <div className="lg:col-span-5 flex flex-col gap-6" data-anim="contact-col">
            {(email || import.meta.env.DEV) && (
              <Panel innerClassName="p-5 sm:p-7">
                <p className="micro mb-3">
                  <span className="micro-accent">//</span> DIRECT_LINK
                </p>
                {email ? (
                  <>
                    <a href={`mailto:${email}`} className="contact-email" data-cursor="MAIL">
                      {email}
                    </a>
                    <button
                      type="button"
                      className="btn-neon btn-sm mt-4"
                      onClick={copyEmail}
                      data-cursor="COPY"
                      onPointerEnter={() => sfx.hover()}
                    >
                      {copied ? (
                        <Check size={14} aria-hidden="true" />
                      ) : (
                        <Copy size={14} aria-hidden="true" />
                      )}
                      {copied ? 'Copié ✔' : "Copier l'email"}
                    </button>
                  </>
                ) : (
                  <Placeholder value={contact.email} field="contact.email" block />
                )}
              </Panel>
            )}

            {socials.length > 0 && (
              <Panel innerClassName="p-5 sm:p-7">
                <p className="micro mb-4">
                  <span className="micro-accent">//</span> NETWORK_NODES
                </p>
                <ul className="grid grid-cols-2 gap-3">
                  {socials.map((s, i) => (
                    <li key={i}>
                      {s.href ? (
                        <MagneticButton
                          href={s.href}
                          external
                          className="social-btn"
                          cursor="VIEW"
                          ariaLabel={`${SOCIALS[s.platform].label} (nouvel onglet)`}
                          strength={0.4}
                        >
                          <SocialIcon platform={s.platform} />
                          <span>{SOCIALS[s.platform].label}</span>
                        </MagneticButton>
                      ) : (
                        <div className="social-btn is-todo">
                          <SocialIcon platform={s.platform} />
                          <Placeholder value={s.url} field={SOCIALS[s.platform].label} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
