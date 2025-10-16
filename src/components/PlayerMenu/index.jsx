import PropTypes from "prop-types";
import styled from "styled-components";
import {getGenres} from "../../utils/hooks";
import React from "react";

const PlayerContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: rgba(15, 15, 15, 0.85);
    padding: ${({isLargeRow}) => (isLargeRow ? "0.85rem 1.1rem 0" : "0.65rem 0.9rem 0")};
    border-radius: 0 0 18px 18px;
    backdrop-filter: blur(6px);
    min-height: ${({isLargeRow}) => (isLargeRow ? "114px" : "102px")};
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

const AdjectiveBadge = styled.span`
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #ff6f61 0%, #ff9a44 100%);
    color: #0b0b0b;
    white-space: nowrap;
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.7rem;
    flex-wrap: wrap;
    font-size: 0.82rem;
`;

const Rating = styled.span`
    color: #8ef28c;
    font-weight: 600;
`;

const Genres = styled.span`
    color: #d0d0d0;
`;

const Description = styled.p`
    margin: 0;
    font-size: 0.78rem;
    line-height: 1.15rem;
    max-height: 2.1rem;
    overflow: hidden;
    text-overflow: ellipsis;
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
    transition: transform 0.2s ease, background 0.2s ease;
    margin-bottom: 0;

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

const truncate = (value, length) => {
    if (!value) {
        return "";
    }
    return value.length > length ? `${value.slice(0, length - 1)}...` : value;
};

function PlayerMenu({
    id,
    name,
    title,
    overview,
    genre_ids: genreIds,
    vote_average: voteAverage,
    isLargeRow,
    showRatings,
    adjective,
    onConfirm,
    isSelected
}) {
    const genres = genreIds ? getGenres(genreIds)?.filter(Boolean) : [];
    const rating = Math.round((voteAverage ?? 0) * 10);

    return (
        <PlayerContainer isLargeRow={isLargeRow} data-movie-id={id}>
            <TitleRow>
                <Title isLargeRow={isLargeRow}>{title || name}</Title>
                {adjective ? <AdjectiveBadge>{adjective}</AdjectiveBadge> : null}
            </TitleRow>
            <MetaRow>
                {showRatings ? <Rating>{rating}% score</Rating> : null}
                {genres?.length ? <Genres>{genres.slice(0, 2).join(" · ")}</Genres> : null}
            </MetaRow>
            <Description>{truncate(overview, isLargeRow ? 160 : 120)}</Description>
            {isSelected ? (
                <SelectedNotice>Selection made - use the button below to continue</SelectedNotice>
            ) : (
                <ConfirmButton type="button" onClick={() => onConfirm?.()}>
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
    overview: PropTypes.string,
    genre_ids: PropTypes.arrayOf(PropTypes.number),
    vote_average: PropTypes.number,
    isLargeRow: PropTypes.bool,
    showRatings: PropTypes.bool,
    adjective: PropTypes.string,
    onConfirm: PropTypes.func,
    isSelected: PropTypes.bool
};

PlayerMenu.defaultProps = {
    isLargeRow: false,
    showRatings: false,
    adjective: undefined,
    onConfirm: undefined,
    isSelected: false
};

export default PlayerMenu;
