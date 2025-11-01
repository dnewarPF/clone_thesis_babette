import React, {useMemo, useState, useEffect, useCallback, useRef} from "react";
import YouTube from "react-youtube";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faVolumeHigh, faVolumeXmark} from "@fortawesome/free-solid-svg-icons";
import urls from "../../utils/urls";
import {Loader} from "../../utils/style/Atoms";
import {playerOptions, useTransitionControl} from "../../utils/hooks";
import PlayerMenu from "../PlayerMenu";
import {
    Card,
    LoaderContainer,
    LoaderParentContainer,
    LoaderWrapper,
    MediaSurface,
    SelectionOverlay,
    SoundContainer,
    StyledImage,
    VideoActions,
    VideoContainer
} from "./style";

const transitionStyles ={
    no_data:{transform: 'scale(1)',transition : 'transform 1s'},
    entering:{transform: 'scaleX(1.05)',transition : 'transform 500ms'},
    entered:{transform: 'scaleX(1.15) scaleY(1.15)',transition : 'transform 3s'},
    exiting:{transform: 'scale(1.15)',transition : 'transform 1s'},
    exited:{transform: 'scale(1)',transition : 'transform 1s'},
    finish:{transform: 'scale(1)',transition : 'transform 1s'},
}
const defaultStyle ={
    transition : 'transform 1s',
    transform : 'scale(1)',
}

