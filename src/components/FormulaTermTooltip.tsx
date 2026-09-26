import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FormulaTerm } from '@/utils/formula-notation';

/** A tooltip outside the equation's scroll area, shared by inline and display math. */
export function useFormulaTermTooltip(terms: FormulaTerm[], disabled = false, keyboardTerms = true) {
    const ref = useRef<HTMLDivElement>(null);
    const id = useId();
    const [tip, setTip] = useState<{term: FormulaTerm; left: number; top: number; above: boolean; width: number}>();
    useEffect(() => {
        const root = ref.current;
        if (!root) return;
        const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-formula-term]'));
        for (const el of elements) {
            const term = terms.find(t => t.id === el.dataset.formulaTerm);
            if (!term) continue;
            if (keyboardTerms) el.tabIndex = 0;
            el.setAttribute('aria-label', `${term.symbol}: ${term.definition}`);
        }
        let anchor: HTMLElement | undefined;
        const hide = () => { anchor?.removeAttribute('aria-describedby'); anchor = undefined; setTip(undefined); };
        const show = (event: Event) => {
            if (disabled) return;
            const el = (event.target as Element).closest<HTMLElement>('[data-formula-term]');
            const term = terms.find(t => t.id === el?.dataset.formulaTerm);
            if (!el || !term) { hide(); return; }
            if (anchor === el) return;
            anchor?.removeAttribute('aria-describedby');
            anchor = el;
            el.setAttribute('aria-describedby', id);
            const rect = el.getBoundingClientRect();
            const width = Math.min(280, window.innerWidth - 24);
            const above = rect.top > 110;
            setTip({term, width, above, left: Math.max(12, Math.min(window.innerWidth-width-12, rect.left+rect.width/2-width/2)), top: above ? rect.top-10 : rect.bottom+10});
        };
        const leave = (event: Event) => {
            const next = (event as MouseEvent | FocusEvent).relatedTarget;
            if (!(next instanceof Node) || !root.contains(next)) hide();
        };
        const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') hide(); };
        root.addEventListener('mouseover', show);
        root.addEventListener('mouseleave', hide);
        root.addEventListener('focusin', show);
        root.addEventListener('focusout', leave);
        window.addEventListener('scroll', hide, true);
        window.addEventListener('resize', hide);
        window.addEventListener('keydown', escape);
        return () => {
            hide();
            elements.forEach(el => { el.removeAttribute('tabindex'); el.removeAttribute('aria-label'); });
            root.removeEventListener('mouseover', show);
            root.removeEventListener('mouseleave', hide);
            root.removeEventListener('focusin', show);
            root.removeEventListener('focusout', leave);
            window.removeEventListener('scroll', hide, true);
            window.removeEventListener('resize', hide);
            window.removeEventListener('keydown', escape);
        };
    }, [terms, disabled, keyboardTerms, id]);
    return {ref, tooltip: tip && !disabled && createPortal(
        <div id={id} role="tooltip" className="formula-element-tooltip" style={{left: tip.left, top: tip.top, width: tip.width, transform: tip.above ? 'translateY(-100%)' : undefined, '--term-color': tip.term.color} as React.CSSProperties}>
            {tip.term.definition}
        </div>, document.body
    )};
}
