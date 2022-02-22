import React, { lazy, memo } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';

const IndexPage = lazy(() => import('./pages/'));
const ExampleErrorPage = lazy(() => import('./pages/error-boundary'));
const PrefetchPage = lazy(() => import('./pages/prefetch'));

const App = () => (
  <BrowserRouter>
    <header>
      <ul>
        <li>
          <NavLink to="/">overview</NavLink>
        </li>
        <li>
          <NavLink to="/error">use-error-boundary</NavLink>
        </li>
        <li>
          <NavLink to="/prefetch">datasource-prefetch</NavLink>
        </li>
      </ul>
    </header>
    <Routes>
      <Route path="/">
        <Route index element={<IndexPage />} />
      </Route>
      <Route path="/error">
        <Route index element={<ExampleErrorPage />} />
      </Route>
      <Route path="/prefetch">
        <Route index element={<PrefetchPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default memo(App);
