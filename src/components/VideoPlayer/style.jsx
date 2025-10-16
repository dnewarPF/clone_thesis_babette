import styled from "styled-components";

export const Card = styled.div`
    display: flex;
    flex-direction: column;
    background: #141414;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    border: ${({isSelected}) => (isSelected ? "2px solid rgba(229, 9, 20, 0.6)" : "2px solid transparent")};

    &:hover {
        transform: ${({isSelected}) => (isSelected ? "translateY(-2px)" : "translateY(-6px)")};
        box-shadow: ${({isSelected}) =>
            isSelected ? "0 12px 28px rgba(0, 0, 0, 0.45)" : "0 18px 40px rgba(0, 0, 0, 0.5)"};
    }

    @media only screen and (max-width: 768px) {
        min-height: auto;
    }
`;

export const MediaSurface = styled.div`
    position: relative;
    width: 100%;
    aspect-ratio: 18 / 9;
    background: #000;
    overflow: hidden;
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
    background: linear-gradient(180deg, rgba(20, 20, 20, 0.8) 0%, rgba(10, 10, 10, 0.92) 100%);
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
    }
`;

export const VideoActions = styled.div`
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 12px;
    z-index: 4;
`;

export const SoundContainer = styled.button`
    width: 44px;
    height: 44px;
    border-radius: 999px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    cursor: pointer;
    color: #ffffff;
    transition: background 0.2s ease, transform 0.2s ease;

    &:hover {
        background: rgba(0, 0, 0, 0.85);
        transform: scale(1.05);
    }

    &:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 2px;
    }
`;
