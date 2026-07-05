"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export const ORDER_MENU_OPEN_REQUEST = "order-menu-open-request";
export const ORDER_OPEN_MENU = "order-open-menu";
export const ORDER_PROTECTED_LINK_CLICK = "order-protected-link-click";
export const ORDER_BEFORE_BACK_REQUEST = "order-before-back-request";

export function useLeavePageGuard(
    hasPendingSelections: boolean,
    clearSelections: () => void,
) {
    const router = useRouter();
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const pendingNavigationActionRef = useRef<(() => void) | null>(null);
    const isLeavingRef = useRef(false);

    const requestLeaveConfirmation = useCallback((action: () => void) => {
        pendingNavigationActionRef.current = action;
        setShowCloseConfirm(true);
    }, []);

    const handleConfirmLeave = useCallback(() => {
        const action = pendingNavigationActionRef.current;
        pendingNavigationActionRef.current = null;
        setShowCloseConfirm(false);

        if (action) {
            isLeavingRef.current = true;
            action();
            return;
        }

        clearSelections();
    }, [clearSelections]);

    const handleCancelLeave = useCallback(() => {
        pendingNavigationActionRef.current = null;
        setShowCloseConfirm(false);
    }, []);

    const handleBeforeBack = useCallback(() => {
        if (!hasPendingSelections) return true;

        requestLeaveConfirmation(() => {
            clearSelections();
            router.back();
        });

        return false;
    }, [clearSelections, hasPendingSelections, requestLeaveConfirmation, router]);

    useEffect(() => {
        if (!hasPendingSelections) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "لديك اختيارات غير محفوظة";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasPendingSelections]);

    useEffect(() => {
        if (!hasPendingSelections) return;

        const handlePopState = () => {
            if (isLeavingRef.current) {
                isLeavingRef.current = false;
                return;
            }

            window.history.pushState(null, "", window.location.href);
            requestLeaveConfirmation(() => {
                clearSelections();
                isLeavingRef.current = true;
                window.setTimeout(() => window.history.back(), 0);
            });
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [clearSelections, hasPendingSelections, requestLeaveConfirmation]);

    useEffect(() => {
        const handleMenuOpenRequest = (event: Event) => {
            if (!hasPendingSelections) return;

            event.preventDefault();
            requestLeaveConfirmation(() => {
                clearSelections();
                document.dispatchEvent(new Event(ORDER_OPEN_MENU));
            });
        };

        document.addEventListener(
            ORDER_MENU_OPEN_REQUEST,
            handleMenuOpenRequest as EventListener,
        );
        return () =>
            document.removeEventListener(
                ORDER_MENU_OPEN_REQUEST,
                handleMenuOpenRequest as EventListener,
            );
    }, [clearSelections, hasPendingSelections, requestLeaveConfirmation]);

    useEffect(() => {
        if (!hasPendingSelections) return undefined;

        const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"));
        anchors.forEach((anchor) => {
            anchor.classList.add("opacity-50", "cursor-not-allowed");
            anchor.setAttribute("aria-disabled", "true");
            anchor.setAttribute("data-protected-link", "true");
            anchor.setAttribute("tabindex", "-1");
        });

        const restoreAnchors = () => {
            anchors.forEach((anchor) => {
                anchor.classList.remove("opacity-50", "cursor-not-allowed");
                anchor.removeAttribute("aria-disabled");
                anchor.removeAttribute("data-protected-link");
                anchor.removeAttribute("tabindex");
            });
        };

        const handleDocumentClick = (event: MouseEvent) => {
            const target = event.target instanceof Element ? event.target : null;
            const anchor = target?.closest("a[data-protected-link='true']") as HTMLAnchorElement | null;
            if (!anchor) return;
            if (anchor.target === "_blank") return;

            const href = anchor.getAttribute("href");
            if (!href) return;
            if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

            let internalHref = href;
            try {
                const url = new URL(href, window.location.href);
                if (url.origin !== window.location.origin) return;
                internalHref = url.pathname + url.search + url.hash;
            } catch {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            requestLeaveConfirmation(() => {
                clearSelections();
                router.push(internalHref);
            });

            document.dispatchEvent(new CustomEvent(ORDER_PROTECTED_LINK_CLICK));
        };

        document.addEventListener("click", handleDocumentClick, true);
        return () => {
            document.removeEventListener("click", handleDocumentClick, true);
            restoreAnchors();
        };
    }, [clearSelections, hasPendingSelections, requestLeaveConfirmation, router]);

    useEffect(() => {
        return () => {
            document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
                anchor.classList.remove("opacity-50", "cursor-not-allowed");
                anchor.removeAttribute("aria-disabled");
                anchor.removeAttribute("data-protected-link");
                anchor.removeAttribute("tabindex");
            });
        };
    }, []);

    useEffect(() => {
        const handleBackRequest = (event: Event) => {
            if (!hasPendingSelections) return;
            event.preventDefault();
            requestLeaveConfirmation(() => {
                clearSelections();
                router.back();
            });
        };

        document.addEventListener(
            ORDER_BEFORE_BACK_REQUEST,
            handleBackRequest as EventListener,
        );

        return () =>
            document.removeEventListener(
                ORDER_BEFORE_BACK_REQUEST,
                handleBackRequest as EventListener,
            );
    }, [clearSelections, hasPendingSelections, requestLeaveConfirmation, router]);

    return {
        showCloseConfirm,
        handleCancelLeave,
        handleConfirmLeave,
        handleBeforeBack,
        requestLeaveConfirmation,
    };
}
