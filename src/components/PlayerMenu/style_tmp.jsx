import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const PlayerContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.6em;
    background: rgba(15, 15, 15, 0.85);
    padding: 0.65em 0.85em 0.7em;
    border-radius: 0 0 18px 18px;
    backdrop-filter: blur(6px);
    font-size: calc(1rem / var(--tile-scale, 1));
`;

const InfoColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.45em;
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
`;

const ActionsColumn = styled.div`
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.6em;
    width: 100%;
`;

const TitleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75em;
`;

const Title = styled.h3`
    margin: 0;
    font-size: ${({isLargeRow}) => (isLargeRow ? "1.08em" : "1em")};
    font-weight: 600;
`;

const KeywordsLine = styled.div`
    margin: 0;
    font-size: 0.9em;
    color: #d9d9d9;
`;

const KeywordTag = styled.span`
    font-weight: 700;
    color: #ffffff;
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75em;
    flex-wrap: wrap;
    font-size: 0.9em;
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
    margin-top: 0.35em;
    font-size: 0.9em;
    color: #d9ffd7;
`;

const ConfirmButton = styled.button`
    align-self: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #050505;
    font-weight: 700;
    font-size: 0.95em;
    border-radius: 999px;
    padding: 0.5em 1.45em;
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
    align-self: flex-end;
    font-size: 0.8em;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #ffd6d6;
    background: rgba(229, 9, 20, 0.2);
    border: 1px solid rgba(229, 9, 20, 0.5);
    border-radius: 999px;
    padding: 0.3em 0.95em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: right;
    margin-bottom: 0;
`;

function PlayerMenu({
    id,
    name,
    title,
    vote_average: voteAverage,
    isLargeRow,
    showRatings,
    showKeywords,
    keywords,
    adjective,
    onConfirm,
    isSelected,
    showDetails
}) {
    const rating10 = Number(voteAverage ?? 0).toFixed(1);
    const detailsVisible = Boolean(showDetails);
    const keywordList = Array.isArray(keywords) ? keywords.filter(Boolean) : [];
    const displayKeywords = keywordList.slice(0, 4);

    return (
        <PlayerContainer isLargeRow={isLargeRow} data-movie-id={id}>
            <InfoColumn>
                <TitleRow>
                    <Title isLargeRow={isLargeRow}>{title || name}</Title>
                </TitleRow>
                {detailsVisible && showKeywords && displayKeywords.length > 0 ? (
                    <KeywordsLine>
                        Keywords:{" "}
                        {displayKeywords.map((keyword, index) => (
                            <React.Fragment key={keyword}>
                                <KeywordTag>{keyword}</KeywordTag>
                                {index < displayKeywords.length - 1 ? ", " : ""}
                            </React.Fragment>
                        ))}
                    </KeywordsLine>
                ) : null}
                {detailsVisible && showRatings ? (
                    <RatingLine>
                        Rating: <Rating>{rating10}</Rating>
                    </RatingLine>
                ) : null}
                <MetaRow $visible={detailsVisible}>
                    {/* other meta could live here if needed */}
                </MetaRow>
            </InfoColumn>
            <ActionsColumn>
                {isSelected ? (
                    <SelectedNotice>Selection made - use the button below to continue</SelectedNotice>
                ) : (
                    <ConfirmButton type="button" onClick={() => onConfirm?.()} $visible={detailsVisible}>
                        Watch now
                    </ConfirmButton>
                )}
            </ActionsColumn>
        </PlayerContainer>
    );
}

PlayerMenu.propTypes = {
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    title: PropTypes.string,
    vote_average: PropTypes.number,
    isLargeRow: PropTypes.bool,
    showRatings: PropTypes.bool,
    showKeywords: PropTypes.bool,
    keywords: PropTypes.arrayOf(PropTypes.string),
    adjective: PropTypes.string,
    onConfirm: PropTypes.func,
    isSelected: PropTypes.bool,
    showDetails: PropTypes.bool
};

PlayerMenu.defaultProps = {
    vote_average: 0,
    isLargeRow: false,
    showRatings: false,
    showKeywords: false,
    keywords: [],
    adjective: undefined,
    onConfirm: undefined,
    isSelected: false,
    showDetails: false
};

export default PlayerMenu;
