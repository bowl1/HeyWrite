
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  html {
    font-size: 100%;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Poppins", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 1rem;
  }


  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace;
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    html {
      font-size: 87.5%;
    }

    body {
      font-size: 1rem;
    }

    code {
      font-size: 0.75rem;
    }
  }
`;

export default GlobalStyle;