import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useState, type MouseEventHandler, type RefObject } from "react";
import clsx from "clsx";

if (typeof window !== "undefined") {
    gsap.registerPlugin(useGSAP);
}

const MAX_PERCENTAGE = 100;
const DEFAULT_ANIMATION_DURATION = 0.1;
const DEFAULT_ANIMATE_BUFFER_THRESHOLD_PERCENTAGE = 0;
const DEFAULT_ANIMATE_BUFFER_THRESHOLD_COUNT_FACTOR = 2;

const DEFAULT_CONFIG: UseVerticalSpotlightConfig = {
    animateBufferPercantageStrategy: {
        type: "percentage",
        percentage: DEFAULT_ANIMATE_BUFFER_THRESHOLD_PERCENTAGE,
    },
    animationDuration: DEFAULT_ANIMATION_DURATION,
};

export type AnimateBufferThresholdStrategy =
    | { type: "percentage"; percentage: number }
    | { type: "count"; count: number; factor?: number };

export type UseVerticalSpotlightConfig = {
    animateBufferPercantageStrategy: AnimateBufferThresholdStrategy;
    animationDuration: number;
};

export type UseVerticalSpotlightReturn<T extends Element> = {
    onMove: MouseEventHandler<T>;
    onLeave: MouseEventHandler<T>;
    className: string;
};

function mergeConfigWithDefaults(
    config?: Partial<UseVerticalSpotlightConfig>,
): UseVerticalSpotlightConfig {
    if (config === undefined) {
        return DEFAULT_CONFIG;
    }

    return {
        ...DEFAULT_CONFIG,
        ...config,
    };
}

function animationBufferPercentageThreshold(
    config: UseVerticalSpotlightConfig,
): number {
    if (config.animateBufferPercantageStrategy.type === "percentage") {
        return config.animateBufferPercantageStrategy.percentage;
    } else {
        return (
            config.animateBufferPercantageStrategy.count *
            (config.animateBufferPercantageStrategy.factor ||
                DEFAULT_ANIMATE_BUFFER_THRESHOLD_COUNT_FACTOR)
        );
    }
}

export function useVerticalSpotlight<T extends Element>(
    ref: RefObject<T | null>,
    config?: Partial<UseVerticalSpotlightConfig>,
): UseVerticalSpotlightReturn<T> {
    const completeConfig = mergeConfigWithDefaults(config);
    const [moved, setMoved] = useState(false);

    const threshold =
        MAX_PERCENTAGE /
        gsap.utils.clamp(
            1,
            Number.POSITIVE_INFINITY,
            animationBufferPercentageThreshold(completeConfig),
        );

    const { contextSafe } = useGSAP({ scope: ref });

    const onMove: MouseEventHandler<T> = contextSafe((e) => {
        setMoved(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const bottomFromPosition = gsap.utils.mapRange(
            rect.top,
            rect.bottom,
            -threshold,
            MAX_PERCENTAGE + threshold,
            e.clientY,
        );

        const topFromPosition = MAX_PERCENTAGE - bottomFromPosition;

        gsap.to(ref.current, {
            duration: completeConfig.animationDuration,
            ease: "power1.out",
            "--tw-mask-bottom-from-position": `${bottomFromPosition}%`,
            "--tw-mask-top-from-position": `${topFromPosition}%`,
        });
    });

    const onLeave: MouseEventHandler<T> = contextSafe(() => {
        setMoved(true);
        gsap.to(ref.current, {
            ease: "power1.out",
            "--tw-mask-bottom-from-position": "0%",
            "--tw-mask-top-from-position": `${MAX_PERCENTAGE}%`,
        });
    });

    return {
        onMove,
        onLeave,
        className: clsx("md:mask-intersect md:not-hover:mask-b-from-0", {
            "md:mask-b-from-0": !moved,
            "md:hover:mask-y-from-0": moved,
        }),
    };
}
