import React from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";
import {useExperimentPreload} from "../../utils/hooks/useExperimentPreload";

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
    max-width: 80ch;
`;

const ImportantNotice = styled.p`
    margin: 0;
    font-size: clamp(1.05rem, 2vw, 1.3rem);
    line-height: 1.6;
    color: #ffffff;
    font-weight: 600;
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

function Home() {
    const navigate = useNavigate();
    useExperimentPreload();

    return (
        <Page>
            <Hero>
                <Title>Welcome to Moviemind!</Title>
                <Subtitle>
                    Thank you for considering participating in my thesis experiment.
                    This study investigates how people make decisions in digital environments. The goal of this study is
                    to better understand the factors that influence user choices. More details about the specific purpose
                    will be provided after participation.
                </Subtitle>
                <ImportantNotice>
                    IMPORTANT: In order to participate in this study, you will need a laptop or desktop (i.e. no phones
                    or tablets) and around 10 to 15 minutes to finish the experiment.
                </ImportantNotice>
                <CTA onClick={() => navigate("/consent")}>Continue</CTA>
            </Hero>
        </Page>
    );
}

export default Home;
