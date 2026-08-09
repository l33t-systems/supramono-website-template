import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import BlogIndex from "./pages/BlogIndex";
import BlogPostPage from "./pages/BlogPostPage";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Page from "./pages/Page";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/contact" element={<Contact />} />
        {/* Any other CMS page by slug — /about, /pricing, ... */}
        <Route path="/:slug" element={<Page />} />
      </Routes>
    </Layout>
  );
}
