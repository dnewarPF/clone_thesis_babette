import React from "react";
import styled from "styled-components";

const Page = styled.main`
    min-height: 100vh;
    background: radial-gradient(circle at top, rgba(25, 25, 25, 0.75), #040404 65%);
    color: #ffffff;
    display: flex;
    justify-content: center;
    padding: clamp(2rem, 6vw, 5rem);
`;

const Wrapper = styled.section`
    width: 100%;
    max-width: 680px;
    background: rgba(14, 14, 14, 0.92);
    border-radius: 24px;
    padding: clamp(2rem, 4vw, 3.25rem);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);
    display: grid;
    gap: 1.6rem;
    text-align: left;
`;

const Title = styled.h1`
    margin: 0;
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 700;
`;

const Paragraph = styled.p`
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.6rem;
    color: #dddddd;
`;

function Completion() {
    return (
        <Page>
            <Wrapper>
                <Title>Thank you!</Title>
                <Paragraph>
                    We appreciate your time and attention throughout the experiment and questionnaire. This study forms
                    part of a master's thesis that examines which descriptive features on streaming platforms most
                    strongly influence decision-making, including elements such as the title, teaser image, genre,
                    rating, keywords and video preview of a movie.
                </Paragraph>
                <Paragraph>
                    The data you provided will help us compare how participants weigh these features across scenarios and
                    will contribute to academic insights on user experience and the design of user interfaces.
                </Paragraph>

                <Paragraph>
                    If you have any questions or concerns regarding this study, please contact me at{" "}
                    <a href="mailto:b.a.scheepers@students.uu.nl">b.a.scheepers@students.uu.nl</a> or my supervisor
                    Dr. A. Chatzimparmpas at{" "}
                    <a href="mailto:a.chatzimparmpas@uu.nl">a.chatzimparmpas@uu.nl</a>.
                </Paragraph>
                <Paragraph>
                    You may now close this window at your convenience.
                </Paragraph>
            </Wrapper>
        </Page>
    );
}

export default Completion;
