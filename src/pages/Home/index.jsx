import React from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";

const Page = styled.main`
    min-height: 100vh;
    background: linear-gradient(160deg, #050505 20%, #121212 100%);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(2rem, 6vw, 5rem);
`;

const Hero = styled.section`
    width: 100%;
    max-width: 960px;
    display: grid;
    gap: clamp(1.5rem, 3vw, 2.5rem);
`;

const Title = styled.h1`
    margin: 0;
    font-size: clamp(2.4rem, 5vw, 3.5rem);
    font-weight: 800;
    letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
    margin: 0;
    font-size: clamp(1.1rem, 2vw, 1.4rem);
    line-height: 1.7;
    color: #d9d9d9;
    max-width: 64ch;
`;

const CTA = styled.button`
    justify-self: flex-start;
    padding: 0.9rem 2.6rem;
    border-radius: 999px;
    border: none;
    font-size: 1rem;
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

const Meta = styled.div`
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    font-size: 0.95rem;
    color: #9f9f9f;
`;

function Home() {
    const navigate = useNavigate();

    return (
        <Page>
            <Hero>
                <Title>Welcome to the Film Choices Study</Title>
                <Subtitle>
                    We examine how people choose movies when the available information changes. You will complete eight
                    rounds, each showing a different combination of variables. Take your time; we record how long you
                    need to pick a movie.
                </Subtitle>
                <Meta>
                    <span>Duration: approx. 15-20 minutes</span>
                    <span>Setting: quiet space, audio optional</span>
                </Meta>
                <CTA onClick={() => navigate("/consent")}>Continue to consent</CTA>
            </Hero>
        </Page>
    );
}

export default Home;
