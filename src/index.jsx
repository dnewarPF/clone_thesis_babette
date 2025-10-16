import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {BrowserRouter as Router} from 'react-router-dom'
import Footer from "./components/Footer";
import {Route, Routes} from "react-router";
import Movie from "./pages/Movie";
import Home from "./pages/Home";
import Consent from "./pages/Consent";
import Instructions from "./pages/Instructions";
import Movies from "./pages/Movies";
import Questionnaire from "./pages/Questionnaire";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
    <Router>
        <Routes>
            <Route exact path="/" element={<Home/>}>
            </Route>
            <Route exact path="/consent" element={<Consent/>}>
            </Route>
            <Route exact path="/instructions" element={<Instructions/>}>
            </Route>
            <Route exact path="/experiment" element={<Movies />}>
            </Route>
            <Route exact path="/movieDetails/:id/:type" element={ <Movie />}>
            </Route>
            <Route exact path="/questionnaire" element={<Questionnaire/>}>
            </Route>
        </Routes>
        <Footer />
    </Router>
    </React.StrictMode>
);
