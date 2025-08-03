import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { store } from './store';
import Layout from './components/Layout';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Authors from './pages/Author';
import AuthorDetail from './pages/AuthorDetail';
import Genres from './pages/Genres';
import GenreDetail from './pages/GenreDetail';
import Trending from './pages/Trending';
import TopRated from './pages/TopRated';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

import './index.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes with layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="books" element={<Books />} />
              <Route path="books/:id" element={<BookDetail />} />
              <Route path="authors" element={<Authors />} />
              <Route path="authors/:id" element={<AuthorDetail />} />
              <Route path="genres" element={<Genres />} />
              <Route path="genres/:id" element={<GenreDetail />} />
              <Route path="trending" element={<Trending />} />
              <Route path="top-rated" element={<TopRated />} />
              
              {/* Protected routes */}
              <Route path="favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Route>

            {/* Auth routes without layout */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} /> 
          </Routes>

          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            className="toast-container"
          />
        </div>
      </Router>
    </Provider>
  );
};

export default App;