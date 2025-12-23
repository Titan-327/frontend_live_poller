import { BrowserRouter, Routes, Route } from "react-router-dom";
import PollPage from "./pages/pollpage.jsx"
import Dashboard from "./pages/Dashboard";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CreatePoll from "./pages/CreatePoll.jsx";


function App() {

  return (
      <BrowserRouter>
     <Routes>
  <Route path="/" element={<Login />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/create-poll" element={<CreatePoll />} />
  <Route path="/poll/:pollId" element={<PollPage />} />
</Routes>

    </BrowserRouter>
  )
}

export default App
