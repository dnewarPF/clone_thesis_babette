import styled from "styled-components";

export const Card = styled.div`
    display: flex;
    flex-direction: column;
    background: #141414;
    border-radius: 18px;
    overflow: visible;
    --tile-scale: ${({$hovered, $previewEnabled}) => {
        if (!$hovered) {
            return 1;
        }
        return $previewEnabled ? 1.6 : 1.45;
    }};
    box-shadow: ${({$hovered, $previewEnabled}) =>
        $hovered
            ? $previewEnabled
                ? "0 36px 64px rgba(0, 0, 0, 0.65)"
                : "0 24px 48px rgba(0, 0, 0, 0.6)"
            : "0 14px 32px rgba(0, 0, 0, 0.32)"};
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
    border: ${({isSelected}) => (isSelected ? "2px solid rgba(229, 9, 20, 0.6)" : "2px solid transparent")};
    transform: ${({$hovered, $hoverShift}) =>
        `translateX(${ $hovered ? $hoverShift : 0 }px) translateY(calc((1 - var(--tile-scale)) * 50%)) scale(var(--tile-scale))`};
    transform-origin: center;
    position: relative;
    z-index: ${({$hovered}) => ($hovered ? 20 : 1)};
    will-change: transform, box-shadow;

    @media only screen and (max-width: 768px) {
        min-height: auto;
        --tile-scale: ${({$hovered, $previewEnabled}) => {
            if (!$hovered) {
                return 1;
            }
            return $previewEnabled ? 1.45 : 1.3;
        }};
    }
`;

export const MediaSurface = styled.div`
    position: relative;
    flex: 0 0 auto;
    width: 100%;
    aspect-ratio: 18 / 9;
    background: #000;
    overflow: hidden;
    border-radius: 18px 18px 0 0;
`;

export const LoaderParentContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 18px 18px 0 0;
    overflow: hidden;
`;

export const LoaderContainer = styled.div`
    position: absolute;
    inset: 0;
    display: ${({stateVideo, isVideoLoading}) => (isVideoLoading || stateVideo !== "entered" ? "flex" : "none")};
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, rgba(15, 15, 15, 0.65) 0%, rgba(10, 10, 10, 0.95) 100%);
    z-index: 2;
`;

export const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const StyledImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: ${({isSelected}) => (isSelected ? "grayscale(1)" : "none")};
    opacity: ${({isSelected}) => (isSelected ? 0.55 : 1)};
    transition: filter 0.25s ease, opacity 0.25s ease;
`;

export const SelectionOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(229, 9, 20, 0.35) 0%, rgba(229, 9, 20, 0.55) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 1.5rem;
    color: #ffffff;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: ${({visible}) => (visible ? 1 : 0)};
    pointer-events: none;
    transition: opacity 0.25s ease;
`;

export const VideoContainer = styled.div`
    position: absolute;
    inset: 0;
    z-index: 3;
    display: ${({stateVideo, isVideoLoading}) => (stateVideo === "entered" && !isVideoLoading ? "block" : "none")};

    iframe {
        width: 100%;
        height: 100%;
        border: none;
        pointer-events: none;
    }
`;

export const VideoActions = styled.div`
    position: absolute;
    top: 10px;
    right: 18px;
    display: flex;
    gap: 6px;
    z-index: 4;
`;

export const SoundContainer = styled.button`
    width: 26px;
    height: 26px;
    border-radius: 999px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.65);
    cursor: pointer;
    color: #ffffff;
    font-size: 0.82rem;
    transition: background 0.2s ease, transform 0.2s ease;

    &:hover {
        background: rgba(0, 0, 0, 0.9);
        transform: scale(1.08);
    }

    &:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 2px;
    }
`;
