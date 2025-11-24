// Polyfill for findDOMNode to support react-quill with React 19
// This is a temporary workaround until react-quill supports React 19
// This file is imported early in main.jsx to ensure polyfill is available

// Note: We cannot directly patch ES module imports, so this polyfill
// is available but react-quill needs to be updated to use it, or
// we need to use a different approach like a Vite plugin or alias

// For now, this file just ensures the concept exists
// The actual fix may require updating react-quill or using a fork

