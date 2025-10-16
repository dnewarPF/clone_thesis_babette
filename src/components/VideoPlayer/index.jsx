import React, {useMemo, useState} from "react";
import YouTube from "react-youtube";
import movieTrailer from "movie-trailer";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExpand, faVolumeHigh, faVolumeXmark} from "@fortawesome/free-solid-svg-icons";
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
    adjective,
    onConfirm,
    isSelected
}) {
    let [stateVideo, enterVideo, exitedVideo] = useTransitionControl(500);
    const videoStyle = {
        ...defaultStyle,
        ...transitionStyles[stateVideo] ?? {},
    };
    const [trailerURL, setTrailerURL] = useState("");
    const [vidError, setVidError] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isVideoEnding, setIsVideoEnding] = useState(false);
    const [playerObj, setPlayerObj] = useState({});
    const [sound, setSound] = useState(false);
    const [requestedId, setRequestedId] = useState(null);
    const [isHovering, setIsHovering] = useState(false);

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

    playerOptions.height = "320";
    playerOptions.playerVars.mute = !sound ? 1 : 0;

    const resetStateVideo = () => {
        setTrailerURL("");
        setVidError(false);
        setIsVideoLoading(false);
        exitedVideo();
        setIsVideoPlaying(false);
        setSound(false);
        setIsVideoEnding(false);
        setRequestedId(null);
        setIsHovering(false);
        onLeave?.();
    };

    const handleVideo = () => {
        setIsHovering(true);
        onShow?.(movie?.id);
        if (!showPreview || !movie) {
            return;
        }
        if (isVideoPlaying || vidError) {
            return;
        }
        if (requestedId === movie.id && trailerURL) {
            enterVideo();
            setIsVideoLoading(false);
            return;
        }
        enterVideo();
        setTrailerURL("");
        setVidError(false);
        setIsVideoLoading(true);
        setIsVideoEnding(false);
        setRequestedId(movie.id);
        movieTrailer(movie?.name || movie?.title || movie?.original_title || "")
            .then((url) => {
                const urlParams = new URLSearchParams(new URL(url).search);
                setTrailerURL(urlParams.get("v"));
                setVidError(false);
            })
            .catch(() => {
                setTrailerURL("");
                setVidError(true);
            });
    };

    const enableSound = () => {
        if (!playerObj) {
            return;
        }
        if (playerObj.isMuted()) {
            playerObj.unMute();
            playerObj.setVolume(50);
            setSound(true);
        } else {
            playerObj.mute();
            setSound(false);
        }
    };

    const enableFullScreen = () => {
        const playerElement = document.getElementById(`vidPlayer-${movie?.id}`);
        if (!playerElement) {
            return;
        }
        const requestFullScreen = playerElement.requestFullscreen
            || playerElement.mozRequestFullScreen
            || playerElement.webkitRequestFullScreen
            || playerElement.msRequestFullscreen;
        if (requestFullScreen) {
            requestFullScreen.call(playerElement);
        }
    };

    const shouldRenderVideo = showPreview && !isSelected && (isActive || stateVideo === "exiting" || stateVideo === "exited") && !vidError;

    return (
        <Card
            isLargeRow={isLargeRow}
            isSelected={isSelected}
            $hovered={isHovering}
            key={`${movie?.id ?? index}-card`}
            onMouseEnter={handleVideo}
            onMouseLeave={resetStateVideo}
            onTouchStart={handleVideo}
            onTouchEnd={resetStateVideo}
            onTouchCancel={resetStateVideo}
            onFocus={() => setIsHovering(true)}
            onBlur={resetStateVideo}
        >
            <MediaSurface>
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
                                    <SoundContainer onClick={enableFullScreen}>
                                        <FontAwesomeIcon icon={faExpand}/>
                                    </SoundContainer>
                                </VideoActions>
                            ) : null}
                            <YouTube
                                onPlay={(e) => {
                                    setPlayerObj(e.target);
                                    setIsVideoLoading(false);
                                    setIsVideoPlaying(true);
                                }}
                                onError={() => {
                                    setVidError(true);
                                    setIsVideoPlaying(false);
                                }}
                                onReady={(e) => {
                                    e.target.playVideo();
                                    setIsVideoPlaying(false);
                                    setIsVideoLoading(true);
                                }}
                                id={`vidPlayer-${movie?.id}`}
                                videoId={trailerURL}
                                onEnd={() => {
                                    setIsVideoLoading(true);
                                    setIsVideoPlaying(false);
                                    setIsVideoEnding(true);
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
                    Selection made - use the button below to continue
                </SelectionOverlay>
            </MediaSurface>
            <PlayerMenu
                id={movie?.id}
                name={movie?.name}
                title={movie?.title}
                genre_ids={movie?.genre_ids ?? []}
                vote_average={movie?.vote_average}
                isLargeRow={isLargeRow}
                showRatings={showRatings}
                adjective={adjective}
                onConfirm={() => onConfirm?.(movie)}
                isSelected={isSelected}
                showDetails={isHovering}
            />
        </Card>
    );
}
export default VideoPlayer;
