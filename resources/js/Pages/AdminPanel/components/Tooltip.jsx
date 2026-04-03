import React from 'react';
import { createPortal } from 'react-dom';

export default function Tooltip({
    children,
    text,
    position = 'top',
    wrapperClass = "inline-flex items-center justify-center",
    style
}) {
    const [isVisible, setIsVisible] = React.useState(false);
    const [coords, setCoords] = React.useState({ top: -9999, left: -9999 });
    const [actualPos, setActualPos] = React.useState(position);
    const [arrowStyles, setArrowStyles] = React.useState({});

    const wrapperRef = React.useRef(null);
    const tooltipRef = React.useRef(null);

    React.useLayoutEffect(() => {
        if (isVisible && wrapperRef.current && tooltipRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            let top;
            let left;
            let calcPos = position;

            const spaceTop = rect.top;
            const spaceBottom = window.innerHeight - rect.bottom;
            const spaceLeft = rect.left;
            const spaceRight = window.innerWidth - rect.right;

            if (position === 'top' && spaceTop < tooltipRect.height + 15 && spaceBottom > tooltipRect.height + 15) calcPos = 'bottom';
            if (position === 'bottom' && spaceBottom < tooltipRect.height + 15 && spaceTop > tooltipRect.height + 15) calcPos = 'top';
            if (position === 'left' && spaceLeft < tooltipRect.width + 15 && spaceRight > tooltipRect.width + 15) calcPos = 'right';
            if (position === 'right' && spaceRight < tooltipRect.width + 15 && spaceLeft > tooltipRect.width + 15) calcPos = 'left';

            setActualPos(calcPos);

            const GAP = 8;

            switch (calcPos) {
                case 'top':
                    top = rect.top - tooltipRect.height - GAP;
                    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                    break;
                case 'bottom':
                    top = rect.bottom + GAP;
                    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                    break;
                case 'left':
                    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                    left = rect.left - tooltipRect.width - GAP;
                    break;
                case 'right':
                    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                    left = rect.right + GAP;
                    break;
            }

            if (calcPos === 'top' || calcPos === 'bottom') {
                if (left < 10) left = 10;
                if (left + tooltipRect.width > window.innerWidth - 10) left = window.innerWidth - tooltipRect.width - 10;
                let arrowLeft = rect.left + (rect.width / 2) - left;
                arrowLeft = Math.max(10, Math.min(tooltipRect.width - 10, arrowLeft));
                setArrowStyles({ left: `${arrowLeft}px`, transform: 'translateX(-50%)' });
            } else {
                if (top < 10) top = 10;
                if (top + tooltipRect.height > window.innerHeight - 10) top = window.innerHeight - tooltipRect.height - 10;
                let arrowTop = rect.top + (rect.height / 2) - top;
                arrowTop = Math.max(10, Math.min(tooltipRect.height - 10, arrowTop));
                setArrowStyles({ top: `${arrowTop}px`, transform: 'translateY(-50%)' });
            }

            setCoords({ top, left });
        }
    }, [isVisible, position, text]);

    return (
        <div
            ref={wrapperRef}
            className={`relative group ${wrapperClass}`}
            style={style}
            onMouseEnter={() => text && setIsVisible(true)}
            onMouseLeave={() => {
                setIsVisible(false);
                setCoords({ top: -9999, left: -9999 });
            }}
        >
            {children}
            {isVisible && text && createPortal(
                <div
                    ref={tooltipRef}
                    className="fixed whitespace-nowrap bg-slate-800 text-white text-[10px] px-2.5 py-1.5 rounded z-[99999] shadow-xl pointer-events-none transition-opacity duration-200 animate-in fade-in zoom-in-95"
                    style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
                >
                    {text}
                    <div
                        className={`absolute w-0 h-0 ${actualPos === 'top' ? 'top-full border-t-slate-800 border-x-transparent border-b-transparent border-[5px]' :
                            actualPos === 'bottom' ? 'bottom-full border-b-slate-800 border-x-transparent border-t-transparent border-[5px]' :
                                actualPos === 'left' ? 'left-full border-l-slate-800 border-y-transparent border-r-transparent border-[5px]' :
                                    'right-full border-r-slate-800 border-y-transparent border-l-transparent border-[5px]'
                            }`}
                        style={arrowStyles}
                    ></div>
                </div>,
                document.body
            )}
        </div>
    );
}
