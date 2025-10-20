import PropTypes from "prop-types";
import styled from "styled-components";
import {getGenres} from "../../utils/hooks";
import React from "react";

const PlayerContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    background: rgba(15, 15, 15, 0.85);
    padding: 0.55rem 0.8rem 0.6rem;
    border-radius: 0 0 18px 18px;
    backdrop-filter: blur(6px);
`;

const TitleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
`;

const Title = styled.h3`
    margin: 0;
    font-size: ${({isLargeRow}) => (isLargeRow ? "0.98rem" : "0.9rem")};
    font-weight: 600;
`;

const KeywordsLine = styled.div`
    margin: 0;
    font-size: 0.8rem;
    color: #d9d9d9;
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.7rem;
    flex-wrap: wrap;
    font-size: 0.82rem;
    opacity: ${({$visible}) => ($visible ? 1 : 0)};
    transform: ${({$visible}) => ($visible ? "translateY(0)" : "translateY(-6px)")};
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
`;

const Rating = styled.span`
    color: #8ef28c;
    font-weight: 600;
`;

// removed per-card Genres display per requirements

const RatingLine = styled.div`
    margin-top: 0.35rem;
    font-size: 0.82rem;
    color: #d9ffd7;
`;

const ConfirmButton = styled.button`
    align-self: stretch;
    cursor: pointer;
    color: #050505;
    font-weight: 700;
    border-radius: 999px;
    padding: 0.4rem 1.2rem;
    border: none;
    background: #e50914;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    transition: transform 0.2s ease, background 0.2s ease, opacity 0.2s ease;
    margin-bottom: 0;
    opacity: ${({$visible}) => ($visible ? 1 : 0)};
    pointer-events: ${({$visible}) => ($visible ? "auto" : "none")};
    transform: ${({$visible}) => ($visible ? "translateY(0)" : "translateY(10px)")};

    &:hover {
        background: #f6121d;
        transform: translateY(-2px);
    }

    &:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 2px;
    }

    &:disabled {
        background: #363636;
        color: #9f9f9f;
        cursor: default;
        transform: none;
    }
`;

const SelectedNotice = styled.span`
    font-size: 0.8rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #ffd6d6;
    background: rgba(229, 9, 20, 0.2);
    border: 1px solid rgba(229, 9, 20, 0.5);
    border-radius: 999px;
    padding: 0.3rem 0.75rem;
    display: block;
    width: 100%;
    text-align: center;
    margin-bottom: 0;
`;

function PlayerMenu({
    id,
    name,
    title,
    genre_ids: genreIds,
    vote_average: voteAverage,
    isLargeRow,
    showRatings,
    showKeywords,
    adjective,
    onConfirm,
    isSelected,
    showDetails
}) {
    const genres = genreIds ? getGenres(genreIds)?.filter(Boolean) : [];
    const rating10 = Number(voteAverage ?? 0).toFixed(1);
    const detailsVisible = Boolean(showDetails);
    const [keywords, setKeywords] = React.useState([]);
    const [kwLoading, setKwLoading] = React.useState(false);
    const [kwError, setKwError] = React.useState(null);

    React.useEffect(() => {
        let cancelled = false;
        async function fetchKeywords() {
            const API_URL = process.env.REACT_APP_API_URL;
            const API_KEY = process.env.REACT_APP_API_KEY;
            if (!detailsVisible || !showKeywords || !id || !API_URL || !API_KEY) return;
            try {
                setKwLoading(true);
                setKwError(null);
                // Try movie keywords first
                let list = [];
                try {
                    const resMovie = await fetch(`${API_URL}/movie/${id}/keywords?api_key=${API_KEY}`);
                    if (resMovie.ok) {
                        const json = await resMovie.json();
                        list = Array.isArray(json?.keywords) ? json.keywords : [];
                    }
                } catch (_) {}

                // If none, try TV keywords endpoint
                if (!list.length) {
                    try {
                        const resTv = await fetch(`${API_URL}/tv/${id}/keywords?api_key=${API_KEY}`);
                        if (resTv.ok) {
                            const jsonTv = await resTv.json();
                            list = Array.isArray(jsonTv?.results) ? jsonTv.results : [];
                        }
                    } catch (_) {}
                }

                if (!cancelled) {
                    const names = list.map((k) => k?.name).filter(Boolean);
                    const selected = names.slice(0, 3);
                    setKeywords(selected);
                }
            } catch (e) {
                if (!cancelled) setKwError(String(e?.message || e));
            } finally {
                if (!cancelled) setKwLoading(false);
            }
        }
        fetchKeywords();
        return () => {
            cancelled = true;
        };
    }, [detailsVisible, id]);

    return (
        <PlayerContainer isLargeRow={isLargeRow} data-movie-id={id}>
            <TitleRow>
                <Title isLargeRow={isLargeRow}>{title || name}</Title>
            </TitleRow>
            {detailsVisible && showRatings ? (
                <RatingLine>
                    Rating: <Rating>{rating10}</Rating>
                </RatingLine>
            ) : null}
            {detailsVisible && showKeywords && keywords.length > 0 ? (
                <KeywordsLine>
                    Keywords: {keywords.join(", ")}
                </KeywordsLine>
            ) : null}
            <MetaRow $visible={detailsVisible}>
                {/* other meta could live here if needed */}
            </MetaRow>
            {isSelected ? (
                <SelectedNotice>Selection made - use the button below to continue</SelectedNotice>
            ) : (
                <ConfirmButton type="button" onClick={() => onConfirm?.()} $visible={detailsVisible}>
                    Watch now
                </ConfirmButton>
            )}
        </PlayerContainer>
    );
}

PlayerMenu.propTypes = {
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    title: PropTypes.string,
    genre_ids: PropTypes.arrayOf(PropTypes.number),
    vote_average: PropTypes.number,
    isLargeRow: PropTypes.bool,
    showRatings: PropTypes.bool,
    adjective: PropTypes.string,
    onConfirm: PropTypes.func,
    isSelected: PropTypes.bool,
    showDetails: PropTypes.bool
};

PlayerMenu.defaultProps = {
    isLargeRow: false,
    showRatings: false,
    adjective: undefined,
    onConfirm: undefined,
    isSelected: false,
    showDetails: false
};

export default PlayerMenu;
