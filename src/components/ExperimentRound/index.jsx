import PropTypes from "prop-types";
import React from "react";
import styled from "styled-components";
import VideoPlayer from "../VideoPlayer";

const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 2rem 0;
`;

const CategoryTabs = styled.nav`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
`;

const CategoryButton = styled.button`
    padding: 0.55rem 1.25rem;
    border-radius: 999px;
    border: 1px solid ${({$active}) => ($active ? "#e50914" : "rgba(255, 255, 255, 0.25)")};
    background: ${({$active}) => ($active ? "#e50914" : "transparent")};
    color: ${({$active}) => ($active ? "#0b0b0b" : "#f0f0f0")};
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        border-color: #e50914;
    }

    &:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 3px;
    }
`;

const CategoryHeader = styled.header`
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
`;

const CategoryTitle = styled.h2`
    margin: 0;
    font-size: 1.35rem;
    font-weight: 600;
`;

const CategorySubtitle = styled.span`
    font-size: 0.85rem;
    color: #c0c0c0;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.4rem;
`;

function ExperimentRound({
    round,
    activeMovieId,
    onSetActive,
    onConfirmSelection,
    selectedMovieId
}) {
    const config = round?.config ?? {};
    const categories = Array.isArray(round?.categories) ? round.categories : [];

    const [activeCategoryId, setActiveCategoryId] = React.useState(() => categories[0]?.id ?? null);

    const firstCategoryId = categories[0]?.id ?? null;

    React.useEffect(() => {
        if (!round) {
            return;
        }
        setActiveCategoryId(firstCategoryId);
        onSetActive(null);
    }, [round?.id, firstCategoryId, onSetActive]);

    const handleCategoryChange = (categoryId) => {
        setActiveCategoryId(categoryId);
        onSetActive(null);
    };

    const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? categories[0] ?? null;

    if (!round || !activeCategory) {
        return null;
    }

    return (
        <>
            <CategoryTabs>
                {categories.map((category) => {
                    const isActive = category.id === activeCategory.id;
                    return (
                        <CategoryButton
                            key={category.id}
                            type="button"
                            $active={isActive}
                            aria-pressed={isActive}
                            onClick={() => handleCategoryChange(category.id)}
                        >
                            {category.label}
                        </CategoryButton>
                    );
                })}
            </CategoryTabs>

            <Section key={activeCategory.id}>
                <CategoryHeader>
                    <CategoryTitle>{activeCategory.label}</CategoryTitle>
                    <CategorySubtitle>
                        {activeCategory.movies.length} movies in this category
                    </CategorySubtitle>
                </CategoryHeader>
                <Grid>
                    {activeCategory.movies.map((movie, index) => (
                        <VideoPlayer
                            key={movie.id}
                            movie={movie}
                            index={index}
                            isLargeRow={false}
                            isActive={activeMovieId === movie.id}
                            onShow={(id) => onSetActive(id)}
                            onLeave={() => onSetActive(null)}
                            showPreview={config.usePreview}
                            showRatings={config.showRatings}
                            adjective={config.useAdjectives ? movie?.experimentMeta?.adjective : undefined}
                            onConfirm={onConfirmSelection}
                            isSelected={selectedMovieId === movie.id}
                        />
                    ))}
                </Grid>
            </Section>
        </>
    );
}

ExperimentRound.propTypes = {
    round: PropTypes.shape({
        config: PropTypes.shape({
            usePreview: PropTypes.bool,
            showRatings: PropTypes.bool,
            useAdjectives: PropTypes.bool
        }),
        categories: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired,
                movies: PropTypes.arrayOf(PropTypes.object).isRequired
            })
        )
    }),
    activeMovieId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onSetActive: PropTypes.func.isRequired,
    onConfirmSelection: PropTypes.func.isRequired,
    selectedMovieId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

ExperimentRound.defaultProps = {
    round: null,
    activeMovieId: null,
    selectedMovieId: null
};

export default ExperimentRound;
