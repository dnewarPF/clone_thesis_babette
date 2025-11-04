import React from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";
import {useExperimentPreload} from "../../utils/hooks/useExperimentPreload";

const Page = styled.main`
    min-height: 100vh;
    background: #050505;
    color: #ffffff;
    display: flex;
    justify-content: center;
    padding: clamp(2rem, 6vw, 5rem);
`;

const Wrapper = styled.section`
    width: 100%;
    max-width: 820px;
    display: grid;
    gap: clamp(0.5rem, 2vw, 0.8rem);
`;

const Title = styled.h1`
    margin: 0;
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 700;
`;

const Content = styled.div`
    display: grid;
    gap: clamp(0.6rem, 1.8vw, 0.85rem);
    font-size: 1.05rem;
    line-height: 1.7;
    color: #dddddd;
`;

const Highlight = styled.span`
    color: #e50914;
    font-weight: 650;
`;

const List = styled.ul`
    margin: 0;
    padding-left: 1.2rem;
    display: grid;
    gap: 0.6rem;
`;

const ButtonRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
`;

const ActionsGroup = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
    min-width: clamp(220px, 28vw, 320px);
`;

const RetryLink = styled.button`
    border: none;
    background: transparent;
    color: #f0f0f0;
    font-size: 0.85rem;
    text-decoration: underline;
    cursor: pointer;
    align-self: flex-end;
    opacity: ${({disabled}) => (disabled ? 0.4 : 0.8)};

    &:hover {
        opacity: 1;
    }

    &:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 2px;
    }

    &:disabled {
        cursor: not-allowed;
    }
`;

const Button = styled.button`
    padding: 0.8rem 2.4rem;
    border-radius: 999px;
    border: ${({variant}) => (variant === "secondary" ? "1px solid rgba(255, 255, 255, 0.25)" : "none")};
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
    background: ${({variant}) => (variant === "secondary" ? "transparent" : "#e50914")};
    color: ${({variant}) => (variant === "secondary" ? "#f0f0f0" : "#0b0b0b")};

    &:hover {
        transform: translateY(-2px);
        background: ${({variant}) => (variant === "secondary" ? "rgba(255, 255, 255, 0.12)" : "#f6121d")};
    }

    &:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 3px;
    }

    &:disabled {
        cursor: not-allowed;
        transform: none;
        opacity: 0.6;
        background: ${({variant}) => (variant === "secondary" ? "rgba(255, 255, 255, 0.08)" : "#7a1f24")};
        color: ${({variant}) => (variant === "secondary" ? "rgba(240, 240, 240, 0.55)" : "#1c1c1c")};
        border: ${({variant}) =>
            variant === "secondary" ? "1px solid rgba(255, 255, 255, 0.12)" : "none"};
    }

    &:disabled:hover {
        transform: none;
    }
`;

function Instructions() {
    const navigate = useNavigate();
    const {isReady, isLoading, error, retry} = useExperimentPreload();

    const canStart = isReady && !error;
    const startLabel = isReady ? "Start experiment" : "Preparing…";

    const handleStart = () => {
        if (!canStart) {
            return;
        }
        navigate("/experiment");
    };

    return (
        <Page>
            <Wrapper>
                <Title>Task Description</Title>
                <Content>
                    <p>
                        In this part of the study, you will see several short scenarios that resemble an online movie platform. In
                        each scenario:
                    </p>
                    <List>
                        <li>
                            You will be presented with <Highlight>four genres</Highlight>, each containing a list of movies.
                        </li>
                        <li>
                            <Highlight>Explore</Highlight> the platform and possible movies as you normally would, and preferably pick a movie you
                            <Highlight> have not seen before</Highlight>.
                        </li>
                        <li>When you <Highlight>hover</Highlight> over a movie tile, more information will be shown.</li>
                        <li>
                            When you find a movie you would like to watch, click <Highlight>&ldquo;Watch now&rdquo;</Highlight>.
                        </li>
                        <li>
                            After making your selection, click <Highlight>&ldquo;Continue to questions&rdquo;</Highlight> and fill in the
                            questions about the scenario.
                        </li>
                    </List>
                    <p>
                        You will complete this process <Highlight>eight times</Highlight> in total. Each scenario may look slightly
                        different, but your task remains the same. There are <Highlight>no right or wrong answers</Highlight>! The time taken to decide is recorded, but please take the time you need for each scenario.
                    </p>
                </Content>
                <ButtonRow>
                    <Button variant="secondary" type="button" onClick={() => navigate("/demographics")}>
                        Back to demographics
                    </Button>
                    <ActionsGroup>
                        {error ? (
                            <RetryLink type="button" onClick={retry} disabled={isLoading}>
                                Retry preparation
                            </RetryLink>
                        ) : null}
                        <Button type="button" onClick={handleStart} disabled={!canStart}>
                            {startLabel}
                        </Button>
                    </ActionsGroup>
                </ButtonRow>
            </Wrapper>
        </Page>
    );
}

export default Instructions;
