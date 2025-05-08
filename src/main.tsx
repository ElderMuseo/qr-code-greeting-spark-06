
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QuestionsProvider } from './contexts/QuestionsContext.tsx'

createRoot(document.getElementById("root")!).render(
  <QuestionsProvider>
    <App />
  </QuestionsProvider>
);