function VideoPlayer({
    isLargeRow,
    movie,
    index,
    isActive,
    onShow,
    onLeave,
    showPreview,
    showRatings,
    showKeywords,
    adjective,
    onConfirm,
    isSelected
}) {
    let [stateVideo, enterVideo, exitedVideo] = useTransitionControl(500);
    const videoStyle = {
        ...defaultStyle,
        ...transitionStyles[stateVideo] ?? {},
    };
    const [trailerURL, setTrailerURL] = useState(null);
    const [vidError, setVidError] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isVideoEnding, setIsVideoEnding] = useState(false);
    const playerRef = useRef(null);
    const [sound, setSound] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const hoveringRef = useRef(false);
    const cardRef = useRef(null);
    const [hoverShift, setHoverShift] = useState(0);

    const imagePath = useMemo(() => {
        if (!movie) {
            return "";
        }
        const fallback = movie.backdrop_path || movie.poster_path;
        if (!fallback) {
            return "";
        }
        return `${urls.findImagesUrl}${isLargeRow ? movie.poster_path || fallback : fallback}`;
    }, [isLargeRow, movie]);
    const preloadedTrailerId =
        movie?.experimentMeta?.trailerId ?? movie?.youtubeTrailerId ?? null;

    playerOptions.height = "320";
    playerOptions.playerVars.mute = !sound ? 1 : 0;

    const stopPlayer = useCallback(() => {
        const player = playerRef.current;
        if (!player) {
            return;
        }
        try {
            if (typeof player.stopVideo === "function") {
                player.stopVideo();
            }
        } catch (error) {
            console.debug("VideoPlayer: stopVideo failed", error);
        }
        try {
            if (typeof player.mute === "function") {
                player.mute();
            }
        } catch (error) {
            console.debug("VideoPlayer: mute failed", error);
        }
        playerRef.current = null;
    }, []);


    const adjustHoverShift = useCallback(() => {
        if (!hoveringRef.current) {
            setHoverShift(0);
            return;
        }
        if (typeof window === "undefined" || typeof document === "undefined") {
            return;
        }
        const node = cardRef.current;
        if (!node) {
            return;
        }
        const rect = node.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
        if (viewportWidth === 0) {
            setHoverShift(0);
            return;
        }
        const margin = 16;
        const isMobile = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
        const scale = isMobile
            ? (showPreview ? 1.45 : 1.3)
            : (showPreview ? 1.6 : 1.45);
        const scaledWidth = rect.width * scale;
        const extraWidth = scaledWidth - rect.width;
        if (extraWidth <= 0) {
            setHoverShift(0);
            return;
        }
        const halfExtra = extraWidth / 2;
        const scaledLeft = rect.left - halfExtra;
        const scaledRight = rect.right + halfExtra;
        let shift = 0;
        if (scaledLeft < margin) {
            shift = margin - scaledLeft;
        } else if (scaledRight > viewportWidth - margin) {
            shift = (viewportWidth - margin) - scaledRight;
        }
        if (Math.abs(shift) < 0.5) {
            shift = 0;
        }
        setHoverShift(shift);
    }, [showPreview]);

    const resetStateVideo = useCallback(() => {
        hoveringRef.current = false;
        setTrailerURL(null);
        setVidError(false);
        setIsVideoLoading(false);
        exitedVideo();
        setIsVideoPlaying(false);
        setSound(false);
        stopPlayer();
        setHoverShift(0);
        setIsVideoEnding(false);
        setIsHovering(false);
        onLeave?.();
    }, [exitedVideo, onLeave, stopPlayer]);

    const handleVideo = () => {
        stopPlayer();
        setIsVideoPlaying(false);
        setIsVideoLoading(false);
        setIsVideoEnding(false);
        hoveringRef.current = true;
        setIsHovering(true);
        if (typeof window !== "undefined") {
            window.requestAnimationFrame(() => {
                adjustHoverShift();
            });
        }
        if (showPreview) {
            setSound(true);
        }
        onShow?.(movie?.id);
        if (!showPreview || !movie) {
            return;
        }
        if (vidError) {
            return;
        }
        if (!preloadedTrailerId) {
            setVidError(true);
            setIsVideoLoading(false);
            setIsVideoPlaying(false);
            return;
        }
        if (isVideoPlaying) {
            return;
        }
        if (trailerURL === preloadedTrailerId) {
            enterVideo();
            setIsVideoLoading(false);
            return;
        }
        enterVideo();
        setVidError(false);
        setIsVideoEnding(false);
        setTrailerURL(preloadedTrailerId);
        setIsVideoLoading(true);
    };

    useEffect(() => {
        if (!isHovering) {
            setHoverShift(0);
            return;
        }
        if (typeof window === "undefined") {
            return;
        }
        adjustHoverShift();
        const handleResize = () => adjustHoverShift();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [isHovering, adjustHoverShift]);

    useEffect(() => {
        if (isHovering) {
            adjustHoverShift();
        }
    }, [trailerURL, adjustHoverShift, isHovering]);

    useEffect(() => {
        return () => {
            stopPlayer();
        };
    }, [stopPlayer]);

    const enableSound = () => {
        const player = playerRef.current;
        if (!player) {
            return;
        }
        if (typeof player.isMuted === "function" && player.isMuted()) {
            player.unMute();
            if (typeof player.setVolume === "function") {
                player.setVolume(50);
            }
            setSound(true);
        } else {
            if (typeof player.mute === "function") {
                player.mute();
            }
            setSound(false);
        }
    };

    const shouldRenderVideo =
        showPreview &&
        !isSelected &&
        !vidError &&
        Boolean(trailerURL) &&
        (isActive || stateVideo === "entering" || stateVideo === "entered");

    return (
        <Card
            ref={cardRef}
            isLargeRow={isLargeRow}
            isSelected={isSelected}
            $hovered={isHovering}
            $hoverShift={hoverShift}
            $previewEnabled={showPreview}
            key={`${movie?.id ?? index}-card`}
            onMouseEnter={handleVideo}
            onMouseLeave={resetStateVideo}
            onPointerLeave={resetStateVideo}
            onPointerCancel={resetStateVideo}
            onTouchStart={handleVideo}
            onTouchEnd={resetStateVideo}
            onTouchCancel={resetStateVideo}
            onFocus={() => setIsHovering(true)}
        >
            <MediaSurface
                $hovered={isHovering}
                $previewEnabled={showPreview}
            >
                {shouldRenderVideo ? (
                    <LoaderParentContainer style={{...videoStyle}}>
                        <LoaderContainer isVideoLoading={isVideoLoading} isLargeRow={isLargeRow} stateVideo={stateVideo}>
                            <StyledImage
                                src={imagePath}
                                alt={movie?.name || movie?.title || "poster"}
                                isLargeRow={isLargeRow}
                                isSelected={isSelected}
                            />
                            <LoaderWrapper data-testid="loader">
                                <Loader
                                    id="myloader"
                                    isVideoEnding={isVideoEnding}
                                    style={{
                                        margin: "-36% 0% 0% 0%",
                                        position: "absolute"
                                    }}
                                />
                            </LoaderWrapper>
                        </LoaderContainer>
                        <VideoContainer isLargeRow={isLargeRow} isVideoLoading={isVideoLoading} stateVideo={stateVideo}>
                            {isVideoPlaying ? (
                                <VideoActions>
                                    <SoundContainer onClick={enableSound}>
                                        <FontAwesomeIcon icon={sound ? faVolumeHigh : faVolumeXmark}/>
                                    </SoundContainer>
                                </VideoActions>
                            ) : null}
                            <YouTube
                                onPlay={(e) => {
                                    playerRef.current = e.target;
                                    if (sound) {
                                        e.target.unMute();
                                        if (typeof e.target.setVolume === "function") {
                                            e.target.setVolume(50);
                                        }
                                    } else {
                                        e.target.mute();
                                    }
                                    if (!isHovering || !hoveringRef.current) {
                                        stopPlayer();
                                        return;
                                    }
                                    setIsVideoLoading(false);
                                    setIsVideoPlaying(true);
                                }}
                                onError={() => {
                                    setVidError(true);
                                    setIsVideoPlaying(false);
                                    setIsVideoLoading(false);
                                    setSound(false);
                                    stopPlayer();
                                }}
                                onReady={(e) => {
                                    playerRef.current = e.target;
                                    if (sound) {
                                        e.target.unMute();
                                        if (typeof e.target.setVolume === "function") {
                                            e.target.setVolume(50);
                                        }
                                    } else {
                                        e.target.mute();
                                    }
                                    if (!isHovering || !hoveringRef.current) {
                                        stopPlayer();
                                        return;
                                    }
                                    e.target.playVideo();
                                    setIsVideoPlaying(false);
                                    setIsVideoLoading(true);
                                }}
                                id={`vidPlayer-${movie?.id}`}
                                videoId={trailerURL || undefined}
                                onEnd={() => {
                                    setIsVideoLoading(true);
                                    setIsVideoPlaying(false);
                                    setIsVideoEnding(true);
                                    setSound(false);
                                    stopPlayer();
                                }}
                                opts={playerOptions}
                            />
                        </VideoContainer>
                    </LoaderParentContainer>
                ) : (
                    <StyledImage
                        src={imagePath}
                        alt={movie?.name || movie?.title || "poster"}
                        isLargeRow={isLargeRow}
                        isSelected={isSelected}
                    />
                )}
                <SelectionOverlay visible={isSelected}>
                    Selected movie
                </SelectionOverlay>
            </MediaSurface>
            <PlayerMenu
                id={movie?.id}
                name={movie?.name}
                title={movie?.title}
                vote_average={movie?.vote_average}
                isLargeRow={isLargeRow}
                showRatings={showRatings}
                showKeywords={showKeywords}
                keywords={movie?.experimentMeta?.keywords ?? []}
                adjective={adjective}
                onConfirm={() => onConfirm?.(movie)}
                isSelected={isSelected}
                showDetails={isHovering}
            />
        </Card>
    );
}
export default VideoPlayer;
