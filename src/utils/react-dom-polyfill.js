// Polyfill for findDOMNode to support react-quill with React 19
// This is a temporary workaround until react-quill supports React 19
// Import react-dom to patch it before react-quill loads
import * as ReactDOM from 'react-dom';

// Create a polyfill function for findDOMNode
const createFindDOMNodePolyfill = () => {
  return function findDOMNode(node) {
    if (node == null) {
      return null;
    }
    
    // If it's already a DOM node, return it
    if (node.nodeType === 1) {
      return node;
    }
    
    // If it's a ref object with current property
    if (node && typeof node === 'object' && 'current' in node) {
      return node.current;
    }
    
    // Try to get the DOM node from React fiber
    // This is a simplified version that may not work in all cases
    if (node && typeof node === 'object') {
      // Try common React internal properties
      const fiberNode = node._reactInternalFiber || 
                       node._reactInternalInstance || 
                       node._owner?.stateNode ||
                       (node.__reactInternalInstance ? node.__reactInternalInstance.stateNode : null);
      
      if (fiberNode) {
        if (fiberNode.nodeType === 1) {
          return fiberNode;
        }
        // Try to get the actual DOM element from the fiber
        if (fiberNode.stateNode && fiberNode.stateNode.nodeType === 1) {
          return fiberNode.stateNode;
        }
      }
      
      // Try to find the DOM element using a different approach
      if (typeof node.getDOMNode === 'function') {
        return node.getDOMNode();
      }
    }
    
    // Last resort: try to use a querySelector if the node has some identifier
    // This is not ideal but might work in some cases
    console.warn('findDOMNode polyfill: Could not find DOM node for', node);
    return null;
  };
};

// Monkey-patch findDOMNode for react-quill compatibility
if (typeof window !== 'undefined') {
  // Patch react-dom
  if (!ReactDOM.findDOMNode) {
    ReactDOM.findDOMNode = createFindDOMNodePolyfill();
  }
  
  // Also patch the default export if it exists
  if (ReactDOM.default && !ReactDOM.default.findDOMNode) {
    ReactDOM.default.findDOMNode = ReactDOM.findDOMNode;
  }
  
  // Try to also patch react-dom/client if needed
  try {
    const ReactDOMClient = require('react-dom/client');
    if (ReactDOMClient && !ReactDOMClient.findDOMNode) {
      ReactDOMClient.findDOMNode = ReactDOM.findDOMNode;
    }
  } catch (e) {
    // Ignore if react-dom/client is not available
  }
}

export default ReactDOM;

