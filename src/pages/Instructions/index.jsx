import React from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";

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
    max-width: 920px;
    background: rgba(16, 16, 16, 0.92);
    border-radius: 22px;
    padding: clamp(2rem, 4vw, 3.5rem);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    display: grid;
    gap: 1.75rem;
`;

const Title = styled.h1`
    margin: 0;
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    font-weight: 700;
`;

const Paragraph = styled.p`
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.65rem;
    color: #dddddd;
`;

const Emphasis = styled.span`
    color: #f97316;
    font-weight: 600;
`;

const Steps = styled.ol`
    margin: 0;
    padding-left: 1.4rem;
    display: grid;
    gap: 1rem;
    font-size: 1rem;
    color: #cfcfcf;
    line-height: 1.55rem;
`;

const Note = styled.div`
    padding: 1.1rem 1.2rem;
    border-radius: 14px;
    background: rgba(229, 9, 20, 0.12);
    border: 1px solid rgba(229, 9, 20, 0.3);
    color: #ffecec;
    font-size: 0.95rem;
    line-height: 1.5rem;
`;

const CTA = styled.button`
    justify-self: flex-start;
    padding: 0.85rem 2.4rem;
    border-radius: 999px;
    border: none;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    background: #e50914;
    color: #0b0b0b;
    transition: transform 0.2s ease, background 0.2s ease;

    &:hover {
        transform: translateY(-3px);
        background: #f6121d;
    }

    &:focus-visible {
        outline: 3px solid #ffffff;
        outline-offset: 4px;
    }
`;

function Instructions() {
    const navigate = useNavigate();

    return (
        <Page>
            <Wrapper>
                <Title>Task Overview</Title>
                <Paragraph>
                    Each round shows 6 movie categories, every category containing 10 movies. The information you see
                    changes per round; sometimes you get adjectives, sometimes a video preview, sometimes a rating, or a
                    combination of these elements.
                </Paragraph>
                <Steps>
                    <li>Select <Emphasis>one</Emphasis> movie per round by clicking <Emphasis>Watch now</Emphasis>.</li>
                    <li>After your choice the card turns gray and the <Emphasis>Next round</Emphasis> button appears.</li>
                    <li>There are 8 rounds in total. Each round contains new, unique movies.</li>
                    <li>Take your time; we record how long each decision takes.</li>
                </Steps>
                <Note>
                    Tip: choose in a quiet environment and preferably use a laptop or desktop for the best overview.
                </Note>
                <Paragraph>
                    After the eight rounds we will ask you to fill out a short questionnaire to evaluate your experience.
                </Paragraph>
                <CTA onClick={() => navigate("/experiment")}>Start experiment</CTA>
            </Wrapper>
        </Page>
    );
}

export default Instructions;
