import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DocumentView from './pages/DocumentView';
import DiffView from './pages/DiffView';
import './index.css';

function App() {
  return (
    <Router>
      <div className="container">
        <header className="header">
          <a href="/" className="title-gradient" style={{ fontSize: '1.5rem' }}>
            VCS Docx
          </a>
          <nav>
            <a href="/" className="btn btn-outline">Dashboard</a>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/document/:id" element={<DocumentView />} />
            <Route path="/document/:id/diff/:v1/:v2" element={<DiffView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
