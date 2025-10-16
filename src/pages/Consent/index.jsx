import React from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";

const Page = styled.main`
    min-height: 100vh;
    background: radial-gradient(circle at top, rgba(40, 40, 40, 0.6), #040404 55%);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(2rem, 6vw, 4rem);
`;

const Card = styled.section`
    max-width: 860px;
    width: 100%;
    background: rgba(10, 10, 10, 0.9);
    border-radius: 24px;
    padding: clamp(2rem, 4vw, 3.5rem);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);
    display: grid;
    gap: 1.75rem;
`;

const Title = styled.h1`
    margin: 0;
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    font-weight: 700;
`;

const Intro = styled.p`
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.6rem;
    color: #e6e6e6;
`;

const ConsentList = styled.ul`
    margin: 0;
    padding-left: 1.25rem;
    display: grid;
    gap: 0.85rem;
    font-size: 0.95rem;
    color: #d0d0d0;
    line-height: 1.45rem;
`;

const Highlight = styled.span`
    color: #f97316;
    font-weight: 600;
`;

const ButtonRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
`;

const Button = styled.button`
    padding: 0.75rem 1.75rem;
    border-radius: 999px;
    border: none;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
    background: ${({secondary}) => (secondary ? "transparent" : "#e50914")};
    color: ${({secondary}) => (secondary ? "#d0d0d0" : "#0b0b0b")};
    border: ${({secondary}) => (secondary ? "2px solid rgba(255,255,255,0.2)" : "none")};

    &:hover {
        transform: translateY(-2px);
        background: ${({secondary}) => (secondary ? "rgba(255,255,255,0.08)" : "#f6121d")};
        color: ${({secondary}) => (secondary ? "#ffffff" : "#0b0b0b")};
    }

    &:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 3px;
    }
`;

function Consent() {
    const navigate = useNavigate();

    return (
        <Page>
            <Card>
                <Title>Consent form</Title>
                <Intro>
                    Thank you for taking part in this study. Please read the statements below carefully before you
                    continue. By agreeing you confirm that you have read and understood the information.
                </Intro>
                <ConsentList>
                    <li>Your participation is entirely voluntary and you may stop at any time without giving a reason.</li>
                    <li>The collected data is used solely for research purposes and processed anonymously.</li>
                    <li>Please stay focused for roughly 15-20 minutes.</li>
                    <li><Highlight>No personal data is stored.</Highlight></li>
                </ConsentList>
                <Intro>
                    By agreeing you proceed to the task instructions. If you are unsure, you can return to the start
                    screen.
                </Intro>
                <ButtonRow>
                    <Button onClick={() => navigate("/instructions")}>I agree</Button>
                    <Button secondary onClick={() => navigate("/")}>I decline</Button>
                </ButtonRow>
            </Card>
        </Page>
    );
}

export default Consent;
